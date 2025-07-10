import React from 'react'
import { AlertCircle, Code, RefreshCw, XCircle } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card'
import Button from './ui/Button'

const ErrorBoundary = ({ error, retry, isJudgeError = false }) => {
  if (!error) return null

  const getErrorIcon = () => {
    if (isJudgeError) return <Code size={20} className="text-red-500" />
    return <AlertCircle size={20} className="text-red-500" />
  }

  const getErrorTitle = () => {
    if (isJudgeError) return 'Code Execution Error'
    return 'Error'
  }

  const getErrorSuggestions = () => {
    if (isJudgeError) {
      return (
        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="font-medium mb-2 text-blue-800 dark:text-blue-200 text-sm">💡 Common solutions:</p>
          <ul className="list-disc list-inside space-y-1 text-xs text-blue-700 dark:text-blue-300">
            <li>Check your function name is 'solution'</li>
            <li>Verify function parameters match expected input</li>
            <li>Ensure proper return type and format</li>
            <li>Check for syntax errors and indentation</li>
            <li>Make sure your solution handles edge cases</li>
          </ul>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
          {getErrorIcon()}
          {getErrorTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded-lg p-3 mb-3">
          <pre className="whitespace-pre-wrap font-mono text-sm text-red-800 dark:text-red-200 overflow-x-auto">
            {error}
          </pre>
        </div>
        
        {getErrorSuggestions()}
        
        {retry && (
          <div className="mt-4 flex gap-2">
            <Button
              onClick={retry}
              variant="outline"
              size="sm"
              icon={<RefreshCw size={16} />}
              className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              Try Again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="ghost"
              size="sm"
              className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              Refresh Page
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ErrorBoundary
