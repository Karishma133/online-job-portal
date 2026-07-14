// ---------------------------------------------------------------------------
// Auto-Response Engine
// ---------------------------------------------------------------------------
// Problem this solves: students apply to dozens of jobs and recruiters often
// never open the "New applicant" email, so students hear nothing for weeks.
//
// This engine guarantees every applicant gets a CONCRETE response within
// 24 hours, with two layers:
//
//  1. INSTANT layer (runs the moment applyToJob fires):
//     If the candidate's skill-match % is high enough, we don't wait for the
//     recruiter at all — we auto-shortlist them and auto-book an interview
//     slot right away.
//
//  2. 24-HOUR GUARANTEE layer (runs on a cron schedule, see scheduler.js):
//     For every application still sitting untouched ~24h after being
//     submitted, the system steps in and either auto-books an interview
//     (decent match) or sends an explicit "still under review" update
//     (weak match) — plus a nudge email to the recruiter. Either way the
//     student is never left wondering.
// ---------------------------------------------------------------------------

import Application from '../models/Application.js'
import Notification from '../models/Notification.js'
import { sendEmail, emailTemplates } from './emailService.js'

// Tune these to taste
export const INSTANT_INTERVIEW_THRESHOLD = 75 // %, auto-interview immediately on apply
export const GUARANTEE_INTERVIEW_THRESHOLD = 45 // %, auto-interview if recruiter is silent for 24h
export const RESPONSE_WINDOW_HOURS = 24

const HOUR_MS = 60 * 60 * 1000

/**
 * Picks the next available "business hour" interview slot, `hoursFromNow`
 * hours out, skipping weekends and landing between 10am-5pm.
 */
export function pickInterviewSlot(hoursFromNow = 24) {
  const slot = new Date(Date.now() + hoursFromNow * HOUR_MS)

  // Push to the next weekday if it lands on Sat/Sun
  const day = slot.getDay()
  if (day === 6) slot.setDate(slot.getDate() + 2) // Sat -> Mon
  if (day === 0) slot.setDate(slot.getDate() + 1) // Sun -> Mon

  // Pin to a clean business-hour slot (10:00, 12:00, 2:00, 4:00 PM), chosen
  // deterministically from the application id-ish timestamp so slots spread out
  const slotHours = [10, 12, 14, 16]
  const chosenHour = slotHours[Math.floor(Math.random() * slotHours.length)]
  slot.setHours(chosenHour, 0, 0, 0)

  return slot
}

/**
 * Layer 1 — called synchronously from applyToJob right after an
 * Application is created. Decides whether the candidate is strong enough
 * to skip the queue entirely and get an instant interview slot.
 * Mutates and saves `application` if it acts. Returns true if it acted.
 */
export async function instantAutoRespond(application, job, applicant) {
  if (application.matchPercent < INSTANT_INTERVIEW_THRESHOLD) return false

  const interviewDate = pickInterviewSlot(24) // always at least 24h out, so recruiter can still override
  application.status = 'INTERVIEW'
  application.interviewDate = interviewDate
  application.interviewMode = 'Online'
  application.interviewNote = 'Auto-scheduled instantly based on your strong skill match. The recruiter can reschedule if needed.'
  application.autoResponded = true
  await application.save()

  await Notification.create({
    user: applicant._id,
    type: 'APPLICATION_STATUS',
    title: '⚡ Instant interview scheduled!',
    message: `Your ${application.matchPercent}% skill match for "${job.title}" was strong enough to auto-book an interview.`,
    link: '/dashboard',
  })

  // Let the recruiter know too, so they can confirm/reschedule
  await Notification.create({
    user: job.postedBy,
    type: 'NEW_APPLICANT',
    title: 'Auto-scheduled interview (please confirm)',
    message: `${applicant.name} (${application.matchPercent}% match) was auto-booked for an interview on "${job.title}". Review and reschedule if needed.`,
    link: `/jobs/${job._id}/applicants`,
  })

  if (applicant.emailAlerts) {
    await sendEmail(
      applicant.email,
      emailTemplates.interviewScheduled(applicant.name, job.title, job.company, interviewDate, application.interviewMode)
    )
  }

  return true
}

/**
 * Layer 2 — run on a schedule (every 30 min is plenty). Finds applications
 * that are past the 24h response window and still untouched by a human
 * recruiter, then forces a concrete response for each one.
 */
export async function run24HourGuaranteeSweep() {
  const cutoff = new Date(Date.now() - RESPONSE_WINDOW_HOURS * HOUR_MS)

  const stale = await Application.find({
    status: 'APPLIED',
    autoResponded: false,
    createdAt: { $lte: cutoff },
  })
    .populate('job')
    .populate('applicant', 'name email emailAlerts')

  let processed = 0
  for (const app of stale) {
    if (!app.job || !app.applicant) continue // orphaned record safety check

    if (app.matchPercent >= GUARANTEE_INTERVIEW_THRESHOLD) {
      // Decent-enough match sitting untouched for 24h -> auto-book interview
      const interviewDate = pickInterviewSlot(24)
      app.status = 'INTERVIEW'
      app.interviewDate = interviewDate
      app.interviewMode = 'Online'
      app.interviewNote = 'The recruiter had not responded within 24h, so we auto-scheduled an interview to keep things moving.'
      app.autoResponded = true
      await app.save()

      await Notification.create({
        user: app.applicant._id,
        type: 'APPLICATION_STATUS',
        title: '📅 Interview auto-scheduled (24h guarantee)',
        message: `No word yet from the recruiter for "${app.job.title}", so we booked you an interview automatically.`,
        link: '/dashboard',
      })

      if (app.applicant.emailAlerts) {
        await sendEmail(
          app.applicant.email,
          emailTemplates.interviewScheduled(app.applicant.name, app.job.title, app.job.company, interviewDate, app.interviewMode)
        )
      }
    } else {
      // Weak match — be honest, but still give a firm answer within 24h
      app.autoResponded = true
      app.recruiterReminderSent = true
      await app.save()

      await Notification.create({
        user: app.applicant._id,
        type: 'APPLICATION_STATUS',
        title: 'Update on your application',
        message: `Your application for "${app.job.title}" is still being reviewed by the recruiter. We'll notify you the moment that changes.`,
        link: '/dashboard',
      })

      if (app.applicant.emailAlerts) {
        await sendEmail(
          app.applicant.email,
          emailTemplates.underReview(app.applicant.name, app.job.title, app.job.company)
        )
      }
    }

    // Nudge the recruiter either way, so silent inboxes stop staying silent.
    // (Safe to send unconditionally here — the query above only ever picks up
    // each application once, since autoResponded flips to true right above.)
    await Notification.create({
      user: app.job.postedBy,
      type: 'NEW_APPLICANT',
      title: 'Reminder: pending application needs review',
      message: `${app.applicant.name}'s application for "${app.job.title}" has been waiting 24h+. Please review it.`,
      link: `/jobs/${app.job._id}/applicants`,
    })

    processed++
  }

  return processed
}
