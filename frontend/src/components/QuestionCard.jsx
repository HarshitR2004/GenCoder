import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Code, Clock, Trash2, Play, Target, Trophy } from 'lucide-react'
import { Card, CardContent } from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'

const QuestionCard = ({ question, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'neutral'
    }
  }

  const getDifficultyGradient = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'from-green-500 to-emerald-500'
      case 'medium': return 'from-yellow-500 to-orange-500'
      case 'hard': return 'from-red-500 to-pink-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${question.title}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/questions/${question.id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (response.ok) {
        // Call the onDelete callback to update the parent component
        if (onDelete) {
          onDelete(question.id)
        }
      } else {
        const errorData = await response.json()
        alert(`Failed to delete question: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="group relative overflow-hidden bg-white dark:bg-slate-800 border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Gradient Border Top */}
      <div className={`h-1 bg-gradient-to-r ${getDifficultyGradient(question.difficulty)}`}></div>
      
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {question.title || 'Untitled Question'}
            </h2>
            <div className="flex items-center gap-3">
              <Badge 
                variant={getDifficultyColor(question.difficulty)} 
                className={`bg-gradient-to-r ${getDifficultyGradient(question.difficulty)} text-white border-0 shadow-sm`}
              >
                {question.difficulty || 'Medium'}
              </Badge>
              <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                <Target size={14} />
                <span className="text-xs">Challenge</span>
              </div>
            </div>
          </div>
          
          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
            title="Delete Question"
          >
            <Trash2 size={16} />
          </Button>
        </div>

        {/* Topics */}
        <div className="flex flex-wrap gap-2 mb-6 min-h-[2rem]">
          {question.topics?.slice(0, 3).map((topic) => (
            <Badge key={topic.id} variant="outline" size="sm" className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600">
              {topic.name}
            </Badge>
          ))}
          {question.topics?.length > 3 && (
            <Badge variant="outline" size="sm" className="bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600">
              +{question.topics.length - 3}
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-6 py-3 px-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Code size={14} />
              <span>Algorithm</span>
            </div>
            <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Clock size={14} />
              <span>~30min</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <Trophy size={14} />
            <span className="text-sm font-medium">100 pts</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-3">
          <Button
            as={Link}
            to={`/questions/${question.id}`}
            variant="primary"
            size="md"
            icon={<Play size={16} />}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 shadow-lg"
          >
            Start Challenge
          </Button>
        </div>

        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </CardContent>
    </Card>
  )
}

export default QuestionCard
