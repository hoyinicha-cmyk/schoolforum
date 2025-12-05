import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldExclamationIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const AccessDenied = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Get the forum type from the URL or state
  const deniedForum = location.state?.forumType || 'this forum';
  
  const getForumName = (type) => {
    if (type === 'g11') return 'Grade 11 Forum';
    if (type === 'g12') return 'Grade 12 Forum';
    return 'this forum';
  };
  
  const getRequiredGrade = (type) => {
    if (type === 'g11') return 'Grade 11';
    if (type === 'g12') return 'Grade 12';
    return '';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icon */}
          <div className="mx-auto h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ShieldExclamationIcon className="h-12 w-12 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Access Denied
          </h1>

          {/* Message */}
          <p className="text-gray-600 mb-2">
            You don't have permission to access <strong>{getForumName(deniedForum)}</strong>.
          </p>
          
          {deniedForum === 'g11' || deniedForum === 'g12' ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 mt-4">
              <p className="text-sm text-yellow-800">
                <strong>This section is only for {getRequiredGrade(deniedForum)} students.</strong>
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                You are currently registered as: <strong>{user.yearLevel}</strong>
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 mt-4">
              <p className="text-sm text-blue-800">
                Your account may not have the required permissions to access this content.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate(-1)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Go Back
            </button>
            
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-gray-500 mt-6">
            If you believe this is an error, please contact an administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
