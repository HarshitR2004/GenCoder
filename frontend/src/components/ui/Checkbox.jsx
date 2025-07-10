import React from 'react'
import { Check } from 'lucide-react'

const Checkbox = ({ 
  label, 
  checked, 
  onChange, 
  name,
  variant = 'primary',
  className = '',
  disabled = false
}) => {
  const variants = {
    primary: 'border-blue-300 dark:border-blue-600 checked:bg-blue-500 checked:border-blue-500 focus:ring-blue-500/20',
    secondary: 'border-slate-300 dark:border-slate-600 checked:bg-slate-500 checked:border-slate-500 focus:ring-slate-500/20',
    success: 'border-green-300 dark:border-green-600 checked:bg-green-500 checked:border-green-500 focus:ring-green-500/20',
    warning: 'border-yellow-300 dark:border-yellow-600 checked:bg-yellow-500 checked:border-yellow-500 focus:ring-yellow-500/20',
    error: 'border-red-300 dark:border-red-600 checked:bg-red-500 checked:border-red-500 focus:ring-red-500/20'
  }
  
  return (
    <label className={`cursor-pointer flex items-center gap-3 group ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-5 h-5 rounded border-2 bg-white dark:bg-slate-800
            transition-all duration-200
            focus:ring-2 focus:ring-offset-0
            disabled:cursor-not-allowed
            ${variants[variant]}
            ${checked ? 'checked:text-white' : ''}
          `}
        />
        {checked && (
          <Check 
            size={12} 
            className="absolute top-0.5 left-0.5 text-white pointer-events-none" 
            strokeWidth={3}
          />
        )}
      </div>
      {label && (
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors flex-1">
          {label}
        </span>
      )}
    </label>
  )
}

export default Checkbox
