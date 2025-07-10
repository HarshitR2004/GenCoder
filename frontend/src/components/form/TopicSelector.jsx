import React from 'react'
import { Tag, Sparkles, X } from 'lucide-react'
import Checkbox from '../ui/Checkbox'
import Badge from '../ui/Badge'
import Button from '../ui/Button'

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
      <label className="block mb-4">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <div className="p-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Tag size={14} className="text-white" />
          </div>
          Select Topics
          <Badge variant="outline" size="sm" className="text-xs">
            {selectedTopicIds.length} selected
          </Badge>
        </span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Choose multiple topics to categorize your question
        </p>
      </label>
      
      {/* Scrollable Topics List */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-xl p-6 max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-600 shadow-inner">
        {topics.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="h-12 w-12 mx-auto text-slate-400 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No topics available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className={`
                  p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                  ${selectedTopicIds.includes(topic.id)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500 hover:shadow-sm'
                  }
                `}
                onClick={() => handleTopicToggle(topic.id)}
              >
                <Checkbox
                  checked={selectedTopicIds.includes(topic.id)}
                  onChange={() => handleTopicToggle(topic.id)}
                  label={
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {topic.name || topic.topic}
                      </span>
                      {topic.question_count !== undefined && (
                        <Badge variant="outline" size="sm" className="text-xs">
                          {topic.question_count}
                        </Badge>
                      )}
                    </div>
                  }
                  variant={selectedTopicIds.includes(topic.id) ? 'primary' : 'secondary'}
                />
                {topic.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {topic.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selection Summary */}
      <div className="mt-4 flex justify-between items-center text-sm">
        <span className="text-slate-600 dark:text-slate-400">
          Selected: {selectedTopicIds.length} topic{selectedTopicIds.length !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
          <Sparkles size={12} />
          Available in: Python, Java, C++
        </span>
      </div>

      {/* Selected Topics Display */}
      {selectedTopicIds.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1 bg-green-500 rounded-full">
              <Tag size={12} className="text-white" />
            </div>
            <h4 className="font-semibold text-green-800 dark:text-green-200">
              Selected Topics
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTopicIds.map(topicId => {
              const topic = topics.find(t => t.id === topicId)
              return topic ? (
                <Badge 
                  key={`topic-${topicId}`} 
                  variant="success" 
                  className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 flex items-center gap-2"
                >
                  {topic.name || topic.topic}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTopicToggle(topicId)}
                    className="p-0 h-4 w-4 text-green-700 dark:text-green-300 hover:text-red-600 dark:hover:text-red-400"
                    icon={<X size={12} />}
                  />
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
