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

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Show loading state while checking auth
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-primary-900">Loading...</div>
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