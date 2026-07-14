import { useState } from 'react'
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineX } from 'react-icons/hi'
import { useAuth } from '../../hooks/useAuth'
import { showToast } from '../common/Toast'

export default function LiveJobAlert() {
  const { user } = useAuth()
  const [enabled, setEnabled] = useState(false)
  const [frequency, setFrequency] = useState('daily')
  const [saved, setSaved] = useState(false)

  if (!user || user.role !== 'student') return null

  const handleSave = () => {
    setSaved(true)
    showToast.success('Job alerts set ho gaye! Naye matches milne pe notify karenge.')
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineBell className={`text-xl ${enabled ? 'text-primary-500' : 'text-surface-400'}`} />
          <h3 className="font-display font-semibold text-surface-900 dark:text-white">Live Job Alerts</h3>
        </div>
        <button
          onClick={() => setEnabled(v => !v)}
          className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-primary-600' : 'bg-surface-300 dark:bg-surface-700'}`}
        >
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>

      {enabled ? (
        <div className="space-y-4">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Teri skills ({user.skills?.slice(0, 3).join(', ') || 'koi skill nahi'}) se match karne wali nai jobs pe alert milega.
          </p>
          <div>
            <label className="label">Alert frequency</label>
            <div className="flex gap-2">
              {['instant', 'daily', 'weekly'].map(f => (
                <button key={f} onClick={() => setFrequency(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors capitalize ${
                    frequency === f
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-surface-200 text-surface-600 dark:border-surface-700 dark:text-surface-400'
                  }`}>{f}</button>
              ))}
            </div>
          </div>
          <button onClick={handleSave} className="btn btn-primary w-full justify-center">
            {saved ? <><HiOutlineCheckCircle /> Saved!</> : 'Save preferences'}
          </button>
        </div>
      ) : (
        <p className="text-sm text-surface-400 dark:text-surface-500">
          Enable karo — jab bhi teri skills se match karne wali nai job aaye, notify karenge! 🔔
        </p>
      )}
    </div>
  )
}
