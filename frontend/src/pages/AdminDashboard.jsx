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

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {value}
            </p>
            {trend && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon size={24} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Admin Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <TrendingUp size={16} />
              Manage your coding challenge platform
            </p>
          </div>
          <Button
            as={Link}
            to="/admin/questions/new"
            variant="primary"
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl"
            icon={<Plus size={20} />}
          >
            Create Question
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Questions"
            value={stats.totalQuestions}
            icon={FileText}
            color="from-blue-500 to-blue-600"
            trend="+12% this month"
          />
          <StatCard
            title="Active Users"
            value={stats.totalUsers}
            icon={Users}
            color="from-emerald-500 to-emerald-600"
            trend="+8% this month"
          />
          <StatCard
            title="Submissions"
            value={stats.totalSubmissions}
            icon={TrendingUp}
            color="from-purple-500 to-purple-600"
            trend="+25% this month"
          />
          <StatCard
            title="Pending Reviews"
            value={stats.pendingReviews}
            icon={Clock}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Questions Management */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border-b border-slate-200 dark:border-slate-600">
            <CardTitle className="text-2xl">
              Question Management
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <Alert type="error" className="mb-6">
                Error: {error}
              </Alert>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" text="Loading questions..." />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-4 px-2 font-semibold text-slate-700 dark:text-slate-300">Title</th>
                      <th className="text-left py-4 px-2 font-semibold text-slate-700 dark:text-slate-300">Difficulty</th>
                      <th className="text-left py-4 px-2 font-semibold text-slate-700 dark:text-slate-300">Topics</th>
                      <th className="text-left py-4 px-2 font-semibold text-slate-700 dark:text-slate-300">Created</th>
                      <th className="text-left py-4 px-2 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questions.map((question) => (
                      <tr key={question.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-2">
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100">
                              {question.title}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
                              {question.description}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <Badge variant={getDifficultyColor(question.difficulty)} className="capitalize">
                            {question.difficulty}
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex flex-wrap gap-1">
                            {question.tags?.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" size="sm">
                                {tag}
                              </Badge>
                            ))}
                            {question.tags?.length > 3 && (
                              <Badge variant="outline" size="sm">
                                +{question.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {new Date(question.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex gap-2">
                            <Button
                              as={Link}
                              to={`/admin/questions/${question.id}/edit`}
                              variant="outline"
                              size="sm"
                              icon={<Edit size={14} />}
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteQuestion(question.id)}
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                              icon={<Trash2 size={14} />}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {questions.length === 0 && (
                  <div className="text-center py-16">
                    <FileText className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      No questions yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      Start by creating your first coding challenge
                    </p>
                    <Button
                      as={Link}
                      to="/admin/questions/new"
                      variant="primary"
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      icon={<Plus size={20} />}
                    >
                      Create Question
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard