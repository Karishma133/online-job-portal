import CreatableSelect from 'react-select/creatable'
import { SKILLS_LIST } from '../../utils/constants'

const skillOptions = SKILLS_LIST.map(s => ({ value: s, label: s }))

const selectStyles = {
  // Input box ki main styling (White bg hatane ke liye)
  control: (base, state) => ({
    ...base,
    borderRadius: '0.75rem',
    minHeight: '46px',
    backgroundColor: 'transparent', // Pura white background hata diya
    borderColor: state.isFocused ? '#818cf8' : '#374151', // Dark border color
    boxShadow: state.isFocused ? '0 0 0 1px #818cf8' : 'none',
    '&:hover': { borderColor: '#818cf8' },
  }),
  // Type karte time cursor aur text ka color
  input: (base) => ({
    ...base,
    color: '#ffffff', // White text
  }),
  // Dropdown list ke items ki styling
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? '#374151' : '#1f2937', // Dark background for options
    color: '#ffffff', // White text for options
    cursor: 'pointer',
    padding: '10px 12px',
  }),
  // Dropdown container ki styling
  menu: (base) => ({
    ...base,
    zIndex: 9999,
    backgroundColor: '#1f2937',
    border: '1px solid #374151'
  }),
  // Selected skills (Tags) ki styling dark mode ke liye
  multiValue: (base) => ({ 
    ...base, 
    backgroundColor: 'rgba(79, 70, 229, 0.2)', // Light translucent purple/indigo
    borderRadius: '6px', 
    padding: '1px' 
  }),
  multiValueLabel: (base) => ({ 
    ...base, 
    color: '#a5b4fc', // Light text for tags
    fontWeight: 500, 
    fontSize: '13px' 
  }),
  multiValueRemove: (base) => ({ 
    ...base, 
    color: '#a5b4fc', 
    ':hover': { backgroundColor: 'rgba(79, 70, 229, 0.5)', color: '#ffffff' } 
  }),
}

/**
 * Tag-style skill picker. Allows selecting from a known list AND
 * creating custom skill tags not in the list.
 */
export default function SkillsInput({ value = [], onChange }) {
  const handleChange = (opts) => onChange((opts || []).map(o => o.value))

  return (
    <div>
      <CreatableSelect
        isMulti
        isClearable={false}
        options={skillOptions}
        value={value.map(s => ({ value: s, label: s }))}
        onChange={handleChange}
        styles={selectStyles}
        placeholder="Type to search or add a skill..."
        noOptionsMessage={() => 'No matching skill — press Enter to add custom'}
        formatCreateLabel={(input) => `Add "${input}"`}
        onCreateOption={(input) => onChange([...value, input])}
        isValidNewOption={(input) => input.trim().length > 0 && !value.includes(input)}
      />
      <p className="text-xs text-surface-400 mt-1.5">
        Add every skill you're confident in — this powers your job match score.
      </p>
    </div>
  )
}