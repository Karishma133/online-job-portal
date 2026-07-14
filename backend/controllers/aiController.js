// ---------------------------------------------------------------------------
// "AI" features, rule-based
// ---------------------------------------------------------------------------
// These used to call the Anthropic API directly, which needs a paid key.
// They now run on plain algorithms/heuristics instead — no API key, no
// subscription, no per-request cost. See utils/resumeAnalyzer.js,
// utils/coverLetterGenerator.js, and utils/interviewAndSkillsBank.js for
// the actual logic; this file just wires them up to HTTP routes.
// ---------------------------------------------------------------------------

import asyncHandler from 'express-async-handler'
import { analyzeResumeText } from '../utils/resumeAnalyzer.js'
import { generateCoverLetterText } from '../utils/coverLetterGenerator.js'
import { getInterviewQuestions, suggestSkillsForRole } from '../utils/interviewAndSkillsBank.js'

// @desc    Analyze resume text against job skills
// @route   POST /api/ai/analyze-resume
export const analyzeResume = asyncHandler(async (req, res) => {
  const { resumeText, jobSkills = [], jobTitle = '' } = req.body
  if (!resumeText) {
    res.status(400); throw new Error('Resume text is required')
  }

  const analysis = analyzeResumeText(resumeText, jobSkills, jobTitle)
  res.json({ success: true, analysis })
})

// @desc    Generate cover letter
// @route   POST /api/ai/cover-letter
export const generateCoverLetter = asyncHandler(async (req, res) => {
  const { jobTitle, company, jobDescription, userSkills = [], userName = '' } = req.body
  if (!jobTitle || !company) {
    res.status(400); throw new Error('Job title and company are required')
  }

  const coverLetter = generateCoverLetterText({ jobTitle, company, jobDescription, userSkills, userName })
  res.json({ success: true, coverLetter })
})

// @desc    Generate interview questions for a job
// @route   POST /api/ai/interview-questions
export const generateInterviewQuestions = asyncHandler(async (req, res) => {
  const { jobTitle, requiredSkills = [] } = req.body
  if (!jobTitle) {
    res.status(400); throw new Error('Job title is required')
  }

  const questions = getInterviewQuestions(jobTitle, requiredSkills)
  res.json({ success: true, questions })
})

// @desc    Suggest skills for a job title
// @route   POST /api/ai/suggest-skills
export const suggestSkills = asyncHandler(async (req, res) => {
  const { jobTitle } = req.body
  if (!jobTitle) {
    res.status(400); throw new Error('Job title is required')
  }

  const skills = suggestSkillsForRole(jobTitle)
  res.json({ success: true, skills })
})
