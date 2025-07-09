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

const QuestionSolve = () => {
  const { id } = useParams()
  const [question, setQuestion] = useState(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState(null)
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
    try {
      const response = await fetch(`/api/judge/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code,
          language: selectedLanguage 
        })
      })

      if (!response.ok) {
        throw new Error('Submission failed')
      }

      const data = await response.json()
      setResults(data)
    } catch (err) {
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
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-100">
      <div className="h-screen flex flex-col">
        <div className="flex-1 flex">
          {/* Left Panel - Question Details */}
          <div className="w-1/2 border-r border-base-300 overflow-y-auto bg-base-100">
            <div className="p-6">
              {/* Question Header */}
              <Card className="mb-6">
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold text-primary">{question?.title}</h1>
                    <Badge variant={getDifficultyColor(question?.difficulty)} size="lg">
                      {question?.difficulty?.toUpperCase() || 'MEDIUM'}
                    </Badge>
                  </div>

                  {/* Topics */}
                  {question?.topics && question.topics.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {question.topics.map((topic) => (
                        <Badge key={topic.id} variant="outline" size="sm">
                          {topic.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Problem Statement */}
              <Card className="mb-6">
                <CardHeader gradient="bg-gradient-to-r from-secondary/10 to-accent/10">
                  <CardTitle>Problem Statement</CardTitle>
                </CardHeader>

                <CardContent>
                  {/* Rendered Markdown View */}
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        // Custom code block styling (same as QuestionForm)
                        code({node, inline, className, children, ...props}) {
                          return inline ? (
                            <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto border">
                              <code className="font-mono text-sm" {...props}>{children}</code>
                            </pre>
                          )
                        },
                        // Custom blockquote styling (same as QuestionForm)
                        blockquote({children}) {
                          return (
                            <blockquote className="border-l-4 border-primary pl-4 italic bg-primary/5 py-3 rounded-r-lg">
                              {children}
                            </blockquote>
                          )
                        },
                        // Custom heading styling (same as QuestionForm)
                        h1: ({children}) => <h1 className="text-2xl font-bold text-primary mb-4">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-bold text-secondary mb-3">{children}</h2>,
                        h3: ({children}) => <h3 className="text-lg font-semibold mb-2">{children}</h3>
                      }}
                    >
                      {question?.description || '# No Problem Description\n\nNo problem description is available for this question.'}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Panel - Code Editor */}
          <div className="w-1/2 flex flex-col bg-base-100">
            {/* Code Editor Header with Language Selector */}
            <Card className="rounded-none border-0 border-b border-base-300">
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Code size={20} />
                      Code Editor
                    </h2>
                    
                    {/* Language Selector */}
                    {availableLanguages.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium"></span>
                        <Select
                          value={selectedLanguage}
                          onChange={(e) => handleLanguageChange(e.target.value)}
                          size="sm"
                          className="min-w-[120px]"
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
                    size="sm"
                    loading={submitting}
                    icon={!submitting && <Play size={16} />}
                  >
                    {submitting ? 'Running...' : 'Run Code'}
                  </Button>
                </div>

              
              </CardContent>
            </Card>

            {/* Monaco Editor */}
            <div className="flex-1 border-b border-base-300">
              <Editor
                height="100%"
                language={getMonacoLanguage(selectedLanguage)}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  fontSize: 20,
                  lineNumbers: 'on',
                  automaticLayout: true,
                  tabSize: selectedLanguage === 'python' ? 4 : 2,
                  insertSpaces: true,
                  wordWrap: 'on',
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                }}
              />
            </div>

            {/* Test Results Panel */}
            {results && (
              <Card className="rounded-none border-0 max-h-64 overflow-y-auto">
                <CardHeader gradient="bg-gradient-to-r from-accent/10 to-warning/10">
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {results.testCases?.map((result, index) => (
                    <div key={index} className={`flex items-center gap-3 p-3 rounded-lg mb-2 ${
                      result.passed ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                    }`}>
                      {result.passed ? <Check size={16} /> : <X size={16} />}
                      <span className="font-mono text-sm">
                        Test Case {index + 1}: {result.passed ? 'Passed' : 'Failed'}
                      </span>
                      {!result.passed && result.error && (
                        <span className="text-sm opacity-75">- {result.error}</span>
                      )}
                    </div>
                  ))}
                  
                  {results.summary && (
                    <div className="mt-4 p-3 bg-base-200 rounded-lg">
                      <div className="font-semibold mb-2">Summary</div>
                      <div className="text-sm">
                        Passed: {results.summary.passed}/{results.summary.total} test cases
                      </div>
                      {results.summary.runtime && (
                        <div className="text-sm">Runtime: {results.summary.runtime}ms</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionSolve