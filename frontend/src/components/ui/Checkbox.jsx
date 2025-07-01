import React from 'react'

const Checkbox = ({ 
  label, 
  checked, 
  onChange, 
  name,
  variant = 'primary',
  className = ''
}) => {
  const variants = {
    primary: 'checkbox-primary',
    secondary: 'checkbox-secondary',
    success: 'checkbox-success',
    warning: 'checkbox-warning',
    error: 'checkbox-error'
  }
  
  return (
    <label className={`cursor-pointer flex items-center gap-3 ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className={`checkbox ${variants[variant]}`}
      />
      {label && (
        <span className="label-text font-medium flex-1">
          {label}
        </span>
      )}
    </label>
  )
}

export default Checkbox
