import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Users, FileText, TrendingUp, Clock } from 'lucide-react'

// Import reusable UI components
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    totalSubmissions: 0,
    pendingReviews: 0
  })
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
    fetchQuestions()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/questions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch questions')
      }

      const data = await response.json()
      setQuestions(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return
    }

    try {
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response.ok) {
        setQuestions(questions.filter(q => q.id !== questionId))
      } else {
        throw new Error('Failed to delete question')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'neutral'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Admin Dashboard</h1>
          <p className="text-base-content/60">Manage your coding challenge platform</p>
        </div>
        <Button
          as={Link}
          to="/admin/questions/new"
          variant="primary"
          icon={<Plus size={20} />}
        >
          Add New Question
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats shadow bg-base-200">
          <div className="stat">
            <div className="stat-figure text-primary">
              <FileText size={32} />
            </div>
            <div className="stat-title">Total Questions</div>
            <div className="stat-value text-primary">{stats.totalQuestions}</div>
          </div>
        </div>

        <div className="stats shadow bg-base-200">
          <div className="stat">
            <div className="stat-figure text-secondary">
              <Users size={32} />
            </div>
            <div className="stat-title">Total Users</div>
            <div className="stat-value text-secondary">{stats.totalUsers}</div>
          </div>
        </div>

        <div className="stats shadow bg-base-200">
          <div className="stat">
            <div className="stat-figure text-accent">
              <TrendingUp size={32} />
            </div>
            <div className="stat-title">Submissions</div>
            <div className="stat-value text-accent">{stats.totalSubmissions}</div>
          </div>
        </div>

        <div className="stats shadow bg-base-200">
          <div className="stat">
            <div className="stat-figure text-warning">
              <Clock size={32} />
            </div>
            <div className="stat-title">Pending Reviews</div>
            <div className="stat-value text-warning">{stats.pendingReviews}</div>
          </div>
        </div>
      </div>

      {/* Questions Management */}
      <div className="card bg-base-200 shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Question Management</h2>
          
          {error && (
            <div className="alert alert-error mb-4">
              <span>Error: {error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="loading loading-spinner loading-lg text-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Difficulty</th>
                    <th>Tags</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question) => (
                    <tr key={question.id}>
                      <td>
                        <div className="font-bold">{question.title}</div>
                        <div className="text-sm opacity-50 truncate max-w-xs">
                          {question.description}
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${getDifficultyColor(question.difficulty)}`}>
                          {question.difficulty}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {question.tags?.slice(0, 3).map((tag) => (
                            <span key={tag} className="badge badge-outline badge-xs">
                              {tag}
                            </span>
                          ))}
                          {question.tags?.length > 3 && (
                            <span className="badge badge-outline badge-xs">
                              +{question.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          {new Date(question.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/questions/${question.id}/edit`}
                            className="btn btn-sm btn-ghost text-primary"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="btn btn-sm btn-ghost text-error"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {questions.length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-16 w-16 mx-auto text-base-content/40 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No questions yet</h3>
                  <p className="text-base-content/60 mb-4">
                    Start by creating your first coding challenge
                  </p>
                  <Link to="/admin/questions/new" className="btn btn-primary">
                    <Plus size={20} />
                    Create Question
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard