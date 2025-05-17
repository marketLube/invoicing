import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { BarChart3, FileText, Home, Plus, Menu, X, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error logging out:', error.message);
        alert('Failed to log out. Please try again.');
        return;
      }
      
      // Clear any local storage cache that might be persisting the session
      localStorage.removeItem('supabase.auth.token');
      
      // Force navigate to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Unexpected error logging out:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <FileText size={28} className="text-primary-900" />
            <h1 className="text-xl md:text-3xl font-semibold text-primary-900">
              <span className="hidden sm:inline">Marketlube</span> Invoices
            </h1>
          </Link>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-neutral-100 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `flex items-center gap-2 py-2 font-medium ${isActive ? 'text-primary-900' : 'text-neutral-600 hover:text-primary-900'}`
                }
                end
              >
                <Home size={18} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink 
                to="/reports" 
                className={({ isActive }) => 
                  `flex items-center gap-2 py-2 font-medium ${isActive ? 'text-primary-900' : 'text-neutral-600 hover:text-primary-900'}`
                }
              >
                <BarChart3 size={18} />
                <span>Reports</span>
              </NavLink>
            </nav>
            
            <div className="flex items-center gap-3">
              <Link to="/invoice/new" className="btn btn-primary">
                <Plus size={16} />
                <span>New Invoice</span>
              </Link>
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="btn btn-outline flex items-center gap-2"
              >
                <LogOut size={16} />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-neutral-200">
            <nav className="flex flex-col gap-2 mt-3">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  `flex items-center gap-2 p-3 rounded-lg font-medium ${
                    isActive 
                      ? 'bg-primary-50 text-primary-900' 
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-900'
                  }`
                }
                end
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={18} />
                <span>Dashboard</span>
              </NavLink>
              <NavLink 
                to="/reports" 
                className={({ isActive }) => 
                  `flex items-center gap-2 p-3 rounded-lg font-medium ${
                    isActive 
                      ? 'bg-primary-50 text-primary-900' 
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-primary-900'
                  }`
                }
                onClick={() => setIsMenuOpen(false)}
              >
                <BarChart3 size={18} />
                <span>Reports</span>
              </NavLink>
              <Link 
                to="/invoice/new" 
                className="btn btn-primary w-full justify-center mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Plus size={16} />
                <span>New Invoice</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="btn btn-outline w-full justify-center mt-2"
              >
                <LogOut size={16} />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;