import Select from 'react-select'
import { HiOutlineFilter, HiOutlineX } from 'react-icons/hi'
import { SKILLS_LIST, JOB_TYPES, JOB_CATEGORIES, SALARY_RANGES } from '../../utils/constants'
import { useJob } from '../../hooks/useJob'

const skillOptions = SKILLS_LIST.map(s => ({ value: s, label: s }))

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#818cf8' : '#e2e8f0',
    boxShadow: state.isFocused ? '0 0 0 2px #c7d2fe' : 'none',
    padding: '2px',
    fontSize: '14px',
    backgroundColor: 'transparent',
    '&:hover': { borderColor: '#818cf8' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    zIndex: 100,
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '200px',
  }),
  option: (base, state) => ({
    ...base,
    fontSize: '13px',
    backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#eef2ff' : 'white',
    color: state.isSelected ? 'white' : '#1e293b',
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#eef2ff',
    borderRadius: '6px',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#4338ca',
    fontSize: '12px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#4338ca',
    ':hover': { backgroundColor: '#c7d2fe', color: '#312e81' },
  }),
  placeholder: (base) => ({
    ...base,
    color: '#94a3b8',
    fontSize: '13px',
  }),
}

export default function JobFilter() {
  const { filters, updateFilter, resetFilters } = useJob()

  const hasActiveFilters = filters.skills?.length > 0 || filters.location ||
    filters.jobType || filters.salary || filters.category

  return (
    <aside className="card !p-5 sticky top-24 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto scrollbar-thin space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-surface-900 dark:text-white flex items-center gap-2">
          <HiOutlineFilter className="text-primary-500" /> Filters
        </h3>
        {hasActiveFilters && (
          <button onClick={resetFilters}
            className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            <HiOutlineX /> Clear all
          </button>
        )}
      </div>

      {/* Skills */}
      <div>
        <label className="label !mb-1">Skills</label>
        <Select
          isMulti
          options={skillOptions}
          styles={selectStyles}
          placeholder="e.g. React, Node.js..."
          value={(filters.skills || []).map(s => ({ value: s, label: s }))}
          onChange={(opts) => updateFilter('skills', (opts || []).map(o => o.value))}
          noOptionsMessage={() => 'No skill found'}
        />
      </div>

      {/* Location */}
      <div>
        <label className="label !mb-1">Location</label>
        <input
          type="text"
          className="input !py-2"
          placeholder="City or 'Remote'"
          value={filters.location || ''}
          onChange={(e) => updateFilter('location', e.target.value)}
        />
      </div>

      {/* Category */}
      <div>
        <label className="label !mb-1">Category</label>
        <select className="input !py-2" value={filters.category || ''}
          onChange={(e) => updateFilter('category', e.target.value)}>
          <option value="">All categories</option>
          {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Job Type */}
      <div>
        <label className="label !mb-1">Job Type</label>
        <div className="grid grid-cols-2 gap-1.5">
          {JOB_TYPES.map((type) => (
            <button key={type}
              onClick={() => updateFilter('jobType', filters.jobType === type ? '' : type)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filters.jobType === type
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-primary-300'
              }`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Salary */}
      <div>
        <label className="label !mb-1">Salary Range</label>
        <select className="input !py-2" value={filters.salary || ''}
          onChange={(e) => updateFilter('salary', e.target.value)}>
          {SALARY_RANGES.map(r => <option key={r.label} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Sort */}
      <div>
        <label className="label !mb-1">Sort by</label>
        <select className="input !py-2" value={filters.sortBy || 'newest'}
          onChange={(e) => updateFilter('sortBy', e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="salary-high">Salary: High to Low</option>
          <option value="salary-low">Salary: Low to High</option>
          <option value="match">Best skill match</option>
        </select>
      </div>
    </aside>
  )
}
