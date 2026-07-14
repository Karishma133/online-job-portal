import { HiOutlineCurrencyRupee, HiOutlineTrendingUp } from 'react-icons/hi'

const SALARY_DATA = {
  'React':           { fresher: [300000, 600000], mid: [600000, 1200000], senior: [1200000, 2500000] },
  'Node.js':         { fresher: [300000, 600000], mid: [600000, 1200000], senior: [1200000, 2500000] },
  'JavaScript':      { fresher: [250000, 500000], mid: [500000, 1000000], senior: [1000000, 2000000] },
  'Python':          { fresher: [350000, 700000], mid: [700000, 1400000], senior: [1400000, 3000000] },
  'Machine Learning':{ fresher: [500000, 1000000], mid: [1000000, 2000000], senior: [2000000, 5000000] },
  'AWS':             { fresher: [400000, 800000], mid: [800000, 1500000], senior: [1500000, 3000000] },
  'Docker':          { fresher: [350000, 700000], mid: [700000, 1200000], senior: [1200000, 2500000] },
  'MongoDB':         { fresher: [280000, 550000], mid: [550000, 1000000], senior: [1000000, 2000000] },
  'SQL':             { fresher: [250000, 500000], mid: [500000, 900000], senior: [900000, 1800000] },
  'TypeScript':      { fresher: [350000, 650000], mid: [650000, 1200000], senior: [1200000, 2500000] },
  'default':         { fresher: [200000, 400000], mid: [400000, 800000], senior: [800000, 1500000] },
}

const fmt = (n) => n >= 100000 ? `${(n / 100000).toFixed(1)} LPA` : `₹${n.toLocaleString()}`

function calcSalary(skills) {
  if (!skills.length) return SALARY_DATA.default
  const known = skills.filter(s => SALARY_DATA[s])
  if (!known.length) return SALARY_DATA.default
  const avg = (level) => {
    const vals = known.map(s => SALARY_DATA[s][level])
    return [
      Math.round(vals.reduce((s, v) => s + v[0], 0) / vals.length),
      Math.round(vals.reduce((s, v) => s + v[1], 0) / vals.length),
    ]
  }
  return { fresher: avg('fresher'), mid: avg('mid'), senior: avg('senior') }
}

export default function SalaryPredictor({ skills = [] }) {
  const data = calcSalary(skills)
  const levels = [
    { key: 'fresher', label: 'Fresher (0-1 yr)', color: 'bg-accent-400/10 text-accent-600 border-accent-300' },
    { key: 'mid',     label: '1-3 years exp',    color: 'bg-primary-50 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-800' },
    { key: 'senior',  label: '3+ years exp',     color: 'bg-warn-400/10 text-warn-500 border-warn-400' },
  ]

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <HiOutlineCurrencyRupee className="text-accent-500 text-xl" />
        <h3 className="font-display font-semibold text-surface-900 dark:text-white">Salary Predictor</h3>
        <HiOutlineTrendingUp className="text-accent-500" />
      </div>
      <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
        Teri skills ke hisaab se market mein expected salary range:
      </p>
      {skills.length === 0 ? (
        <div className="card text-center py-6">
          <p className="text-surface-400 text-sm">Apni skills profile mein add karo — accurate salary prediction milegi!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {levels.map(({ key, label, color }) => (
            <div key={key} className={`card border-2 ${color} text-center`}>
              <p className="text-xs font-medium mb-2 opacity-80">{label}</p>
              <p className="text-xl font-display font-bold">{fmt(data[key][0])}</p>
              <p className="text-xs opacity-60 my-1">to</p>
              <p className="text-xl font-display font-bold">{fmt(data[key][1])}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-surface-400 mt-3 text-center">
        * Estimate based on current market trends. Actual salary varies by company, location aur negotiation.
      </p>
    </div>
  )
}
