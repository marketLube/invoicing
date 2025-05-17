import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-primary-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-neutral-800 mb-6">Page Not Found</h2>
      <p className="text-neutral-600 max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary flex items-center gap-2">
        <Home size={16} />
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;