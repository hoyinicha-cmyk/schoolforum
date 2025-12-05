import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const VerifyEmail = () => {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying your email...");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/auth/verify/${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
          
          // If user is logged in, update their local storage data
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const user = JSON.parse(storedUser);
            user.emailVerified = true;
            localStorage.setItem('user', JSON.stringify(user));
            
            // Reload the page to refresh the UI
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 2000);
          }
        } else {
          setStatus("error");
          setMessage(data.error || data.message || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Server error. Please try again later.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === "loading" && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500"></div>
            </div>
          )}

          {status === "success" && (
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
          )}

          {status === "error" && (
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <XCircleIcon className="h-10 w-10 text-red-600" />
            </div>
          )}

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Email Verification
          </h2>
          
          <p className={`mt-2 text-sm ${
            status === "success" ? "text-green-600" : 
            status === "error" ? "text-red-600" : 
            "text-gray-600"
          }`}>
            {message}
          </p>

          <div className="mt-6 space-y-3">
            {status === "success" && (
              <>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Continue to Login
                </Link>
                <p className="text-xs text-gray-500">
                  You can now log in and upload your School ID for approval.
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <Link
                  to="/resend-verification"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Resend Verification Email
                </Link>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Back to Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
