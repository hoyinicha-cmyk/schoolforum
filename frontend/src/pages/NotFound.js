import { useNavigate } from 'react-router-dom';
import { HomeIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <h1 className="text-9xl font-bold text-emerald-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mt-4">Page Not Found</h2>
        <p className="text-gray-600 mt-2 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or you don't have access to it.
        </p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={() => navigate(-1)} 
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <HomeIcon className="h-5 w-5" />
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
