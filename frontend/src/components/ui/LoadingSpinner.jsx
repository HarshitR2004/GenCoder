import React from 'react'
import { Code2, Loader2 } from 'lucide-react'

const LoadingSpinner = ({ size = 'md', text = '', variant = 'default', className = '' }) => {
  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-xl'
  }

  if (variant === 'code') {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 ${className}`}>
        <div className="text-center">
          <div className="relative mb-6">
            <div className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-800 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin mx-auto`}></div>
            <Code2 size={size === 'xl' ? 24 : size === 'lg' ? 20 : size === 'md' ? 16 : 12} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400" />
          </div>
          {text && (
            <p className={`${textSizeClasses[size]} font-medium text-slate-700 dark:text-slate-300`}>
              {text}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'gradient') {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 ${className}`}>
        <div className="text-center">
          <div className={`${sizeClasses[size]} relative mb-6 mx-auto`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full animate-spin"></div>
            <div className="absolute inset-1 bg-white dark:bg-slate-900 rounded-full"></div>
          </div>
          {text && (
            <p className={`${textSizeClasses[size]} font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
              {text}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 ${className}`}>
        <div className="text-center">
          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          </div>
          {text && (
            <p className={`${textSizeClasses[size]} font-medium text-slate-700 dark:text-slate-300`}>
              {text}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 ${className}`}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} text-blue-500 dark:text-blue-400 animate-spin mb-6 mx-auto`} />
        {text && (
          <p className={`${textSizeClasses[size]} font-medium text-slate-700 dark:text-slate-300`}>
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner
