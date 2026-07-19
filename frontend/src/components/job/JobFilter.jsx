
import Select from 'react-select'
import { HiOutlineFilter, HiOutlineX } from 'react-icons/hi'
import { SKILLS_LIST, JOB_TYPES, JOB_CATEGORIES, SALARY_RANGES } from '../../utils/constants'
import { useJob } from '../../hooks/useJob'

// Yahan heading wapas 'Skills' kardi hai
const skillOptions = [
  { value: 'heading', label: 'Skills', isDisabled: true },
  ...SKILLS_LIST.map(s => ({ value: s, label: s }))
]

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: '0.75rem',
    borderColor: state.isFocused ? '#4f46e5' : '#334155',
    boxShadow: state.isFocused ? '0 0 0 1px #4f46e5' : 'none',
    padding: '2px',
    minHeight: '42px',
    fontSize: '14px',
    backgroundColor: '#1e293b', 
    '&:hover': { borderColor: '#4f46e5' },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: '0.75rem',
    overflow: 'hidden',
    zIndex: 100,
    backgroundColor: '#1e293b', 
    border: '1px solid #334155', 
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: '200px',
    paddingTop: '0', 
  }),
  option: (base, state) => {
    // Yahan BLUE HEADING wala code wapas add kar diya hai
    if (state.isDisabled) {
      return {
        ...base,
        backgroundColor: '#2563eb', // Blue Background
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        textAlign: 'center',
        cursor: 'default',
        padding: '8px 12px',
      }
    }
    // Normal options
    return {
      ...base,
      fontSize: '14px', 
      backgroundColor: state.isSelected 
        ? '#4f46e5' 
        : state.isFocused 
        ? '#334155' 
        : '#1e293b',
      color: 'white', 
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#4f46e5',
      }
    }
  },
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#3730a3', 
    borderRadius: '6px',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: 'white',
    fontSize: '12px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#c7d2fe',
    ':hover': { backgroundColor: '#4f46e5', color: 'white' },
  }),
  placeholder: (base) => ({
    ...base,
    color: 'white', // Placeholder bhi white rahega
    fontSize: '14px', 
  }),
  input: (base) => ({
    ...base,
    color: 'white', 
  }),
}

export default function JobFilter() {
  const { filters, updateFilter, resetFilters } = useJob()

  const hasActiveFilters = filters.skills?.length > 0 || filters.location ||
    filters.jobType || filters.salary || filters.category

  return (
    <aside className="card !p-5 sticky top-24 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto scrollbar-thin space-y-4 bg-[#0a0f1c] border border-gray-800">
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

      {/* Skills (React-Select) */}
      <div>
        <label className="label !mb-1 text-gray-300">Skills</label>
        <Select
          isMulti
          options={skillOptions}
          styles={selectStyles}
          placeholder="All skills" 
          value={(filters.skills || []).map(s => ({ value: s, label: s }))}
          onChange={(opts) => updateFilter('skills', (opts || []).map(o => o.value))}
          noOptionsMessage={() => 'No skill found'}
        />
      </div>

      {/* Location */}
      <div>
        <label className="label !mb-1 text-gray-300">Location</label>
        <input
          type="text"
          className="input !py-2 w-full bg-[#1e293b] text-white border-[#334155] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500"
          placeholder="City or 'Remote'"
          value={filters.location || ''}
          onChange={(e) => updateFilter('location', e.target.value)}
        />
      </div>

      {/* Category */}
      <div>
        <label className="label !mb-1 text-gray-300">Category</label>
        <select 
          className="input !py-2 w-full bg-[#1e293b] text-white border-[#334155] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500" 
          value={filters.category || ''}
          onChange={(e) => updateFilter('category', e.target.value)}
        >
          <option value="">All categories</option>
          {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Job Type */}
      <div>
        <label className="label !mb-1 text-gray-300">Job Type</label>
        <div className="grid grid-cols-2 gap-1.5">
          {JOB_TYPES.map((type) => (
            <button key={type}
              onClick={() => updateFilter('jobType', filters.jobType === type ? '' : type)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filters.jobType === type
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'border-[#334155] text-gray-300 hover:border-primary-500 bg-[#1e293b]'
              }`}>
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Salary */}
      <div>
        <label className="label !mb-1 text-gray-300">Salary Range</label>
        <select 
          className="input !py-2 w-full bg-[#1e293b] text-white border-[#334155] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500" 
          value={filters.salary || ''}
          onChange={(e) => updateFilter('salary', e.target.value)}
        >
          {SALARY_RANGES.map(r => <option key={r.label} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Sort */}
      <div>
        <label className="label !mb-1 text-gray-300">Sort by</label>
        <select 
          className="input !py-2 w-full bg-[#1e293b] text-white border-[#334155] rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-500" 
          value={filters.sortBy || 'newest'}
          onChange={(e) => updateFilter('sortBy', e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="salary-high">Salary: High to Low</option>
          <option value="salary-low">Salary: Low to High</option>
          <option value="match">Best skill match</option>
        </select>
      </div>
    </aside>
  )
}
