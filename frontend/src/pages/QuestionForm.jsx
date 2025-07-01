import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Save, X, FileText, Eye, EyeOff, Download, Plus, Trash2, Tag, Code, Copy, Check, RotateCcw } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import Editor from '@monaco-editor/react'

// Import reusable UI components
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Textarea from '../components/ui/Textarea'
import Alert from '../components/ui/Alert'
import Tabs from '../components/ui/Tabs'
import Badge from '../components/ui/Badge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import TopicSelector from '../components/form/TopicSelector'

const QuestionForm = () => {
  // =============================================
  // ROUTING AND AUTHENTICATION SETUP
  // =============================================
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuth()
  const isEditing = Boolean(id)

  // =============================================
  // FORM STATE MANAGEMENT
  // =============================================
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'easy',
    markdown_content: '',
    test_cases: [
      {
        input_content: '',
        output_content: '',
        is_example: true,
        is_hidden: false
      }
    ],
    language_ids: [], // Will be populated with all available language IDs
    topic_ids: [],
    starter_code: {} // New field for starter code by language
  })
  
  // =============================================
  // UI STATE MANAGEMENT
  // =============================================
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [languages, setLanguages] = useState([])
  const [topics, setTopics] = useState([])
  
  // =============================================
  // MARKDOWN EDITOR STATE MANAGEMENT
  // =============================================
  const [showPreview, setShowPreview] = useState(false)

  // =============================================
  // CODE EDITOR STATE MANAGEMENT
  // =============================================
  const [activeLanguageTab, setActiveLanguageTab] = useState('python')
  const [copiedLanguage, setCopiedLanguage] = useState(null)
  const [editorTheme, setEditorTheme] = useState('vs-dark')

  // =============================================
  // MONACO EDITOR LANGUAGE MAPPING
  // =============================================
  const getMonacoLanguage = (language) => {
    const languageMap = {
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      
    }
    return languageMap[language] || 'plaintext'
  }

  // =============================================
  // INITIAL DATA LOADING AND AUTHENTICATION CHECK
  // =============================================
  useEffect(() => {
    // Check if user has admin privileges
    if (user?.role !== 'admin' && user?.user_type !== 'admin') {
      navigate('/questions')
      return
    }
    
    // Load necessary data for form
    fetchLanguagesAndTopics()
    
    // If editing, load existing question data
    if (isEditing) {
      fetchQuestion()
    }
  }, [id, user, navigate, isEditing])

  // =============================================
  // API CALLS - FETCH LANGUAGES AND TOPICS
  // =============================================
  const fetchLanguagesAndTopics = async () => {
    try {
      // Fetch all available programming languages
      const langResponse = await fetch('/api/questions/languages/')
      if (langResponse.ok) {
        const langData = await langResponse.json()
        const languageList = langData.results || langData
        setLanguages(languageList)
        
        // Automatically set all languages as selected by default
        const allLanguageIds = languageList.map(lang => lang.id)
        
        // Initialize starter code for all languages
        const initialStarterCode = {}
        languageList.forEach(lang => {
          initialStarterCode[lang.name] = getDefaultStarterCode(lang.name)
        })
        
        setFormData(prev => ({
          ...prev,
          language_ids: allLanguageIds,
          starter_code: initialStarterCode
        }))
        
        // Set default active tab to first language
        if (languageList.length > 0) {
          setActiveLanguageTab(languageList[0].name)
        }
      }

      // Fetch all available question topics
      const topicResponse = await fetch('/api/questions/topics/')
      if (topicResponse.ok) {
        const topicData = await topicResponse.json()
        setTopics(topicData.results || topicData)
      }
    } catch (error) {
      console.error('Error fetching languages/topics:', error)
      setError('Failed to load languages and topics')
    }
  }

  // =============================================
  // DEFAULT STARTER CODE TEMPLATES
  // =============================================
  const getDefaultStarterCode = (language) => {
    const templates = {
      python: `def solution():
    """
    Write your solution here
    
    Returns:
        Your result here
    """
    pass

# Test your solution
if __name__ == "__main__":
    result = solution()
    print(result)`,
      java: `public class Solution {
    /**
     * Write your solution here
     * 
     * @return Your result here
     */
    public void solution() {
        
    }
    
    // Test your solution
    public static void main(String[] args) {
        Solution sol = new Solution();
        sol.solution();
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    /**
     * Write your solution here
     * 
     * @return Your result here
     */
    void solution() {
        
    }
};

// Test your solution
int main() {
    Solution sol;
    sol.solution();
    return 0;
}`,
      javascript: `function solution() {
    /**
     * Write your solution here
     * 
     * @return Your result here
     */
    
}

// Test your solution
console.log(solution());`

    }
    return templates[language] || '// Write your code here'
  }

  // =============================================
  // API CALLS - FETCH EXISTING QUESTION DATA FOR EDITING
  // =============================================
  const fetchQuestion = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/questions/${id}/`)
      
      if (response.ok) {
        const data = await response.json()
        
        // Initialize starter code if not present
        const existingStarterCode = data.starter_code || {}
        const completeStarterCode = {}
        languages.forEach(lang => {
          completeStarterCode[lang.name] = existingStarterCode[lang.name] || getDefaultStarterCode(lang.name)
        })
        
        setFormData({
          title: data.title || '',
          difficulty: data.difficulty || 'easy',
          markdown_content: data.question_content || data.markdown_content || '',
          test_cases: data.test_cases || [
            {
              input_content: '',
              output_content: '',
              is_example: true,
              is_hidden: false
            }
          ],
          // Keep all languages selected even when editing
          language_ids: languages.map(lang => lang.id),
          topic_ids: data.topics?.map(topic => topic.id) || [],
          starter_code: completeStarterCode
        })
      } else {
        setError('Failed to fetch question data')
      }
    } catch (error) {
      console.error('Error fetching question:', error)
      setError('Failed to fetch question data')
    } finally {
      setLoading(false)
    }
  }

  // =============================================
  // FORM INPUT HANDLERS - BASIC FIELDS
  // =============================================
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // =============================================
  // TOPIC SELECTION HANDLER
  // =============================================
  const handleTopicChange = (topicId) => {
    setFormData(prev => ({
      ...prev,
      topic_ids: prev.topic_ids.includes(topicId)
        ? prev.topic_ids.filter(id => id !== topicId) // Remove if already selected
        : [...prev.topic_ids, topicId] // Add if not selected
    }))
  }

  // =============================================
  // STARTER CODE HANDLERS
  // =============================================
  const handleStarterCodeChange = (language, code) => {
    setFormData(prev => ({
      ...prev,
      starter_code: {
        ...prev.starter_code,
        [language]: code
      }
    }))
  }

  const copyStarterCode = async (language) => {
    const code = formData.starter_code[language] || ''
    try {
      await navigator.clipboard.writeText(code)
      setCopiedLanguage(language)
      setTimeout(() => setCopiedLanguage(null), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const resetStarterCode = (language) => {
    const defaultCode = getDefaultStarterCode(language)
    handleStarterCodeChange(language, defaultCode)
  }

  // =============================================
  // TEST CASE MANAGEMENT HANDLERS
  // =============================================
  const handleTestCaseChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      test_cases: prev.test_cases.map((testCase, i) => 
        i === index ? { ...testCase, [field]: value } : testCase
      )
    }))
  }

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      test_cases: [
        ...prev.test_cases,
        {
          input_content: '',
          output_content: '',
          is_example: false,
          is_hidden: false
        }
      ]
    }))
  }

  const removeTestCase = (index) => {
    // Prevent removing the last test case
    if (formData.test_cases.length > 1) {
      setFormData(prev => ({
        ...prev,
        test_cases: prev.test_cases.filter((_, i) => i !== index)
      }))
    }
  }

  // =============================================
  // MARKDOWN FILE HANDLING - DOWNLOAD
  // =============================================
  const downloadMarkdown = () => {
    const element = document.createElement('a')
    const file = new Blob([formData.markdown_content], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = `${formData.title || 'question'}.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  // =============================================
  // FORM SUBMISSION HANDLER
  // =============================================
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Form validation
    if (formData.topic_ids.length === 0) {
      setError('Please select at least one topic')
      setLoading(false)
      return
    }

    // Ensure all languages are selected
    const allLanguageIds = languages.map(lang => lang.id)
    const submissionData = {
      ...formData,
      language_ids: allLanguageIds // Always include all languages
    }

    try {
      // Determine API endpoint and method based on editing state
      const url = isEditing 
        ? `/api/questions/${id}/`
        : '/api/questions/create/'
      
      const method = isEditing ? 'PUT' : 'POST'

      // Submit form data to API
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success || response.status === 200 || response.status === 201) {
          setSuccess(`Question ${isEditing ? 'updated' : 'created'} successfully!`)
          setTimeout(() => {
            navigate('/questions')
          }, 1500)
        } else {
          setError(data.error || 'Failed to save question')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || `Failed to ${isEditing ? 'update' : 'create'} question`)
      }
    } catch (error) {
      console.error('Error saving question:', error)
      setError(`Failed to ${isEditing ? 'update' : 'create'} question`)
    } finally {
      setLoading(false)
    }
  }

  // =============================================
  // LOADING STATE COMPONENT
  // =============================================
  if (loading && isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <LoadingSpinner size="lg" text="Loading question..." />
      </div>
    )
  }

  // =============================================
  // MAIN COMPONENT RENDER
  // =============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-100">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          
          {/* =============================================
              HEADER SECTION - Page Title and Navigation
              ============================================= */}
          <Card className="mb-6">
            <CardContent>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {isEditing ? 'Edit Question' : 'Create New Question'}
                  </h1>
                  <p className="text-base-content/70 text-lg">
                    {isEditing ? 'Update your coding challenge' : 'Design an engaging coding challenge'}
                  </p>
                  <p className="text-sm text-base-content/50 mt-2">
                    Questions are automatically available in all programming languages
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="md"
                  onClick={() => navigate('/questions')}
                  icon={<X size={18} />}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* =============================================
              ALERT MESSAGES - Error and Success Notifications
              ============================================= */}
          {error && (
            <Alert type="error" className="mb-6">
              {error}
            </Alert>
          )}

          {success && (
            <Alert type="success" className="mb-6">
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* =============================================
                BASIC INFORMATION SECTION - Title and Difficulty
                ============================================= */}
            <Card>
              <CardHeader gradient="bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardTitle icon={<FileText size={20} />}>
                  Basic Information
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Question Title Input */}
                  <div className="lg:col-span-2">
                    <Input
                      label="Question Title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="e.g., Two Sum Problem"
                      required
                      size="lg"
                    />
                  </div>

                  {/* Difficulty Level Selection */}
                  <div>
                    <Select
                      label="Difficulty Level"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      size="lg"
                      options={[
                        { value: 'easy', label: 'Easy' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'hard', label: 'Hard' }
                      ]}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* =============================================
                TOPICS SELECTION SECTION - Multi-select Topics
                ============================================= */}
            <Card>
              <CardHeader gradient="bg-gradient-to-r from-info/10 to-success/10">
                <CardTitle icon={<Tag size={20} />}>
                  Question Topics
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <TopicSelector
                  topics={topics}
                  selectedTopicIds={formData.topic_ids}
                  onTopicChange={handleTopicChange}
                />
              </CardContent>
            </Card>

            {/* =============================================
                PROBLEM STATEMENT SECTION - Markdown Editor with Preview
                ============================================= */}
            <Card>
              <CardHeader gradient="bg-gradient-to-r from-secondary/10 to-accent/10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <CardTitle icon={<FileText size={20} />}>
                    Problem Statement
                  </CardTitle>
                  {/* Markdown Editor Controls */}
                  <div className="flex gap-2">
                    <Button
                      variant={showPreview ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                      icon={showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                    >
                      {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </Button>
                    {formData.markdown_content && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadMarkdown}
                        icon={<Download size={16} />}
                      >
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Markdown Editor and Preview Grid */}
                <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
                  
                  {/* Markdown Text Editor */}
                  <div className="space-y-2">
                    <Textarea
                      label="Markdown Content"
                      name="markdown_content"
                      value={formData.markdown_content}
                      onChange={handleInputChange}
                      className="font-mono text-sm resize-none"
                      style={{ height: '500px' }}
                      placeholder={`# Problem Title

## Description
Write your problem description here...

## Examples

### Example 1:
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

## Constraints
- Add your constraints here...

## Follow-up
- Optional follow-up questions...`}
                      required
                    />
                    {/* Character Counter */}
                    <div className="text-right">
                      <span className="text-xs text-base-content/40">
                        {formData.markdown_content.length} characters
                      </span>
                    </div>
                  </div>

                  {/* Live Markdown Preview */}
                  {showPreview && (
                    <div className="space-y-2">
                      <label className="label">
                        <span className="label-text font-semibold text-base">Live Preview</span>
                      </label>
                      <div 
                        className="bg-base-200 p-6 rounded-xl border overflow-y-auto prose prose-sm max-w-none"
                        style={{ height: '500px' }}
                      >
                        {formData.markdown_content ? (
                          <ReactMarkdown
                            components={{
                              // Custom code block styling
                              code({node, inline, className, children, ...props}) {
                                return inline ? (
                                  <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <pre className="bg-base-300 p-4 rounded-lg overflow-x-auto border">
                                    <code className="font-mono text-sm" {...props}>{children}</code>
                                  </pre>
                                )
                              },
                              // Custom blockquote styling
                              blockquote({children}) {
                                return (
                                  <blockquote className="border-l-4 border-primary pl-4 italic bg-primary/5 py-3 rounded-r-lg">
                                    {children}
                                  </blockquote>
                                )
                              },
                              // Custom heading styling
                              h1: ({children}) => <h1 className="text-2xl font-bold text-primary mb-4">{children}</h1>,
                              h2: ({children}) => <h2 className="text-xl font-bold text-secondary mb-3">{children}</h2>,
                              h3: ({children}) => <h3 className="text-lg font-semibold mb-2">{children}</h3>
                            }}
                          >
                            {formData.markdown_content}
                          </ReactMarkdown>
                        ) : (
                          /* Empty Preview State */
                          <div className="flex items-center justify-center h-full text-base-content/40">
                            <div className="text-center">
                              <Eye className="h-12 w-12 mx-auto mb-3 opacity-40" />
                              <p className="text-lg">Preview will appear here</p>
                              <p className="text-sm">Start typing markdown content to see the preview</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* =============================================
                STARTER CODE SECTION - Monaco Code Editor
                ============================================= */}
            <Card>
              <CardHeader gradient="bg-gradient-to-r from-warning/10 to-info/10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <CardTitle icon={<Code size={20} />}>
                      Starter Code Templates
                    </CardTitle>
                    <p className="text-sm text-base-content/60 mt-1">
                      Provide initial code templates for each programming language
                    </p>
                  </div>
                  
                  {/* Theme Selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Theme:</label>
                    <Select
                      value={editorTheme}
                      onChange={(e) => setEditorTheme(e.target.value)}
                      size="sm"
                      options={[
                        { value: 'vs-dark', label: 'VS Dark' },
                        { value: 'light', label: 'Light' },
                        { value: 'hc-black', label: 'High Contrast' }
                      ]}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Language Tabs */}
                <div className="tabs tabs-bordered mb-6 overflow-x-auto">
                  {languages.map((language) => (
                    <Button
                      key={language.name}
                      variant="ghost"
                      size="lg"
                      onClick={() => setActiveLanguageTab(language.name)}
                      className={`tab tab-lg flex-shrink-0 ${activeLanguageTab === language.name ? 'tab-active' : ''}`}
                      icon={<Code size={16} />}
                    >
                      {language.name.charAt(0).toUpperCase() + language.name.slice(1)}
                      <Badge variant="outline" size="sm" className="ml-2">
                        {language.name === 'cpp' ? '.cpp' : `.${language.name}`}
                      </Badge>
                    </Button>
                  ))}
                </div>

                {/* Monaco Code Editor for Active Language */}
                {languages.map((language) => (
                  activeLanguageTab === language.name && (
                    <div key={language.name} className="space-y-4">
                      {/* Code Editor Header */}
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <Code size={20} className="text-primary" />
                            <h3 className="text-lg font-bold">
                              {language.name.charAt(0).toUpperCase() + language.name.slice(1)} Template
                            </h3>
                          </div>
                        </div>
                        
                        {/* Code Editor Controls */}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyStarterCode(language.name)}
                            icon={copiedLanguage === language.name ? 
                              <Check size={16} className="text-success" /> : 
                              <Copy size={16} />
                            }
                          >
                            {copiedLanguage === language.name ? 'Copied!' : 'Copy'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => resetStarterCode(language.name)}
                            className="btn-warning"
                            icon={<RotateCcw size={16} />}
                          >
                            Reset
                          </Button>
                        </div>
                      </div>

                      {/* Monaco Code Editor */}
                      <div className="border border-base-300 rounded-lg overflow-hidden">
                        <Editor
                          height="400px"
                          language={getMonacoLanguage(language.name)}
                          theme={editorTheme}
                          value={formData.starter_code[language.name] || ''}
                          onChange={(value) => handleStarterCodeChange(language.name, value || '')}
                          options={{
                            fontSize: 14,
                            lineNumbers: 'on',
                            automaticLayout: true,
                            tabSize: language.name === 'python' ? 4 : 2,
                            insertSpaces: true,
                            wordWrap: 'on'
                          }}
                          loading={<LoadingSpinner size="lg" text="Loading editor..." />}
                        />
                      </div>

                      {/* Code Statistics */}
                      <div className="flex justify-between items-center text-sm text-base-content/60 bg-base-200 px-4 py-2 rounded-lg">
                        <div className="flex gap-4">
                          <span>Lines: {(formData.starter_code[language.name] || '').split('\n').length}</span>
                          <span>Characters: {(formData.starter_code[language.name] || '').length}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${formData.starter_code[language.name] ? 'bg-success' : 'bg-warning'}`}></div>
                          <span>{formData.starter_code[language.name] ? 'Modified' : 'Default'}</span>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </CardContent>
            </Card>

            {/* =============================================
                TEST CASES SECTION - Input/Output Test Cases Management
                ============================================= */}
            <Card>
              <CardHeader gradient="bg-gradient-to-r from-accent/10 to-warning/10">
                <div className="flex justify-between items-center">
                  <CardTitle icon={<FileText size={20} />}>
                    Test Cases
                  </CardTitle>
                  {/* Add New Test Case Button */}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={addTestCase}
                    icon={<Plus size={16} />}
                  >
                    Add Test Case
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Dynamic Test Cases List */}
                {formData.test_cases.map((testCase, index) => (
                  <div key={index} className="bg-base-200 rounded-xl p-5 border border-base-300">
                    
                    {/* Test Case Header */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <h3 className="font-bold text-lg">Test Case {index + 1}</h3>
                      </div>
                      
                      {/* Remove Test Case Button (only show if more than 1 test case) */}
                      {formData.test_cases.length > 1 && (
                        <Button
                          variant="error"
                          size="sm"
                          onClick={() => removeTestCase(index)}
                          icon={<Trash2 size={14} />}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    {/* Input and Output Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                      {/* Input Data Field */}
                      <div>
                        <Textarea
                          label="Input Data"
                          value={testCase.input_content}
                          onChange={(e) => handleTestCaseChange(index, 'input_content', e.target.value)}
                          className="h-28 font-mono text-sm"
                          placeholder="Enter the input for this test case..."
                          required
                        />
                      </div>

                      {/* Expected Output Field */}
                      <div>
                        <Textarea
                          label="Expected Output"
                          value={testCase.output_content}
                          onChange={(e) => handleTestCaseChange(index, 'output_content', e.target.value)}
                          className="h-28 font-mono text-sm"
                          placeholder="Enter the expected output..."
                          required
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </CardContent>
            </Card>

            {/* =============================================
                FORM SUBMISSION SECTION - Save/Cancel Actions
                ============================================= */}
            <Card>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  {/* Form Submission Information */}
                  <div className="text-center md:text-left">
                    <p className="text-base-content/70">
                      Ready to {isEditing ? 'update' : 'publish'} your question?
                    </p>
                    <p className="text-sm text-base-content/50">
                      Make sure all required fields are filled out correctly.
                    </p>
                    <p className="text-xs text-success mt-1">
                      Will be available in all programming languages automatically
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {/* Cancel Button */}
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/questions')}
                    >
                      Cancel
                    </Button>
                    
                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={loading}
                      loading={loading}
                      className="min-w-[200px]"
                      icon={!loading && <Save size={20} />}
                    >
                      {isEditing ? 'Update Question' : 'Create Question'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}

export default QuestionForm