import React from 'react'

const Badge = ({ children, variant = 'primary', size = 'md', className = '' }) => {
  const variants = {
    primary: 'badge-primary',
    secondary: 'badge-secondary',
    outline: 'badge-outline',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error'
  }
  
  const sizes = {
    xs: 'badge-xs',
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg'
  }
  
  return (
    <div className={`badge ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </div>
  )
}

export default Badge
