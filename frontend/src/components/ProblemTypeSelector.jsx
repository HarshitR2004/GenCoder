import React from 'react'
import { Code2, Settings, Zap, CheckCircle } from 'lucide-react'
import Select from './ui/Select'
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card'

const ProblemTypeSelector = ({ value, onChange, disabled = false }) => {
  const problemTypes = [
    { 
      value: 'function_only_int', 
      label: 'Function Only - Integer', 
      description: 'Single function expecting integer arguments',
      icon: '🔢'
    },
    { 
      value: 'function_only_array', 
      label: 'Function Only - Array', 
      description: 'Single function expecting array input',
      icon: '📋'
    },
    { 
      value: 'function_only_string', 
      label: 'Function Only - String', 
      description: 'Single function expecting string input',
      icon: '📝'
    }
  ]

  const selectedType = problemTypes.find(type => type.value === value)

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-b border-indigo-200 dark:border-indigo-700">
        <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg">
            <Settings size={18} className="text-white" />
          </div>
          Problem Type Configuration
          <Zap size={16} className="text-indigo-500" />
        </CardTitle>
        <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
          Define the input/output structure for your coding challenge
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <Select
            label="Problem Type"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            options={problemTypes.map(type => ({
              value: type.value,
              label: type.label
            }))}
            className="bg-white dark:bg-slate-800"
          />
          
          {selectedType && (
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg shadow-sm">
                  <CheckCircle size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{selectedType.icon}</span>
                    <span className="font-semibold text-indigo-800 dark:text-indigo-200">
                      {selectedType.label}
                    </span>
                  </div>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-3">
                    {selectedType.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400">
                      <Code2 size={12} />
                      Function-based
                    </div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400">
                      Auto-generated templates
                    </div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full"></div>
                    <div className="text-xs text-indigo-600 dark:text-indigo-400">
                      Multi-language support
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!selectedType && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-600 text-center">
              <Settings className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select a problem type to see configuration details
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProblemTypeSelector
