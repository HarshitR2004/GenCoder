import React from 'react'
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react'

const Alert = ({ type = 'info', children, className = '' }) => {
  const typeConfig = {
    info: {
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: Info
    },
    success: {
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      textColor: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-600 dark:text-green-400',
      icon: CheckCircle
    },
    warning: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      icon: AlertTriangle
    },
    error: {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-700',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
      icon: XCircle
    }
  }

  const config = typeConfig[type]
  const IconComponent = config.icon
  
  return (
    <div className={`
      ${config.bgColor} 
      ${config.borderColor} 
      ${config.textColor}
      border rounded-xl p-4 mb-6 shadow-lg backdrop-blur-sm
      ${className}
    `}>
      <div className="flex items-start gap-3">
        <IconComponent 
          size={20} 
          className={`${config.iconColor} mt-0.5 flex-shrink-0`} 
        />
        <div className="flex-1">
          <div className="font-medium leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Alert
