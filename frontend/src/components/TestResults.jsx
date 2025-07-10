import React from 'react'
import { Check, X, Clock, Code2, AlertCircle, Trophy, Target } from 'lucide-react'
import { Card, CardHeader, CardContent, CardTitle } from './ui/Card'
import Badge from './ui/Badge'

const TestResults = ({ submissionResults, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <Code2 size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" />
            </div>
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Running Test Cases</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Executing your code against all test cases...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!submissionResults) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center">
          <Target size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">Ready to Test</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Click "Run Code" to execute your solution</p>
        </div>
      </div>
    )
  }

  const { correct = [], incorrect = [] } = submissionResults
  const totalTests = correct.length + incorrect.length
  const passedTests = correct.length

  const getStatusIcon = (status) => {
    return status === 'correct' ? 
      <Check size={16} className="text-green-500" /> : 
      <X size={16} className="text-red-500" />
  }

  const getOverallStatusColor = () => {
    if (passedTests === totalTests) return 'success'
    if (passedTests === 0) return 'error'
    return 'warning'
  }

  const getOverallStatusText = () => {
    if (passedTests === totalTests) return 'All Tests Passed!'
    if (passedTests === 0) return 'All Tests Failed'
    return `${passedTests}/${totalTests} Tests Passed`
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        {/* Overall Summary */}
        <div className={`p-4 rounded-xl mb-4 border-l-4 ${
          passedTests === totalTests 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
            : passedTests === 0 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {passedTests === totalTests ? (
                <div className="flex items-center gap-2">
                  <Trophy size={20} className="text-green-600" />
                  <span className="font-bold text-green-700 dark:text-green-300">
                    Perfect Score!
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle size={20} className="text-yellow-600" />
                  <span className="font-bold text-yellow-700 dark:text-yellow-300">
                    Partial Success
                  </span>
                </div>
              )}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {passedTests}/{totalTests}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                test cases passed
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  passedTests === totalTests ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${(passedTests / totalTests) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="space-y-3">
          {/* Correct Test Cases */}
          {correct.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                <Check size={16} />
                Passed Tests ({correct.length})
              </h4>
              <div className="space-y-2">
                {correct.map((result) => (
                  <div
                    key={result.test_case_id}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-500" />
                        <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                          Test Case {result.test_case_id}
                        </span>
                      </div>
                      <Badge variant="success" size="xs">
                        PASSED
                      </Badge>
                    </div>
                    <div className="ml-6">
                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Output:</div>
                      <div className="font-mono text-sm bg-white dark:bg-slate-800 p-2 rounded border text-green-700 dark:text-green-300">
                        {result.output || '(empty)'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incorrect Test Cases */}
          {incorrect.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                <X size={16} />
                Failed Tests ({incorrect.length})
              </h4>
              <div className="space-y-2">
                {incorrect.map((result) => (
                  <div
                    key={result.test_case_id}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <X size={16} className="text-red-500" />
                        <span className="font-medium text-sm text-slate-900 dark:text-slate-100">
                          Test Case {result.test_case_id}
                        </span>
                      </div>
                      <Badge variant="error" size="xs">
                        FAILED
                      </Badge>
                    </div>
                    <div className="ml-6 space-y-2">
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Your Output:</div>
                        <div className="font-mono text-sm bg-white dark:bg-slate-800 p-2 rounded border text-red-700 dark:text-red-300">
                          {result.output || '(empty)'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Expected Output:</div>
                        <div className="font-mono text-sm bg-white dark:bg-slate-800 p-2 rounded border text-green-700 dark:text-green-300">
                          {result.expected_output || '(empty)'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* No results */}
        {totalTests === 0 && (
          <div className="text-center py-8">
            <Code2 size={48} className="mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <p className="text-lg font-medium text-slate-600 dark:text-slate-400 mb-2">No Test Cases</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">No test results available for this problem</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestResults
