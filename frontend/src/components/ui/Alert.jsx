import React from 'react'

const Alert = ({ type = 'info', children, className = '' }) => {
  const types = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error'
  }
  
  return (
    <div className={`alert ${types[type]} mb-6 shadow-lg ${className}`}>
      <div>
        <span className="font-medium">{children}</span>
      </div>
    </div>
  )
}

export default Alert
