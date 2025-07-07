import React, { useState, useEffect } from 'react'
import { Code, Wand2 } from 'lucide-react'
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
      { value: 'two_int_to_int', label: 'Two Integers → Integer' },
      { value: 'three_int_to_int', label: 'Three Integers → Integer' },
      { value: 'string_to_string', label: 'String → String' },
      { value: 'int_array_to_int', label: 'Integer Array → Integer' },
      { value: 'string_array_to_string', label: 'String Array → String' },
      { value: 'mixed_to_string', label: 'Mixed (Int, String) → String' },
      { value: 'single_argument', label: 'Single Argument → String' }
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

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 size={20} />
          Starter Code Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="label">
              <span className="label-text font-medium">Select Template Type</span>
            </label>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={[
                { value: '', label: 'Choose a template...' },
                ...starterCodeTypes
              ]}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={handleLoadStarterCode}
            disabled={!selectedType || loading}
            loading={loading}
            icon={<Code size={16} />}
          >
            {loading ? 'Loading...' : 'Load Template'}
          </Button>
        </div>

        {selectedType && (
          <div className="mt-4 p-3 bg-base-200 rounded-lg">
            <div className="text-sm">
              <strong>Selected:</strong>{' '}
              {starterCodeTypes.find(type => type.value === selectedType)?.label}
            </div>
            <div className="text-xs text-base-content/60 mt-1">
              This will generate function templates for all supported languages.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default StarterCodeSelector
