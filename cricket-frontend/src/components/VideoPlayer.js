import React from 'react';

function VideoPlayer({ videoUrl, label }) {
  if (!videoUrl) {
    return null;
  }

  return (
    <div className="video-player card"> {/* Added card class */}
      <h3>Highlights for: "{label}"</h3>
      <video controls style={{ width: '100%' }} key={videoUrl}> {/* Use 100% width for responsiveness within card */}
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag. Please try a different browser.
      </video>
    </div>
  );
}

export default VideoPlayer;
