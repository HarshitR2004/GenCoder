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
    sm: 'h-10 text-sm px-3',
    md: 'h-12 text-base px-4',
    lg: 'h-14 text-lg px-4'
  }
  
  return (
    <div className="form-control w-full">
      {label && (
        <label className="block mb-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`
            w-full rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800
            text-slate-900 dark:text-slate-100
            placeholder-slate-400 dark:placeholder-slate-500
            focus:border-blue-500 dark:focus:border-blue-400
            focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
            transition-all duration-200
            shadow-sm hover:shadow-md focus:shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            ${sizes[size]}
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
        />
      </div>
    </div>
  )
}

export default Input
