import React from 'react'

const Tabs = ({ tabs, activeTab, onTabChange, className = '' }) => {
  return (
    <div className={`tabs tabs-bordered mb-6 overflow-x-auto ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`tab tab-lg flex-shrink-0 ${activeTab === tab.key ? 'tab-active' : ''}`}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
          {tab.badge && (
            <div className="badge badge-outline ml-2">
              {tab.badge}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

export default Tabs
