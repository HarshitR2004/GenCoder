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
