import { useState } from 'react'
import { HiOutlineUserAdd, HiOutlineClipboardCopy, HiOutlineCheckCircle, HiOutlineGift } from 'react-icons/hi'
import { useAuth } from '../../hooks/useAuth'
import { showToast } from '../common/Toast'

export default function ReferralSystem() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [referralEmail, setReferralEmail] = useState('')
  const [sent, setSent] = useState(false)

  const referralCode = user ? `SM-${user._id?.slice(-6)?.toUpperCase() || 'XXXXX'}` : 'Login karo'
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showToast.success('Referral link copied!')
  }

  const sendInvite = () => {
    if (!referralEmail) { showToast.error('Email enter karo'); return }
    setSent(true)
    showToast.success(`Invite sent to ${referralEmail}!`)
    setReferralEmail('')
    setTimeout(() => setSent(false), 3000)
  }

  if (!user) return null

  return (
    <div className="card mt-6">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineGift className="text-primary-500 text-xl" />
        <h3 className="font-display font-semibold text-surface-900 dark:text-white">Refer a Friend</h3>
        <span className="badge-green">Earn Points</span>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6 text-center">
        {[
          { icon: '👥', title: 'Refer a friend', desc: '+50 points' },
          { icon: '✅', title: 'Friend registers', desc: '+100 points' },
          { icon: '🎉', title: 'Friend gets hired', desc: '+500 points' },
        ].map((step) => (
          <div key={step.title} className="p-3 rounded-xl bg-surface-50 dark:bg-surface-800">
            <p className="text-2xl mb-1">{step.icon}</p>
            <p className="text-xs font-medium text-surface-700 dark:text-surface-300">{step.title}</p>
            <p className="text-xs text-primary-600 font-bold mt-0.5">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <label className="label">Your referral link</label>
        <div className="flex gap-2">
          <input readOnly value={referralLink} className="input text-xs" />
          <button onClick={copyLink} className="btn btn-outline btn-sm shrink-0">
            {copied ? <HiOutlineCheckCircle className="text-accent-500" /> : <HiOutlineClipboardCopy />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <div>
        <label className="label">Invite by email</label>
        <div className="flex gap-2">
          <input type="email" className="input" placeholder="friend@example.com"
            value={referralEmail} onChange={(e) => setReferralEmail(e.target.value)} />
          <button onClick={sendInvite} className="btn btn-primary btn-sm shrink-0">
            <HiOutlineUserAdd /> {sent ? 'Sent!' : 'Invite'}
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-center">
        <p className="text-xs text-primary-700 dark:text-primary-300">
          Tumhara referral code: <span className="font-bold">{referralCode}</span>
        </p>
      </div>
    </div>
  )
}
