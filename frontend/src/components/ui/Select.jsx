import React from 'react'

const Select = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  className = '',
  size = 'md'
}) => {
  const sizes = {
    sm: 'select-sm',
    md: 'select-md',
    lg: 'select-lg'
  }
  
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-semibold text-base">{label}</span>
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`select select-bordered w-full ${sizes[size]} ${className}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select
