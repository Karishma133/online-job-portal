import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineSparkles, HiOutlineSearch, HiOutlineLightningBolt,
  HiOutlineArrowRight, HiOutlineAcademicCap, HiOutlineShieldCheck,
  HiOutlineTrendingUp, HiCheck, HiOutlineArrowSmRight, HiOutlineLocationMarker,
} from 'react-icons/hi'
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import { FcGoogle } from 'react-icons/fc'
import { FiBox, FiCpu, FiCloud, FiTrendingUp, FiLayers, FiGlobe, FiZap } from 'react-icons/fi'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// The mock job used inside the hero's "Match Card" — deliberately concrete
// (a real title, real skills) rather than lorem-ipsum, since the whole
// product's pitch is that the match score is computed, not decorative.
const demoJob = {
  title: 'Frontend Developer Intern',
  company: 'Nimbus Labs',
  matched: ['React', 'Tailwind CSS', 'Git'],
  missing: ['GraphQL'],
  percent: 87,
}

const steps = [
  { icon: <HiOutlineAcademicCap />,   title: 'Add your skills',       desc: 'Tell us what you know — from React to public speaking.' },
  { icon: <HiOutlineSearch />,        title: 'Browse matched jobs',    desc: 'See a live % match score on every job, calculated from your skills.' },
  { icon: <HiOutlineLightningBolt />, title: 'Apply with confidence',  desc: 'Know exactly where you stand before you hit apply.' },
]

const features = [
  { icon: <HiOutlineSparkles />,      title: 'AI Resume Analyzer',    desc: 'Instant, free resume analysis that tells you what\'s missing.' },
  { icon: <HiOutlineTrendingUp />,    title: 'Salary Predictor',       desc: 'Know your market worth before you negotiate.' },
  { icon: <HiOutlineShieldCheck />,   title: 'Interview Prep',         desc: 'Skill-based interview questions with sample answers.' },
  { icon: <HiOutlineBuildingOffice2 />, title: 'Company Reviews',      desc: 'Real student reviews before you apply.' },
]

const trending = ['React Developer', 'Data Analyst Intern', 'UI/UX Design', 'Remote']

const stats = [
  { value: '12,400+', label: 'Active job listings' },
  { value: '3,200+',  label: 'Companies hiring' },
  { value: '92%',     label: 'Match accuracy' },
]

/**
 * A conic-gradient ring built from plain CSS (no chart library) that fills
 * to `percent`. This is the homepage's signature element — it's the same
 * visual the product shows on every real job card, just staged front and
 * center to make the pitch concrete instead of describing it in prose.
 */
function MatchRing({ percent }) {
  return (
    <div className="relative w-24 h-24 shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#234ddb ${percent * 3.6}deg, #e2e8f0 ${percent * 3.6}deg)`,
        }}
      />
      <div className="absolute inset-[6px] rounded-full bg-white dark:bg-surface-900 flex flex-col items-center justify-center">
        <span className="font-mono font-bold text-xl text-primary-700 dark:text-primary-300 tnum">{percent}%</span>
        <span className="text-[9px] uppercase tracking-wide text-surface-400">match</span>
      </div>
    </div>
  )
}

/** The signature hero visual: a real student photo with the match mechanic
 *  floating on top of it, so the pitch is concrete instead of abstract. */
function MatchCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative w-full max-w-[420px]"
    >
      <div className="rounded-3xl overflow-hidden shadow-elevated border border-surface-100 dark:border-surface-800 aspect-[4/5]">
        <img
          src="https://images.unsplash.com/photo-1758270705290-62b6294dd044?fm=jpg&q=70&w=900&auto=format&fit=crop"
          alt="Student reviewing job matches on a laptop"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Floating match-card widget, anchored over the photo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="card !p-4 absolute -bottom-6 -left-6 w-[240px] shadow-elevated border-surface-100 dark:border-surface-800"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="font-display font-semibold text-sm text-surface-900 dark:text-white leading-tight">{demoJob.title}</p>
            <p className="text-[11px] text-surface-400 mt-0.5">{demoJob.company}</p>
          </div>
          <MatchRing percent={demoJob.percent} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {demoJob.matched.slice(0, 2).map((s) => (
            <span key={s} className="skill-tag !text-[10px] !py-0.5 !bg-accent-400/10 !text-accent-600 !border-accent-400/30 flex items-center gap-1">
              <HiCheck className="text-[11px]" /> {s}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Small floating confirmation chip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.85 }}
        className="card !p-3 !rounded-xl absolute -top-5 -right-5 flex items-center gap-2 shadow-elevated border-surface-100 dark:border-surface-800"
      >
        <span className="w-7 h-7 rounded-full bg-accent-400/15 text-accent-600 flex items-center justify-center text-sm shrink-0">
          <HiCheck />
        </span>
        <div className="pr-1">
          <p className="text-xs font-semibold text-surface-900 dark:text-white leading-none whitespace-nowrap">Interview booked</p>
          <p className="text-[10px] text-surface-400 mt-0.5">Auto-scheduled in 24h</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (location) params.set('location', location)
    navigate(`/jobs?${params.toString()}`)
  }

  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white dark:bg-surface-950">
        <div className="absolute inset-0 bg-signature-grid opacity-70 dark:opacity-10 pointer-events-none" />
        {/* Glowing orb — dark-mode-only ambient light behind the headline */}
        <div className="hidden dark:block absolute top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px]
                        bg-primary-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="container-app px-4 pt-16 md:pt-24 pb-20 md:pb-28 relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
            {/* Copy */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="badge-primary mb-5 text-xs md:text-sm">
                <HiOutlineSparkles /> Skill-matched job search
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-semibold text-surface-900 dark:text-white
                             tracking-tight leading-[1.05]">
                Stop guessing if{' '}
                <span className="text-gradient">you're qualified.</span>
              </h1>

              <p className="text-surface-500 dark:text-surface-400 text-base md:text-lg mt-5 max-w-lg leading-relaxed">
                SkillMatch scores every job against your actual profile — not keywords —
                so you know exactly where you stand before you hit apply.
              </p>

              {/* Unified search bar */}
              <form
                onSubmit={handleSearch}
                className="w-full max-w-xl mt-8 p-2 rounded-2xl bg-white dark:bg-surface-900/70 dark:backdrop-blur-xl
                          border border-surface-200 dark:border-surface-800 shadow-card
                          flex flex-col sm:flex-row gap-2"
              >
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2 border-b sm:border-b-0 sm:border-r border-surface-100 dark:border-surface-800">
                  <HiOutlineSearch className="text-primary-500 shrink-0" />
                  <input
                    type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Job title or skill..."
                    className="w-full bg-transparent text-sm outline-none placeholder-surface-400 text-surface-800 dark:text-surface-100"
                  />
                </div>
                <div className="flex-1 flex items-center gap-2.5 px-3 py-2">
                  <HiOutlineLocationMarker className="text-accent-500 shrink-0" />
                  <input
                    type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location or 'Remote'..."
                    className="w-full bg-transparent text-sm outline-none placeholder-surface-400 text-surface-800 dark:text-surface-100"
                  />
                </div>
                <button type="submit" className="btn btn-primary justify-center shrink-0">
                  Search <HiOutlineArrowRight />
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-xs text-surface-400">
                <span>Trending:</span>
                {trending.map((t) => (
                  <button
                    key={t}
                    onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(t)}`)}
                    className="text-surface-500 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-6">
                <Link to="/register" className="btn btn-primary btn-lg justify-center">
                  Get matched <HiOutlineArrowRight />
                </Link>
                <button
                  onClick={() => { window.location.href = `${BACKEND}/api/auth/google` }}
                  className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl
                             border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800
                             text-surface-700 dark:text-surface-200 font-medium text-base
                             hover:bg-surface-50 dark:hover:bg-surface-700 transition-all"
                >
                  <FcGoogle className="text-xl" /> Continue with Google
                </button>
              </div>

              <p className="text-xs text-surface-400 mt-4">Free forever for students · No credit card needed</p>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
                className="flex gap-8 mt-10 pt-8 border-t border-surface-200 dark:border-surface-800"
              >
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-xl md:text-2xl font-mono font-bold text-surface-900 dark:text-white tnum">{s.value}</p>
                    <p className="text-[11px] md:text-xs text-surface-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Signature visual */}
            <div className="hidden lg:flex justify-center">
              <MatchCard />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trusted by ── */}
      <section className="py-10 border-y border-surface-100 dark:border-surface-800 bg-white dark:bg-surface-950">
        <div className="container-app px-4">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wider text-surface-400 mb-6">
            Popular employers on SkillMatch
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { name: 'TechNova',      Icon: FiBox,        color: '#FF9900' },
              { name: 'Cloudify Inc.', Icon: FiCloud,      color: '#00A4EF' },
              { name: 'Nexora Labs',   Icon: FiCpu,        color: '#4285F4' },
              { name: 'Vertex Systems',Icon: FiLayers,     color: '#007CC3' },
              { name: 'Orbitly',       Icon: FiGlobe,      color: '#0070AD' },
              { name: 'Zenith Digital',Icon: FiTrendingUp, color: '#A100FF' },
              { name: 'Sparkline Tech',Icon: FiZap,        color: '#341F97' },
            ].map(({ name, Icon, color }) => (
              <div key={name}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-100 dark:border-surface-800
                          bg-surface-50 dark:bg-surface-900 hover:-translate-y-0.5 hover:shadow-card
                          transition-all duration-200">
                <Icon className="text-lg" style={{ color }} />
                <span className="font-medium text-sm text-surface-700 dark:text-surface-300">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section bg-surface-50 dark:bg-surface-900">
        <div className="container-app px-4">
          <div className="mb-10 md:mb-12 max-w-lg">
            <h2 className="page-title text-2xl md:text-3xl">Three steps. No keyword guesswork.</h2>
          </div>

          <div className="relative grid sm:grid-cols-3 gap-8 sm:gap-5">
            {/* Connecting line — only makes sense because this genuinely is an ordered process */}
            <div className="hidden sm:block absolute top-6 left-[16%] right-[16%] h-px bg-surface-200 dark:bg-surface-800" />

            {steps.map((step, i) => (
              <motion.div key={step.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-surface-900 border-2 border-primary-600
                                text-primary-600 flex items-center justify-center text-xl mb-5 relative z-10">
                  {step.icon}
                </div>
                <span className="font-mono text-xs text-primary-600 dark:text-primary-400 font-semibold">0{i + 1}</span>
                <h3 className="font-display font-semibold text-lg text-surface-900 dark:text-white mt-1 mb-1.5">{step.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section bg-white dark:bg-surface-950">
        <div className="container-app px-4">
          <div className="text-center mb-10">
            <h2 className="page-title text-2xl md:text-3xl">Everything you need</h2>
            <p className="page-subtitle">Built specifically for students and fresh grads</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                className="card-hover flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xl shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-display font-semibold text-surface-900 dark:text-white mb-1">{f.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── For recruiters ── */}
      <section className="section bg-surface-50 dark:bg-surface-900">
        <div className="container-app px-4">
          <div className="bg-surface-900 dark:bg-surface-950 text-white rounded-3xl px-6 md:px-12 py-10 md:py-12
                          grid md:grid-cols-2 gap-8 items-center border border-surface-800">
            <div>
              <span className="badge bg-white/10 text-white mb-4 text-xs border-white/10">
                <HiOutlineBuildingOffice2 /> For recruiters
              </span>
              <h2 className="text-2xl md:text-3xl font-display font-semibold mb-3">
                Hire from a pool that's already qualified
              </h2>
              <p className="text-surface-300 leading-relaxed text-sm md:text-base">
                Post a role, list the skills you need, and see applicants ranked by
                how closely their profile matches — before you open a single resume.
              </p>
              <Link to="/register" className="btn bg-white text-surface-900 hover:bg-surface-100 btn-lg mt-6 inline-flex">
                Post your first job <HiOutlineArrowRight />
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
                {['Frontend Developer', 'Data Analyst Intern', 'Backend Engineer'].map((title, i) => (
                  <div key={title} className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-sm font-medium">{title}</span>
                    <span className="badge-green">{92 - i * 9}% match</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="section bg-white dark:bg-surface-950 text-center">
        <div className="container-app px-4 max-w-2xl">
          <h2 className="page-title text-2xl md:text-3xl mb-3">Ready to find your perfect job?</h2>
          <p className="page-subtitle mb-8">Join thousands of students already using SkillMatch</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn btn-primary btn-lg justify-center">
              Get started free <HiOutlineArrowRight />
            </Link>
            <Link to="/jobs" className="btn btn-outline btn-lg justify-center">
              Browse jobs <HiOutlineArrowSmRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
