import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Settings, Code, Shield } from 'lucide-react'

// Import reusable UI components
import Button from './ui/Button'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-lg border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Button 
              as={Link} 
              to="/questions" 
              variant="ghost" 
              className="text-xl font-bold group hover:bg-transparent p-2"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-200">
                  <Code size={20} className="text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  GenCoder
                </span>
              </div>
            </Button>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Button 
              as={Link} 
              to="/questions" 
              variant="ghost"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Questions
            </Button>
            {user?.role === 'admin' && (
              <Button 
                as={Link} 
                to="/admin" 
                variant="ghost"
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                icon={<Shield size={16} />}
              >
                Admin
              </Button>
            )}
          </div>
          
          {/* User Menu */}
          <div className="relative">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <User size={18} className="text-white" />
                </div>
              </label>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow-xl menu menu-sm dropdown-content bg-white dark:bg-slate-800 rounded-xl w-64 border border-slate-200 dark:border-slate-700">
                {/* User Info */}
                <li className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {user?.name || user?.email}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-slate-400 capitalize">
                      {user?.role} Account
                    </span>
                  </div>
                </li>
                
                {/* Mobile Navigation Links */}
                <div className="md:hidden border-b border-slate-200 dark:border-slate-700 pb-2 mb-2">
                  <li>
                    <Button 
                      as={Link}
                      to="/questions" 
                      variant="ghost"
                      className="text-slate-600 dark:text-slate-300 justify-start w-full"
                    >
                      Questions
                    </Button>
                  </li>
                  {user?.role === 'admin' && (
                    <li>
                      <Button 
                        as={Link}
                        to="/admin" 
                        variant="ghost"
                        className="text-slate-600 dark:text-slate-300 justify-start w-full"
                        icon={<Shield size={16} />}
                      >
                        Admin Panel
                      </Button>
                    </li>
                  )}
                </div>
                
                {/* Logout */}
                <li>
                  <Button 
                    onClick={logout} 
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 justify-start w-full"
                    icon={<LogOut size={16} />}
                  >
                    Sign Out
                  </Button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar