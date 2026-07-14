# SkillMatch — Backend

REST API powering the SkillMatch job portal — auth, job postings, applications,
and the skill-match recommendation engine.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # then edit MONGO_URI / JWT_SECRET if needed
```

You need a running MongoDB instance. Either:
- Install MongoDB locally and keep `MONGO_URI=mongodb://127.0.0.1:27017/skillmatch`, or
- Use [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier) and paste the connection string into `.env`

```bash
npm run dev      # starts with nodemon on http://localhost:5000
```

### Seed sample data (optional but recommended)

```bash
node utils/seed.js
```

Creates a recruiter, a student, an admin, and 3 sample jobs so you can log in
and test immediately:

| Role      | Email               | Password    |
|-----------|---------------------|-------------|
| Recruiter | recruiter@demo.com  | password123 |
| Student   | student@demo.com    | password123 |
| Admin     | admin@demo.com      | password123 |

## Structure

```
backend/
├── config/db.js              → MongoDB connection
├── models/                   → User, Job, Application, Notification (Mongoose schemas)
├── controllers/               → All route logic
├── routes/                   → Express routers, mounted in server.js
├── middleware/
│   ├── authMiddleware.js      → JWT verification (protect, optionalAuth)
│   ├── roleMiddleware.js      → authorize('student' | 'recruiter' | 'admin')
│   ├── uploadMiddleware.js    → multer config for resume/avatar uploads
│   └── errorMiddleware.js     → centralized error handler
├── utils/
│   ├── skillMatchEngine.js    → core matching logic (mirrors frontend's skillMatcher.js)
│   ├── generateToken.js       → JWT signing
│   └── seed.js                → sample data script
├── uploads/                  → uploaded resumes & avatars (served at /uploads/*)
└── server.js                 → app entry point
```

## API Routes

| Method | Route                          | Access            | Description |
|--------|---------------------------------|--------------------|--------------|
| POST   | /api/auth/register              | Public             | Create account |
| POST   | /api/auth/login                 | Public             | Login, get JWT |
| GET    | /api/auth/me                    | Private            | Current user |
| GET    | /api/jobs                       | Public             | List jobs (filters, search, pagination) |
| GET    | /api/jobs/my                    | Recruiter          | Jobs posted by me |
| GET    | /api/jobs/:id                   | Public             | Job detail |
| GET    | /api/jobs/:id/applicants        | Recruiter (owner)  | Applicants, ranked by match % |
| POST   | /api/jobs                       | Recruiter          | Create job |
| PUT    | /api/jobs/:id                   | Recruiter (owner)  | Update job |
| DELETE | /api/jobs/:id                   | Recruiter (owner)  | Delete job |
| PUT    | /api/users/profile               | Private            | Update profile/skills |
| POST   | /api/users/resume                | Student            | Upload resume (PDF) |
| POST   | /api/users/avatar                | Private            | Upload avatar |
| GET    | /api/users/applications           | Student            | My applications |
| GET    | /api/users/all                   | Admin              | All users |
| DELETE | /api/users/:id                   | Admin              | Remove user |
| POST   | /api/applications/:jobId          | Student            | Apply to a job |
| DELETE | /api/applications/:appId          | Student (owner)    | Withdraw application |
| PUT    | /api/applications/:appId/status   | Recruiter (owner)  | Move applicant through pipeline |
| GET    | /api/recommend/jobs               | Student            | Skill-matched recommendations |

## How the skill match engine works

`utils/skillMatchEngine.js` exports `calculateMatch(userSkills, jobSkills)`,
which is used in three places:

1. `jobController.getJobs` / `getJobById` — attaches `matchPercent` to each job for logged-in students
2. `applicationController.applyToJob` — snapshots the match % at the time of applying
3. `recommendController.getRecommendedJobs` — filters + ranks jobs above a 20% match threshold

This mirrors `frontend/src/utils/skillMatcher.js` exactly, so the % you see
in the UI before applying matches what gets stored on the application.

## Connecting to the frontend

The frontend's Vite dev server proxies `/api/*` to `http://localhost:5000`
(see `frontend/vite.config.js`), so as long as both servers are running
(`npm run dev` in both folders), everything connects automatically — no
extra config needed.
