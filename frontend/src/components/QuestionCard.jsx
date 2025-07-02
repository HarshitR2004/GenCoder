import React from 'react'
import { Link } from 'react-router-dom'
import { Code, Clock } from 'lucide-react'
import { Card, CardContent } from './ui/Card'
import Button from './ui/Button'
import Badge from './ui/Badge'

const QuestionCard = ({ question }) => {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success'
      case 'medium': return 'warning'
      case 'hard': return 'error'
      default: return 'neutral'
    }
  }

  return (
    <Card className="bg-base-200 hover:shadow-xl transition-shadow">
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
  )
}

export default QuestionCard
