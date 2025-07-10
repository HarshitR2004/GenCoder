import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Editor } from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import { Play, Check, X, Loader2, Code } from 'lucide-react'

// Import the same UI components used in QuestionForm
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Alert from '../components/ui/Alert'
import Select from '../components/ui/Select'
import TestResults from '../components/TestResults'
import ErrorBoundary from '../components/ErrorBoundary'

const QuestionSolve = () => {
  const { id } = useParams()
  const [question, setQuestion] = useState(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submissionResults, setSubmissionResults] = useState(null)
  const [error, setError] = useState('')
  
  // Language switching state
  const [selectedLanguage, setSelectedLanguage] = useState('python')
  const [userCode, setUserCode] = useState({})

  useEffect(() => {
    fetchQuestion()
  }, [id])

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch question')
      }

      const data = await response.json()
      console.log('Fetched question data:', data)
      setQuestion(data)
      
      // Initialize user code with starter code for all languages
      const initialUserCode = {}
      if (data.starter_code) {
        Object.keys(data.starter_code).forEach(lang => {
          initialUserCode[lang] = data.starter_code[lang]
        })
      }
      setUserCode(initialUserCode)
      
      // Set default language and code
      const availableLanguages = Object.keys(data.starter_code || {})
      const defaultLanguage = availableLanguages.includes('python') ? 'python' : availableLanguages[0]
      if (defaultLanguage) {
        setSelectedLanguage(defaultLanguage)
        setCode(data.starter_code?.[defaultLanguage] || '# Write your solution here')
      }
    } catch (err) {
      console.error('Error fetching question:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle language switching
  const handleLanguageChange = (newLanguage) => {
    // Save current code before switching
    setUserCode(prev => ({
      ...prev,
      [selectedLanguage]: code
    }))
    
    // Switch to new language
    setSelectedLanguage(newLanguage)
    setCode(userCode[newLanguage] || question?.starter_code?.[newLanguage] || '')
  }

  // Handle code changes
  const handleCodeChange = (newCode) => {
    setCode(newCode || '')
    // Update user code for current language
    setUserCode(prev => ({
      ...prev,
      [selectedLanguage]: newCode || ''
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    setSubmissionResults(null)
    
    try {
      // Determine problem type based on available information
      // For now, we'll default to 'function_only_int' but this could be made configurable
      const problemType = question?.problem_type || 'function_only_int'
      
      const requestPayload = {
        question_id: id,
        user_code: code,
        language: selectedLanguage,
        problem_type: problemType
      }
      
      console.log('Submitting code execution request:', requestPayload)
      
      const response = await fetch(`/api/judge/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Code execution failed:', errorData)
        throw new Error(errorData.error || 'Submission failed')
      }

      const data = await response.json()
      console.log('Code execution response:', data)
      
      if (data.success) {
        setSubmissionResults(data.submission_results)
      } else {
        throw new Error(data.error || 'Submission failed')
      }
    } catch (err) {
      console.error('Error during code execution:', err)
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Get Monaco editor language mapping
  const getMonacoLanguage = (language) => {
    const languageMap = {
      python: 'python',
      java: 'java',
      cpp: 'cpp',
     
    }
    return languageMap[language] || 'plaintext'
  }

  // Get language display name
  const getLanguageDisplayName = (language) => {
    const displayNames = {
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
    }
    return displayNames[language] || language.charAt(0).toUpperCase() + language.slice(1)
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success'
      case 'medium': return 'warning' 
      case 'hard': return 'error'
      default: return 'neutral'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-200 to-base-100">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-100">
        <div className="container mx-auto px-4 py-8">
          <Alert type="error">
            Error: {error}
          </Alert>
        </div>
      </div>
    )
  }

  // Get available languages from starter code
  const availableLanguages = question?.starter_code ? Object.keys(question.starter_code) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header Bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {question?.title || 'Loading...'}
              </h1>
              <Badge variant={getDifficultyColor(question?.difficulty)} size="lg" className="shadow-sm">
                {question?.difficulty?.toUpperCase() || 'MEDIUM'}
              </Badge>
            </div>
            
            {/* Topics */}
            {question?.topics && question.topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {question.topics.slice(0, 3).map((topic) => (
                  <Badge key={topic.id} variant="outline" size="sm" className="bg-white/50 dark:bg-slate-800/50">
                    {topic.name}
                  </Badge>
                ))}
                {question.topics.length > 3 && (
                  <Badge variant="outline" size="sm" className="bg-white/50 dark:bg-slate-800/50">
                    +{question.topics.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Problem Statement */}
        <div className="w-2/5 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Problem Statement Card */}
              <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                    Problem Statement
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="prose prose-slate dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        code({node, inline, className, children, ...props}) {
                          return inline ? (
                            <code className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-sm font-mono border" {...props}>
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl overflow-x-auto border border-slate-200 dark:border-slate-700 shadow-sm">
                              <code className="font-mono text-sm text-slate-800 dark:text-slate-200" {...props}>{children}</code>
                            </pre>
                          )
                        },
                        blockquote({children}) {
                          return (
                            <blockquote className="border-l-4 border-blue-500 pl-4 italic bg-blue-50 dark:bg-blue-900/20 py-3 rounded-r-lg my-4">
                              {children}
                            </blockquote>
                          )
                        },
                        h1: ({children}) => <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">{children}</h2>,
                        h3: ({children}) => <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{children}</h3>
                      }}
                    >
                      {question?.description || '# No Problem Description\n\nNo problem description is available for this question.'}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor & Results */}
        <div className="w-3/5 flex flex-col bg-slate-50 dark:bg-slate-800">
          {/* Code Editor Section */}
          <div className="flex-1 flex flex-col">
            {/* Editor Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Code Editor</h2>
                  </div>
                  
                  {/* Language Selector */}
                  {availableLanguages.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Select
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        size="sm"
                        className="min-w-[120px] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                        options={availableLanguages.map(lang => ({
                          value: lang,
                          label: getLanguageDisplayName(lang)
                        }))}
                      />
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  variant="primary"
                  size="md"
                  loading={submitting}
                  icon={!submitting && <Play size={18} />}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                >
                  {submitting ? 'Running Tests...' : 'Run Code'}
                </Button>
              </div>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 relative">
              <div className="absolute inset-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 m-4 shadow-lg">
                <Editor
                  height="100%"
                  language={getMonacoLanguage(selectedLanguage)}
                  value={code}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  options={{
                    fontSize: 16,
                    lineNumbers: 'on',
                    automaticLayout: true,
                    tabSize: selectedLanguage === 'python' ? 4 : 2,
                    insertSpaces: true,
                    wordWrap: 'on',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    padding: { top: 16, bottom: 16 },
                    lineHeight: 24,
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Menlo', monospace",
                    cursorBlinking: 'smooth',
                    smoothScrolling: true,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="h-80 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            <div className="h-full flex flex-col">
              {/* Results Header */}
              <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Test Results</h3>
                  {submissionResults && (
                    <Badge 
                      variant={submissionResults.correct?.length === (submissionResults.correct?.length + submissionResults.incorrect?.length) ? 'success' : 'warning'} 
                      size="sm"
                      className="ml-2"
                    >
                      {submissionResults.correct?.length || 0} / {(submissionResults.correct?.length || 0) + (submissionResults.incorrect?.length || 0)} Passed
                    </Badge>
                  )}
                </div>
              </div>

              {/* Results Content */}
              <div className="flex-1 overflow-hidden">
                <TestResults 
                  submissionResults={submissionResults}
                  isLoading={submitting}
                />
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="absolute bottom-4 right-4 max-w-md z-20">
              <ErrorBoundary 
                error={error}
                isJudgeError={true}
                retry={() => {
                  setError('')
                  handleSubmit()
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionSolve