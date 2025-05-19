import React, { useEffect, useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';
import { FileText, AlertTriangle } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if there's any session issues on page load
    const checkAndFixSession = async () => {
      try {
        console.log('Auth page - Checking session status');
        setLoading(true);
        
        // Try to get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error.message);
          setAuthError(error.message);
          // Clear any potentially corrupted session data
          localStorage.removeItem('supabase.auth.token');
          try {
            await supabase.auth.signOut();
          } catch (e) {
            console.error('Error during sign out:', e);
          }
        } else {
          console.log('Auth session data:', data);
          setAuthError(null);
        }
      } catch (err) {
        console.error('Unexpected error during session check:', err);
        setAuthError(err instanceof Error ? err.message : 'Unknown authentication error');
        // Force clear any potentially corrupted session data
        localStorage.removeItem('supabase.auth.token');
      } finally {
        setLoading(false);
      }
    };
    
    checkAndFixSession();
  }, []);

  // Check if we have the Supabase URL and key
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const hasEnvVars = !!supabaseUrl && !!supabaseKey;

  if (!hasEnvVars) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-card border border-neutral-200 p-6">
          <div className="flex items-center mb-4 text-red-600">
            <AlertTriangle className="mr-2" />
            <h2 className="text-lg font-semibold">Missing Environment Variables</h2>
          </div>
          <p className="mb-4">The Supabase URL and/or API key are missing. Please check your environment configuration.</p>
          <ul className="list-disc pl-5 mb-4 text-sm text-neutral-700">
            <li className="mb-1">VITE_SUPABASE_URL: {supabaseUrl ? 'Present' : 'Missing'}</li>
            <li className="mb-1">VITE_SUPABASE_ANON_KEY: {supabaseKey ? 'Present' : 'Missing'}</li>
          </ul>
          <p className="text-sm text-neutral-600">Create a .env.local file in the project root with these values.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full mb-4"></div>
          <div className="text-primary-900">Checking authentication status...</div>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-card border border-neutral-200 p-6">
          <div className="flex items-center mb-4 text-red-600">
            <AlertTriangle className="mr-2" />
            <h2 className="text-lg font-semibold">Authentication Error</h2>
          </div>
          <p className="mb-4">{authError}</p>
          <button 
            className="w-full py-2 px-4 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="flex items-center gap-2 mb-8">
        <FileText size={32} className="text-primary-900" />
        <h1 className="text-3xl font-semibold text-primary-900">Marketlube Invoices</h1>
      </div>
      
      <div className="w-full max-w-md bg-white rounded-lg shadow-card border border-neutral-200 p-6">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#1A237E',
                  brandAccent: '#283593',
                }
              }
            },
            className: {
              container: 'auth-container',
              button: 'auth-button',
              input: 'auth-input',
              label: 'auth-label',
              message: 'text-sm text-red-600 my-1',
            }
          }}
          providers={[]}
          theme="light"
          redirectTo={window.location.origin}
        />
      </div>
    </div>
  );
};

export default AuthPage;