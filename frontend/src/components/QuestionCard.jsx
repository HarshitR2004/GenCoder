import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Code, Clock, Trash2 } from 'lucide-react'
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
    <Card className="bg-base-200 hover:shadow-xl transition-shadow">
      <CardContent>
        <div className="flex justify-between items-start mb-3">
          <h2 className="card-title text-lg">{question.title || 'Untitled Question'}</h2>
          <div className="flex items-center gap-2">
            <Badge variant={getDifficultyColor(question.difficulty)}>
              {question.difficulty || 'Medium'}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-error hover:bg-error hover:text-error-content"
              title="Delete Question"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
        
        {/* Display topics as tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {question.topics?.map((topic) => (
            <Badge key={topic.id} variant="outline" size="sm">
              {topic.name}
            </Badge>
          ))}
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
  )
}

export default QuestionCard
