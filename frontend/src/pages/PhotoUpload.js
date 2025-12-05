import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircleIcon, XCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';

const PhotoUpload = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) {
      return;
    }

    // Check file size (500KB = 512000 bytes)
    if (file.size > 500 * 1024) {
      setMessage('File is too large. Maximum size is 500KB.');
      setIsSuccess(false);
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setMessage('Please select an image file (JPG or PNG).');
      setIsSuccess(false);
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    setSelectedFile(file);
    setMessage('');
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a photo first.');
      setIsSuccess(false);
      return;
    }

    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('photo', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/upload/photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Photo uploaded successfully!');
        setIsSuccess(true);
        setUploadedPhoto(data);
        setSelectedFile(null);
        setPreview(null);
      } else {
        setMessage(data.message || data.error || 'Upload failed');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Error uploading photo. Please try again.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Photo</h1>
        <p className="text-sm text-gray-600 mb-6">
          Upload a photo (maximum 500KB). Only JPG and PNG formats are supported.
        </p>

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Requirements:</strong><br/>
            • Maximum file size: 500KB<br/>
            • Supported formats: JPG, PNG<br/>
            • Recommended: Compress your image before uploading
          </p>
        </div>

        <div className="space-y-4">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Photo
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to select a photo
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Max 500KB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Preview */}
          {preview && (
            <div className="border rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <img 
                src={preview} 
                alt="Preview" 
                className="max-w-full h-auto rounded-lg max-h-64 mx-auto"
              />
              {selectedFile && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
          )}

          {/* Message */}
          {message && (
            <div className={`flex items-center space-x-2 p-3 rounded-md ${
              isSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {isSuccess ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <XCircleIcon className="h-5 w-5" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </div>

        {/* Uploaded Photo Info */}
        {uploadedPhoto && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800 font-medium mb-2">
              Upload Successful!
            </p>
            <p className="text-xs text-green-700">
              Filename: {uploadedPhoto.filename}<br/>
              Size: {formatFileSize(uploadedPhoto.size)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUpload;
