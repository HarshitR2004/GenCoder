import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Lock, Loader2 } from 'lucide-react'

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
    <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
      <Card className="w-full max-w-md bg-base-200 shadow-2xl">
        <CardContent>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary">GenCoder</h1>
            <p className="text-base-content/60">Sign in to your account</p>
          </div>

          {error && (
            <Alert type="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
              icon={<Mail className="absolute left-3 top-3 h-5 w-5 text-base-content/40" />}
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10"
              icon={<Lock className="absolute left-3 top-3 h-5 w-5 text-base-content/40" />}
            />

            <div className="form-control mt-6">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
                loading={loading}
                icon={loading && <Loader2 className="animate-spin" size={16} />}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-base-content/60">
              Welcome to GenCoder - Modern Coding Challenge Platform
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login