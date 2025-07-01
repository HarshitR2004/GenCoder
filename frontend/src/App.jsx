import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Questions from './pages/Questions'
import QuestionSolve from './pages/QuestionSolve'
import AdminDashboard from './pages/AdminDashboard'
import QuestionForm from './pages/QuestionForm'
import Navbar from './components/Navbar'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" />
}

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth()
  return isAuthenticated && (user?.role === 'admin' || user?.user_type === 'admin') ? 
    children : <Navigate to="/questions" />
}

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      {isAuthenticated && <Navbar />}
      <Routes>
        {/* Redirect root path based on authentication status */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? <Navigate to="/questions" replace /> : <Navigate to="/login" replace />
          } 
        />
        
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login /> : <Navigate to="/questions" />} 
        />
        
        <Route path="/questions" element={
          <ProtectedRoute>
            <Questions />
          </ProtectedRoute>
        } />
        
        <Route path="/questions/:id" element={
          <ProtectedRoute>
            <QuestionSolve />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        <Route path="/admin/questions/new" element={
          <AdminRoute>
            <QuestionForm />
          </AdminRoute>
        } />
        
        <Route path="/admin/questions/:id/edit" element={
          <AdminRoute>
            <QuestionForm />
          </AdminRoute>
        } />
        
        {/* Catch all route - redirect to appropriate page */}
        <Route 
          path="*" 
          element={
            isAuthenticated ? <Navigate to="/questions" replace /> : <Navigate to="/login" replace />
          } 
        />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
