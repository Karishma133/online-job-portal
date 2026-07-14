# 🚀 SkillMatch — MNC-Level Job Portal

A world-class full-stack job portal with AI features, real-time chat, and analytics.

## ✨ All Features
- 🌙 Dark / Light Mode
- 🔐 Google OAuth Login
- 🤖 AI Resume Analyzer (Claude AI)
- 📝 AI Cover Letter Generator
- 📊 ATS Score Checker (MNC-ready)
- 🎯 Skill Match Engine (% badge)
- 📚 Skill Gap Roadmap
- 💡 Interview Preparation (English Q&A)
- 💰 Salary Predictor
- 💬 Real-time Chat (Recruiter ↔ Student)
- 🔔 Email Notifications
- 📈 Analytics Dashboard (Recruiter + Admin)
- ⭐ Company Reviews
- 🎁 Referral System
- 🔔 Live Job Alerts
- 👤 LinkedIn-style Profile (Education, Experience, Projects)
- 📱 Mobile Responsive
- 🏢 Admin Super Dashboard

## 🛠️ Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your values
node utils/seed.js   # optional demo data
npm run dev          # port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev          # port 3000
```

## 🌐 Deploy
- Frontend → vercel.com
- Backend → render.com
- Database → mongodb.com/atlas

## Demo Logins (after seed)
| Role      | Email               | Password    |
|-----------|---------------------|-------------|
| Student   | student@demo.com    | password123 |
| Recruiter | recruiter@demo.com  | password123 |
| Admin     | admin@demo.com      | password123 |

## .env Keys Needed
| Key | Where to get |
|-----|-------------|
| MONGO_URI | mongodb.com/atlas (free) |
| JWT_SECRET | any random long string |
| GOOGLE_CLIENT_ID | console.cloud.google.com |
| ANTHROPIC_API_KEY | console.anthropic.com |
| EMAIL_USER/PASS | Gmail App Password |
