import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import http from 'http'
import session from 'express-session'
import { fileURLToPath } from 'url'

import connectDB from './config/db.js'
import passportConfig from './config/passport.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'
import { startAutoResponseScheduler } from './utils/scheduler.js'
import { attachInterviewSocket } from './utils/interviewSocket.js'

import authRoutes        from './routes/authRoutes.js'
import jobRoutes         from './routes/jobRoutes.js'
import userRoutes        from './routes/userRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'
import recommendRoutes   from './routes/recommendRoutes.js'
import reviewRoutes      from './routes/reviewRoutes.js'
import aiRoutes          from './routes/aiRoutes.js'
import chatRoutes        from './routes/chatRoutes.js'
import analyticsRoutes   from './routes/analyticsRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'

dotenv.config()
console.log('DEBUG CALLBACK URL:', process.env.GOOGLE_CALLBACK_URL)
connectDB()

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(session({
  secret: process.env.SESSION_SECRET || 'skillmatch_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 },
}))
app.use(passportConfig.initialize())
app.use(passportConfig.session())
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth',         authRoutes)
app.use('/api/jobs',         jobRoutes)
app.use('/api/users',        userRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/recommend',    recommendRoutes)
app.use('/api/reviews',      reviewRoutes)
app.use('/api/ai',           aiRoutes)
app.use('/api/chat',         chatRoutes)
app.use('/api/analytics',    analyticsRoutes)
app.use('/api/notifications', notificationRoutes)

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: '🚀 SkillMatch API v2.0 running' })
})

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
const server = http.createServer(app)
attachInterviewSocket(server, process.env.CLIENT_URL)

server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
  console.log(`🎥 Live interview signaling ready (Socket.io)`)
  startAutoResponseScheduler()
})
