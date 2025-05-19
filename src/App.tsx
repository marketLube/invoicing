import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InvoiceForm from './pages/InvoiceForm';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import AuthPage from './pages/Auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check initial auth state
    const checkAuthState = async () => {
      try {
        console.log('Checking auth state...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth session error:', error.message);
          setAuthError(error.message);
          setIsAuthenticated(false);
          // Clear any corrupted session data
          localStorage.removeItem('supabase.auth.token');
          try {
            await supabase.auth.signOut();
          } catch (e) {
            console.error('Error during sign out:', e);
          }
        } else {
          console.log('Auth session data:', data);
          setIsAuthenticated(!!data.session);
        }
      } catch (err) {
        console.error('Unexpected auth error:', err);
        setAuthError(err instanceof Error ? err.message : 'Unknown authentication error');
        setIsAuthenticated(false);
      } finally {
        setAuthInitialized(true);
      }
    };

    checkAuthState();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);
      
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        setAuthError(null);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      } else if (event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(!!session);
      } else if (event === 'USER_UPDATED') {
        setIsAuthenticated(!!session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading state while checking auth
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mb-4"></div>
          <div className="text-primary-900">Initializing application...</div>
        </div>
      </div>
    );
  }

  // Show error state if there was an auth error
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Error</h2>
          <p className="mb-4 text-neutral-800">{authError}</p>
          <p className="mb-6 text-neutral-600">Please try clearing your browser cache and cookies, then reload the page.</p>
          <button 
            className="w-full py-2 px-4 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={
          isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />
        } />
        
        <Route path="/" element={
          isAuthenticated ? <Layout /> : <Navigate to="/auth" replace />
        }>
          <Route index element={<Dashboard />} />
          <Route path="invoice/new" element={<InvoiceForm />} />
          <Route path="invoice/edit/:id" element={<InvoiceForm />} />
          <Route path="reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;