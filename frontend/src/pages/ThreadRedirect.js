import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '../utils/apiUrl';

const ThreadRedirect = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForumType = async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/forum/post/${postId}/forum-type`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          // Redirect to the correct forum thread page
          navigate(`/forum/${data.forumType}/thread/${postId}`, { replace: true });
        } else {
          // If post not found, redirect to home
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error fetching forum type:', error);
        navigate('/', { replace: true });
      }
    };

    fetchForumType();
  }, [postId, navigate]);

  return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
    </div>
  );
};

export default ThreadRedirect;
