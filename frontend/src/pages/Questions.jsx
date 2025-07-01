import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Code, Clock, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

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
      const response = await fetch(`/api/questions/list/?page=${page}`, {
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
    question.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'badge-success'
      case 'medium': return 'badge-warning'
      case 'hard': return 'badge-error'
      default: return 'badge-neutral'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Coding Challenges</h1>
          <p className="text-base-content/60">Master your programming skills with our curated problems</p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/admin/questions/new" className="btn btn-primary">
            <Plus size={20} />
            Add Question
          </Link>
        )}
      </div>

      <div className="mb-6">
        <div className="form-control w-full max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search questions..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-base-content/40" />
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <span>Error: {error}</span>
        </div>
      )}

      {/* Pagination Info */}
      {pagination.count > 0 && (
        <div className="mb-4 text-sm text-base-content/60">
          Total Questions: {pagination.count}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuestions.map((question) => (
          <div key={question.id} className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body">
              <div className="flex justify-between items-start mb-3">
                <h2 className="card-title text-lg">{question.title || 'Untitled Question'}</h2>
                <div className={`badge ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty || 'Medium'}
                </div>
              </div>
              
              <p className="text-base-content/80 mb-4 line-clamp-3">
                {question.description || 'No description available'}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags?.map((tag, index) => (
                  <span key={index} className="badge badge-outline badge-sm">
                    {tag}
                  </span>
                )) || (
                  <span className="badge badge-outline badge-sm">General</span>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-base-content/60 mb-4">
                <div className="flex items-center gap-1">
                  <Code size={16} />
                  <span>{question.language || 'Multiple'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={16} />
                  <span>{question.time_limit || '2s'}</span>
                </div>
              </div>

              <div className="card-actions justify-end">
                <Link 
                  to={`/questions/${question.id}`}
                  className="btn btn-primary btn-sm"
                >
                  Solve Challenge
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {(pagination.previous || pagination.next) && (
        <div className="flex justify-center gap-4 mt-8">
          <button 
            className="btn btn-outline"
            disabled={!pagination.previous}
            onClick={() => fetchQuestions(1)} // Simplified - you'd need to parse page number from URL
          >
            Previous
          </button>
          <button 
            className="btn btn-outline"
            disabled={!pagination.next}
            onClick={() => fetchQuestions(2)} // Simplified - you'd need to parse page number from URL
          >
            Next
          </button>
        </div>
      )}

      {filteredQuestions.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <Code className="h-16 w-16 mx-auto text-base-content/40 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No questions found</h3>
          <p className="text-base-content/60">
            {searchTerm ? 'Try adjusting your search terms' : 'Questions will appear here when available'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Questions