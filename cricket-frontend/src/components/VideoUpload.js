import React, { useState } from 'react';
import { uploadVideo } from '../services/api';

function VideoUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'info', 'success', 'error'
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setMessage(`File "${file.name}" selected. Ready to upload.`);
      setMessageType('info');
    } else {
      setSelectedFile(null);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      setIsUploading(true);
      setMessage(`Uploading "${selectedFile.name}"...`);
      setMessageType('info');
      try {
        const response = await uploadVideo(selectedFile);
        if (response.success) {
          setMessage(`File "${selectedFile.name}" uploaded successfully! Video ID: ${response.videoId}`);
          setMessageType('success');
          if (onUploadSuccess) {
            onUploadSuccess({ videoId: response.videoId, fileName: response.fileName, originalFile: selectedFile });
          }
        } else {
          setMessage(`Upload failed: ${response.message || 'Unknown error'}`);
          setMessageType('error');
        }
      } catch (error) {
        console.error('Upload error:', error);
        setMessage(`Upload failed: ${error.message || 'Please check your connection or the file.'}`);
        setMessageType('error');
      } finally {
        setIsUploading(false);
      }
    } else {
      setMessage('Please select a video file first.');
      setMessageType('error');
    }
  };

  return (
    <div className="video-upload-container card"> {/* Added card class */}
      <h2>Upload Cricket Match Video</h2>
      <input
        type="file"
        accept="video/*,video/mp4,video/x-m4v,video/quicktime"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <button onClick={handleUpload} disabled={!selectedFile || isUploading}>
        {isUploading ? 'Uploading...' : 'Upload & Process Video'}
      </button>
      {message && <p className={`message ${messageType}`}>{message}</p>}
    </div>
  );
}

export default VideoUpload;
