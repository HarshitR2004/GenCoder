import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Settings } from 'lucide-react'

// Import reusable UI components
import Button from './ui/Button'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <div className="navbar bg-base-200 shadow-lg">
      <div className="navbar-start">
        <Button 
          as={Link} 
          to="/questions" 
          variant="ghost" 
          className="normal-case text-xl"
        >
          <span className="text-primary font-bold">GenCoder</span>
        </Button>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Button as={Link} to="/questions" variant="ghost">
              Questions
            </Button>
          </li>
          {user?.role === 'admin' && (
            <li>
              <Button as={Link} to="/admin" variant="ghost">
                Admin
              </Button>
            </li>
          )}
        </ul>
      </div>
      
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
              <User size={20} />
            </div>
          </label>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
            <li>
              <div className="flex flex-col">
                <span className="font-semibold">{user?.name || user?.email}</span>
                <span className="text-sm opacity-60">{user?.role}</span>
              </div>
            </li>
            <li><hr className="my-2" /></li>
            <li>
              <Button 
                onClick={logout} 
                variant="ghost"
                className="text-error justify-start"
                icon={<LogOut size={16} />}
              >
                Logout
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar