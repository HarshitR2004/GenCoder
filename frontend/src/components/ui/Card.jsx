import React from 'react'

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-base-100 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

const CardHeader = ({ children, gradient = '', className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-base-300 ${gradient} ${className}`}>
      {children}
    </div>
  )
}

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  )
}

const CardTitle = ({ children, icon, className = '' }) => {
  return (
    <h2 className={`text-xl font-bold text-base-content flex items-center gap-2 ${className}`}>
      {icon}
      {children}
    </h2>
  )
}

export { Card, CardHeader, CardContent, CardTitle }
