import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Loader2, Code, Sparkles } from 'lucide-react'

// Import reusable UI components
import { Card, CardContent } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await login(email, password)
    
    if (!result.success) {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-indigo-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-10 w-16 h-16 bg-pink-500 rounded-full blur-xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                  <Code size={32} className="text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome to GenCoder
              </h1>
              <p className="text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
                <Sparkles size={16} />
                Sign in to start coding
              </p>
            </div>

            {error && (
              <Alert type="error" className="mb-6">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail size={18} className="text-slate-400" />}
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock size={18} className="text-slate-400" />}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading}
                loading={loading}
                icon={loading ? <Loader2 className="animate-spin" size={18} /> : null}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-xl">
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                🚀 Modern Coding Challenge Platform
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Practice algorithms • Build skills • Level up your coding
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login