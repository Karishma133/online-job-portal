import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlinePlusCircle, HiOutlineTrash } from 'react-icons/hi'
import CreatableSelect from 'react-select/creatable'
import { jobService } from '../services/jobService'
import { showToast } from '../components/common/Toast'
import { useTheme } from '../context/ThemeContext'
import { SKILLS_LIST, JOB_CATEGORIES, JOB_TYPES, EXPERIENCE_LEVELS } from '../utils/constants'

const skillOptions = SKILLS_LIST.map(s => ({ value: s, label: s }))

// react-select ships its own inline styles built for a light background —
// it doesn't pick up our Tailwind dark: classes automatically, so without
// this the dropdown text renders almost invisible (dark gray on dark bg).
// This builds a full style object matching our design tokens for both themes.
function buildSelectStyles(isDark) {
  const bg       = isDark ? '#111623' : '#ffffff'   // surface-900 / white
  const bgHover  = isDark ? '#1e293b' : '#eef2ff'   // surface-800 / primary-50
  const border   = isDark ? '#334155' : '#e2e8f0'   // surface-700 / surface-200
  const text     = isDark ? '#f1f5f9' : '#0f172a'   // surface-100 / surface-900
  const subtext  = isDark ? '#94a3b8' : '#64748b'   // surface-400 / surface-500
  const chipBg   = isDark ? '#312e81' : '#e0e7ff'   // primary-900 / primary-100
  const chipText = isDark ? '#c7d2fe' : '#4338ca'   // primary-200 / primary-700

  return {
    control: (base, state) => ({
      ...base,
      backgroundColor: bg,
      borderRadius: '0.75rem',
      minHeight: '46px',
      borderColor: state.isFocused ? '#818cf8' : border,
      boxShadow: state.isFocused ? '0 0 0 2px #c7d2fe' : 'none',
    }),
    menu: (base) => ({ ...base, backgroundColor: bg, border: `1px solid ${border}`, zIndex: 20 }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? chipBg : state.isFocused ? bgHover : 'transparent',
      color: text,
      cursor: 'pointer',
    }),
    input:        (base) => ({ ...base, color: text }),
    singleValue:  (base) => ({ ...base, color: text }),
    placeholder:  (base) => ({ ...base, color: subtext }),
    multiValue:      (base) => ({ ...base, backgroundColor: chipBg, borderRadius: '0.5rem' }),
    multiValueLabel: (base) => ({ ...base, color: chipText }),
    multiValueRemove: (base) => ({ ...base, color: chipText, ':hover': { backgroundColor: chipText, color: bg } }),
    noOptionsMessage: (base) => ({ ...base, color: subtext }),
  }
}

const initialForm = {
  title: '', company: '', location: '', jobType: 'Full-time', category: '',
  experienceLevel: 'Fresher', salaryMin: '', salaryMax: '',
  description: '', requiredSkills: [], responsibilities: [''],
}

export default function PostJob() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const selectStyles = buildSelectStyles(theme === 'dark')
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }))

  const handleResponsibilityChange = (i, value) => {
    const next = [...form.responsibilities]
    next[i] = value
    set('responsibilities', next)
  }
  const addResponsibility    = () => set('responsibilities', [...form.responsibilities, ''])
  const removeResponsibility = (i) => set('responsibilities', form.responsibilities.filter((_, idx) => idx !== i))

  const validate = () => {
    const errs = {}
    if (!form.title.trim()) errs.title = 'Required'
    if (!form.company.trim()) errs.company = 'Required'
    if (!form.location.trim()) errs.location = 'Required'
    if (!form.description.trim()) errs.description = 'Required'
    if (form.requiredSkills.length === 0) errs.requiredSkills = 'Add at least one skill'

    const min = Number(form.salaryMin)
    const max = Number(form.salaryMax)
    if (form.salaryMin && min < 0) errs.salaryMin = 'Cannot be negative'
    if (form.salaryMax && max < 0) errs.salaryMax = 'Cannot be negative'
    if (form.salaryMin && form.salaryMax && max < min) errs.salaryMax = 'Max salary should be higher than min'

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const payload = {
        ...form,
        salaryMin: Number(form.salaryMin) || 0,
        salaryMax: Number(form.salaryMax) || 0,
        responsibilities: form.responsibilities.filter(r => r.trim()),
      }
      const data = await jobService.createJob(payload)
      showToast.success('Job posted successfully!')
      navigate(`/jobs/${data.job._id}`)
    } catch (err) {
      showToast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section pt-10">
      <div className="container-app max-w-2xl">
        <div className="mb-8">
          <h1 className="page-title">Post a new job</h1>
          <p className="page-subtitle">Define the role and required skills — we'll handle the matching</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-5">

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Job title</label>
              <input className={`input ${errors.title ? 'input-error' : ''}`} placeholder="Frontend Developer"
                value={form.title} onChange={(e) => set('title', e.target.value)} />
              {errors.title && <p className="text-xs text-danger-500 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="label">Company name</label>
              <input className={`input ${errors.company ? 'input-error' : ''}`} placeholder="Acme Inc."
                value={form.company} onChange={(e) => set('company', e.target.value)} />
              {errors.company && <p className="text-xs text-danger-500 mt-1">{errors.company}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Location</label>
              <input className={`input ${errors.location ? 'input-error' : ''}`} placeholder="Bangalore or Remote"
                value={form.location} onChange={(e) => set('location', e.target.value)} />
              {errors.location && <p className="text-xs text-danger-500 mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="label">Job type</label>
              <select className="input" value={form.jobType} onChange={(e) => set('jobType', e.target.value)}>
                {JOB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                <option value="">Select category</option>
                {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Experience level</label>
              <select className="input" value={form.experienceLevel} onChange={(e) => set('experienceLevel', e.target.value)}>
                {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Min salary (₹/year)</label>
              <input type="number" min="0" className={`input ${errors.salaryMin ? 'input-error' : ''}`} placeholder="300000"
                value={form.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} />
              {errors.salaryMin && <p className="text-xs text-danger-500 mt-1">{errors.salaryMin}</p>}
            </div>
            <div>
              <label className="label">Max salary (₹/year)</label>
              <input type="number" min="0" className={`input ${errors.salaryMax ? 'input-error' : ''}`} placeholder="600000"
                value={form.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} />
              {errors.salaryMax && <p className="text-xs text-danger-500 mt-1">{errors.salaryMax}</p>}
            </div>
          </div>

          <div>
            <label className="label">Required skills</label>
            <CreatableSelect
              isMulti
              options={skillOptions}
              styles={selectStyles}
              placeholder="Select or type skills..."
              value={form.requiredSkills.map(s => ({ value: s, label: s }))}
              onChange={(opts) => set('requiredSkills', opts.map(o => o.value))}
            />
            {errors.requiredSkills && <p className="text-xs text-danger-500 mt-1">{errors.requiredSkills}</p>}
            <p className="text-xs text-surface-400 mt-1.5">
              This list powers the skill-match % shown to every applicant.
            </p>
          </div>

          <div>
            <label className="label">Job description</label>
            <textarea
              rows={5}
              className={`input ${errors.description ? 'input-error' : ''}`}
              placeholder="Describe the role, team, and what success looks like..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
            {errors.description && <p className="text-xs text-danger-500 mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="label">Responsibilities</label>
            <div className="space-y-2">
              {form.responsibilities.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="input"
                    placeholder={`Responsibility ${i + 1}`}
                    value={r}
                    onChange={(e) => handleResponsibilityChange(i, e.target.value)}
                  />
                  {form.responsibilities.length > 1 && (
                    <button type="button" onClick={() => removeResponsibility(i)} className="btn-ghost btn px-3">
                      <HiOutlineTrash className="text-danger-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={addResponsibility} className="text-sm text-primary-600 flex items-center gap-1 mt-2">
              <HiOutlinePlusCircle /> Add responsibility
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center btn-lg mt-2">
            {loading ? 'Publishing...' : 'Publish job'}
          </button>
        </form>
      </div>
    </div>
  )
}
