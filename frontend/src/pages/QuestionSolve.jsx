import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Editor } from '@monaco-editor/react'
import ReactMarkdown from 'react-markdown'
import { Play, Check, X, Loader2 } from 'lucide-react'

const QuestionSolve = () => {
  const { id } = useParams()
  const [question, setQuestion] = useState(null)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchQuestion()
  }, [id])

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`/api/questions/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch question')
      }

      const data = await response.json()
      setQuestion(data)
      setCode(data.starterCode || '// Write your solution here\n')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/questions/${id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code })
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="alert alert-error">
          <span>Error: {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Left Panel - Question Details */}
        <div className="w-1/2 border-r border-base-300 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">{question?.title}</h1>
              <div className={`badge ${question?.difficulty === 'easy' ? 'badge-success' : 
                question?.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>
                {question?.difficulty}
              </div>
            </div>

            <div className="prose prose-sm max-w-none mb-6">
              <ReactMarkdown>{question?.description}</ReactMarkdown>
            </div>

            {question?.examples && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Examples</h3>
                {question.examples.map((example, index) => (
                  <div key={index} className="bg-base-200 p-4 rounded-lg mb-3">
                    <div className="font-mono text-sm">
                      <div className="mb-2">
                        <strong>Input:</strong> {example.input}
                      </div>
                      <div className="mb-2">
                        <strong>Output:</strong> {example.output}
                      </div>
                      {example.explanation && (
                        <div className="text-base-content/60">
                          <strong>Explanation:</strong> {example.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {question?.constraints && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Constraints</h3>
                <div className="bg-base-200 p-4 rounded-lg">
                  <ReactMarkdown className="prose prose-sm">{question.constraints}</ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-base-300">
            <h2 className="text-lg font-semibold">Code Editor</h2>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-primary btn-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Running...
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" />
                  Run Code
                </>
              )}
            </button>
          </div>

          <div className="flex-1">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
              }}
            />
          </div>

          {/* Test Results */}
          {results && (
            <div className="border-t border-base-300 p-4 max-h-64 overflow-y-auto">
              <h3 className="text-lg font-semibold mb-3">Test Results</h3>
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionSolve