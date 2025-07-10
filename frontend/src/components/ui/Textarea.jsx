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
        <label className="block mb-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
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
            resize-none font-mono text-sm
            px-4 py-3
            ${className}
          `}
        />
        {value && (
          <div className="absolute bottom-2 right-2 text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm">
            {value.length} characters
          </div>
        )}
      </div>
    </div>
  )
}

export default Textarea
