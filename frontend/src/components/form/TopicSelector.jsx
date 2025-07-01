import React from 'react'
import { Tag } from 'lucide-react'
import Checkbox from '../ui/Checkbox'
import Badge from '../ui/Badge'

const TopicSelector = ({ 
  topics = [], 
  selectedTopicIds = [], 
  onTopicChange,
  className = '' 
}) => {
  const handleTopicToggle = (topicId) => {
    if (onTopicChange) {
      onTopicChange(topicId)
    }
  }

  return (
    <div className={className}>
      <label className="label">
        <span className="label-text font-semibold text-base flex items-center gap-2">
          <Tag size={16} />
          Select Topics (Multiple Selection Allowed)
        </span>
      </label>
      
      {/* Scrollable Topics List */}
      <div className="bg-base-200 rounded-lg p-4 max-h-64 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {topics.map((topic) => (
            <div key={topic.id} className="p-3 rounded-lg hover:bg-base-300 transition-colors">
              <Checkbox
                checked={selectedTopicIds.includes(topic.id)}
                onChange={() => handleTopicToggle(topic.id)}
                label={topic.name || topic.topic}
                className="w-full"
              />
              {topic.question_count !== undefined && (
                <Badge variant="secondary" size="sm" className="ml-auto">
                  {topic.question_count}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Selection Summary */}
      <div className="mt-3 flex justify-between items-center">
        <span className="text-sm text-base-content/60">
          Selected: {selectedTopicIds.length} topic{selectedTopicIds.length !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-base-content/40">
          Available in: Python, Java, C++
        </span>
      </div>

      {/* Selected Topics Display */}
      {selectedTopicIds.length > 0 && (
        <div className="mt-6 p-4 bg-base-300 rounded-lg">
          <h4 className="font-semibold mb-3">Selected Topics:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTopicIds.map(topicId => {
              const topic = topics.find(t => t.id === topicId)
              return topic ? (
                <Badge key={`topic-${topicId}`} variant="primary" className="gap-2">
                  <Tag size={12} />
                  {topic.name || topic.topic}
                  <button
                    type="button"
                    onClick={() => handleTopicToggle(topicId)}
                    className="btn btn-ghost btn-xs text-primary-content hover:text-error ml-1"
                  >
                    ×
                  </button>
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default TopicSelector
