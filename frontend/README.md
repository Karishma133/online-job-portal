# SkillMatch — Frontend

A job portal where every listing shows a live **skill-match %** calculated from the
logged-in student's profile, instead of plain keyword search.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`. API calls to `/api/*` are proxied to
`http://localhost:5000` (the backend) — see `vite.config.js`.

## Structure

```
src/
├── components/
│   ├── common/      → Navbar, Footer, Loader, ProtectedRoute, Toast
│   ├── job/          → JobCard, JobFilter, JobDetailModal, SkillMatchBadge
│   ├── profile/      → SkillsInput, ResumeUpload, ProfileCompletion
│   └── dashboard/    → StatsCard, ApplicationTracker, RecommendedJobs
├── pages/             → Home, Login, Register, Jobs, JobDetail, PostJob, Profile,
│                         dashboard/StudentDashboard, dashboard/RecruiterDashboard,
│                         admin/AdminPanel, NotFound
├── context/           → AuthContext, JobContext
├── hooks/             → useAuth, useJob, useJobSearch, useSkillMatch
├── services/          → api.js (axios), authService, jobService, userService
└── utils/             → skillMatcher.js (core matching logic), constants, helpers
```

## The core feature: skill matching

`src/utils/skillMatcher.js` exports `calculateSkillMatch(userSkills, jobSkills)`,
which returns `{ percent, matched, missing, label, color }`. This single function
powers:

- The circular badge on every `JobCard`
- The detailed match panel on `JobDetail`
- `RecommendedJobs` (sorted by match %)
- `ProfileCompletion`'s nudge to add more skills

Everything else (auth, filters, applications, dashboards) is built around this.

## What still needs the backend

This frontend expects a REST API at `/api` with routes matching
`services/*.js`: `/auth/*`, `/jobs/*`, `/users/*`, `/applications/*`, `/recommend/*`.
Build that next using the structure you already have planned (`models/`,
`controllers/`, `routes/`, `middleware/`).
