import React from 'react'

const Input = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  className = '',
  size = 'md',
  icon
}) => {
  const sizes = {
    sm: 'input-sm',
    md: 'input-md',
    lg: 'input-lg'
  }
  
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-semibold text-base">{label}</span>
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`input input-bordered w-full ${sizes[size]} ${className}`}
        />
        {icon && <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">{icon}</div>}
      </div>
    </div>
  )
}

export default Input
