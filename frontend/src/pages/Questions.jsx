import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Code, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Import reusable UI components
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import QuestionCard from '../components/QuestionCard'

const Questions = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async (page = 1) => {
    try {
      setLoading(true)
      // Updated URL to match your backend endpoint
      const response = await fetch(`/api/questions/?page=${page}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Removed Authorization header since you're not using tokens
        }
      })
      
      console.log('Questions response status:', response.status)

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status}`)
      }

      const data = await response.json()
      console.log('Questions data received:', data)
      
      // Handle paginated response structure from your backend
      if (data.results) {
        setQuestions(data.results)
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous
        })
      } else {
        // Fallback for non-paginated response
        setQuestions(Array.isArray(data) ? data : [])
      }
      
      setError('')
    } catch (err) {
      console.error('Error fetching questions:', err)
      setError(err.message)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const filteredQuestions = questions.filter(question =>
    question.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDeleteQuestion = (questionId) => {
    // Remove the deleted question from the local state
    setQuestions(prevQuestions => 
      prevQuestions.filter(question => question.id !== questionId)
    )
    // Update pagination count
    setPagination(prevPagination => ({
      ...prevPagination,
      count: prevPagination.count - 1
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              Coding Challenges
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Master your programming skills with our curated collection of algorithmic problems
            </p>
          </div>

          {/* Search and Actions */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/70 dark:bg-slate-800/70 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 shadow-lg"
              />
            </div>

            {user?.role === 'admin' && (
              <Button
                as={Link}
                to="/admin/questions/new"
                variant="primary"
                size="lg"
                icon={<Plus size={20} />}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
              >
                Create Challenge
              </Button>
            )}
          </div>

          {/* Stats */}
          {pagination.count > 0 && (
            <div className="mt-6 flex justify-center">
              <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full px-6 py-2 border border-slate-200 dark:border-slate-700">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  🎯 {pagination.count} challenges available
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-8">
            <Alert type="error" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 shadow-lg">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-red-500" />
                Error: {error}
              </div>
            </Alert>
          </div>
        )}

        {/* Question Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map((question) => (
            <QuestionCard 
              key={question.id} 
              question={question} 
              onDelete={handleDeleteQuestion}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredQuestions.length === 0 && !loading && !error && (
          <div className="text-center py-16">
            <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 max-w-md mx-auto border border-slate-200 dark:border-slate-700 shadow-lg">
              <Code className="h-16 w-16 mx-auto text-slate-400 dark:text-slate-500 mb-6" />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3">No Challenges Found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                {searchTerm ? `No challenges match "${searchTerm}"` : 'No challenges available yet'}
              </p>
              {user?.role === 'admin' && !searchTerm && (
                <Button
                  as={Link}
                  to="/admin/questions/new"
                  variant="primary"
                  icon={<Plus size={18} />}
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  Create First Challenge
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {(pagination.previous || pagination.next) && (
          <div className="flex justify-center gap-4 mt-12">
            <Button
              variant="outline"
              disabled={!pagination.previous}
              onClick={() => fetchQuestions(1)}
              className="bg-white/70 dark:bg-slate-800/70 border-slate-300 dark:border-slate-600 shadow-lg"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={!pagination.next}
              onClick={() => fetchQuestions(2)}
              className="bg-white/70 dark:bg-slate-800/70 border-slate-300 dark:border-slate-600 shadow-lg"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Questions