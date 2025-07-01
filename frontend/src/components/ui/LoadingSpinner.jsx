import React from 'react'

const LoadingSpinner = ({ size = 'md', text = 'Loading...', className = '' }) => {
  const sizes = {
    xs: 'loading-xs',
    sm: 'loading-sm',
    md: 'loading-md',
    lg: 'loading-lg'
  }
  
  return (
    <div className={`min-h-screen flex items-center justify-center bg-base-100 ${className}`}>
      <div className="text-center">
        <div className={`loading loading-spinner text-primary mb-4 ${sizes[size]}`}></div>
        <p className="text-base-content/60">{text}</p>
      </div>
    </div>
  )
}

export default LoadingSpinner
