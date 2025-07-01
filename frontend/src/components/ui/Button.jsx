import React from 'react'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false, 
  onClick, 
  type = 'button',
  className = '',
  icon,
  as: Component = 'button',
  ...props
}) => {
  const baseClasses = 'btn'
  
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    error: 'btn-error',
    warning: 'btn-warning',
    success: 'btn-success'
  }
  
  const sizes = {
    xs: 'btn-xs',
    sm: 'btn-sm', 
    md: 'btn-md',
    lg: 'btn-lg'
  }
  
  const buttonClass = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  // Only pass button-specific props to actual button elements
  const elementProps = Component === 'button' 
    ? { type, onClick, disabled: disabled || loading, ...props }
    : { onClick, ...props }
  
  return (
    <Component
      className={buttonClass}
      {...elementProps}
    >
      {loading ? (
        <>
          <span className="loading loading-spinner loading-sm mr-2"></span>
          {children}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Component>
  )
}

export default Button
