import { Link } from "react-router-dom";
import { Code } from 'lucide-react';
import { Button } from "../components/ui/button";

const Home = () => {
  return (
    <div 
      className="min-h-screen bg-black flex flex-col items-center justify-center text-white"
      style={{
        backgroundColor: 'black',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}
    >
      <div className="text-center max-w-4xl px-6">
        {/* Title with Icon */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            marginBottom: '1rem',
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#10b981'
          }}
        >
          <Code size={48} style={{ marginRight: '0.75rem' }} />
            GenCoder
        </div>

        {/* Subtitle */}
        <p 
          style={{
            color: '#9ca3af', 
            fontSize: '1.25rem', 
            marginBottom: '3rem',
            lineHeight: '1.6',
            maxWidth: '0 0 3rem 0',
            margin: 'left'
          }}
        >
          Master your coding skills 
        </p>

        {/* Buttons */}
        <div style={{display: 'flex', gap: '1.5rem', justifyContent: 'center'}}>
          <Link to="/login">
            <button
              style={{
                backgroundColor: '#10b981',
                color: 'black',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '140px'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#10b981'}
            >
              Login
            </button>
          </Link>

          <Link to="/questions">
            <button
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                padding: '0.75rem 2rem',
                borderRadius: '0.5rem',
                border: '2px solid #4b5563',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                minWidth: '140px'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#374151';
                e.target.style.borderColor = '#6b7280';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.borderColor = '#4b5563';
              }}
            >
              Browse Questions
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export { Home };
