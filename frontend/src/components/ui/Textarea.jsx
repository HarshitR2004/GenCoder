import React from 'react'

const Textarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  className = '',
  rows = 4,
  style
}) => {
  return (
    <div className="form-control w-full">
      {label && (
        <label className="label">
          <span className="label-text font-semibold text-base">{label}</span>
        </label>
      )}
      <div className="relative">
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={rows}
          style={style}
          className={`textarea textarea-bordered w-full font-mono text-sm resize-none ${className}`}
        />
        {value && (
          <div className="absolute bottom-2 right-2 text-xs text-base-content/40 bg-base-100 px-2 py-1 rounded">
            {value.length} characters
          </div>
        )}
      </div>
    </div>
  )
}

export default Textarea
