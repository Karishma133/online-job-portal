// 1. Sabse pehle dotenv config import karna zaroori hai taaki keys load ho sakein
import 'dotenv/config' 
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'

passport.serializeUser((user, done) => done(null, user._id))
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (err) {
    done(err, null)
  }
})

// Ab process.env ko saari keys mil jayengi bina kisi dikkat ke
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase()
        if (!email) return done(new Error('Google account has no email'), null)

        // Match an existing account by googleId first, then by email
        let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] })

        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id
            if (!user.avatar && profile.photos?.[0]?.value) user.avatar = profile.photos[0].value
            await user.save()
          }
        } else {
          user = await User.create({
            name: profile.displayName || email.split('@')[0],
            email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value || '',
            role: 'student', 
          })
        }

        return done(null, user)
      } catch (err) {
        return done(err, null)
      }
    }
  ))
} else {
  console.warn('⚠️  Google OAuth not configured (GOOGLE_CLIENT_ID/SECRET missing) — "Continue with Google" will be disabled until you add them to .env')
}

export default passport