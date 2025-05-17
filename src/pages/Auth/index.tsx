import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';
import { FileText } from 'lucide-react';

const AuthPage: React.FC = () => {
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
            }
          }}
          providers={[]}
          theme="light"
        />
      </div>
    </div>
  );
};

export default AuthPage;