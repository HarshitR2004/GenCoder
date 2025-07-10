import React from 'react'
import { ChevronDown } from 'lucide-react'

const Select = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  className = '',
  size = 'md',
  disabled = false
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
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            w-full rounded-lg border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-800
            text-slate-900 dark:text-slate-100
            focus:border-blue-500 dark:focus:border-blue-400
            focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
            transition-all duration-200
            shadow-sm hover:shadow-md focus:shadow-lg
            disabled:opacity-50 disabled:cursor-not-allowed
            appearance-none cursor-pointer
            ${sizes[size]}
            pr-10
            ${className}
          `}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown 
            size={16} 
            className="text-slate-400 dark:text-slate-500" 
          />
        </div>
      </div>
    </div>
  )
}

export default Select
