import React, { useState, useEffect } from 'react'
import { Code, Wand2, Sparkles, Zap } from 'lucide-react'
import Button from '../ui/Button'
import Select from '../ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'

const StarterCodeSelector = ({ onStarterCodeSelect }) => {
  const [starterCodeTypes, setStarterCodeTypes] = useState([])
  const [selectedType, setSelectedType] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load available starter code types
    const types = [
      { value: 'two_int_to_int', label: 'Two Integers → Integer', description: 'Perfect for mathematical operations' },
      { value: 'three_int_to_int', label: 'Three Integers → Integer', description: 'Complex mathematical functions' },
      { value: 'string_to_string', label: 'String → String', description: 'Text processing algorithms' },
      { value: 'int_array_to_int', label: 'Integer Array → Integer', description: 'Array manipulation problems' },
      { value: 'string_array_to_string', label: 'String Array → String', description: 'String array operations' },
      { value: 'mixed_to_string', label: 'Mixed (Int, String) → String', description: 'Multi-type input problems' },
      { value: 'single_argument', label: 'Single Argument → String', description: 'Simple input-output functions' }
    ]
    setStarterCodeTypes(types)
  }, [])

  const handleLoadStarterCode = async () => {
    if (!selectedType) return

    setLoading(true)
    try {
      // Pass the selected type to the parent, which will handle loading for all languages
      onStarterCodeSelect(selectedType)
    } catch (error) {
      console.error('Error loading starter code:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedTypeData = starterCodeTypes.find(type => type.value === selectedType)

  return (
    <Card className="mb-6 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-purple-200 dark:border-purple-700">
        <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
            <Wand2 size={18} className="text-white" />
          </div>
          Starter Code Templates
          <Sparkles size={16} className="text-purple-500" />
        </CardTitle>
        <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
          Generate function templates automatically for all programming languages
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-end gap-4">
          <div className="flex-1">
            <Select
              label="Template Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={[
                { value: '', label: 'Choose a template type...' },
                ...starterCodeTypes
              ]}
              className="bg-white dark:bg-slate-800"
            />
          </div>
          
          <Button
            variant="primary"
            onClick={handleLoadStarterCode}
            disabled={!selectedType || loading}
            loading={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl lg:w-auto w-full"
            icon={loading ? null : <Zap size={16} />}
          >
            {loading ? 'Generating...' : 'Generate Templates'}
          </Button>
        </div>

        {selectedTypeData && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-500 rounded-lg shadow-sm">
                <Code size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-purple-800 dark:text-purple-200">
                    {selectedTypeData.label}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                    <Sparkles size={12} />
                    Template Selected
                  </div>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-3">
                  {selectedTypeData.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'Java', 'C++'].map(lang => (
                    <div key={lang} className="px-2 py-1 bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 text-xs rounded-lg border border-purple-200 dark:border-purple-600 shadow-sm">
                      {lang}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StarterCodeSelector
