import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, Code, Clock, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Import reusable UI components
import { Card, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

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
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'neutral'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
          <Button
            as={Link}
            to="/admin/questions/new"
            variant="primary"
            icon={<Plus size={20} />}
          >
            Add Question
          </Button>
        )}
      </div>

      <div className="mb-6">
        <div className="form-control w-full max-w-md">
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="h-5 w-5 text-base-content/40" />}
            className="pl-10"
          />
        </div>
      </div>

      {error && (
        <Alert type="error" className="mb-6">
          Error: {error}
        </Alert>
      )}

      {/* Pagination Info */}
      {pagination.count > 0 && (
        <div className="mb-4 text-sm text-base-content/60">
          Total Questions: {pagination.count}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="bg-base-200 hover:shadow-xl transition-shadow">
            <CardContent>
              <div className="flex justify-between items-start mb-3">
                <h2 className="card-title text-lg">{question.title || 'Untitled Question'}</h2>
                <Badge variant={getDifficultyColor(question.difficulty)}>
                  {question.difficulty || 'Medium'}
                </Badge>
              </div>
              
              <p className="text-base-content/80 mb-4 line-clamp-3">
                {question.description || 'No description available'}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {question.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline" size="sm">
                    {tag}
                  </Badge>
                )) || (
                  <Badge variant="outline" size="sm">General</Badge>
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
                <Button
                  as={Link}
                  to={`/questions/${question.id}`}
                  variant="primary"
                  size="sm"
                >
                  Solve Challenge
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination Controls */}
      {(pagination.previous || pagination.next) && (
        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            disabled={!pagination.previous}
            onClick={() => fetchQuestions(1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={!pagination.next}
            onClick={() => fetchQuestions(2)}
          >
            Next
          </Button>
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