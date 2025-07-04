// Simulates API calls

/**
 * Simulates uploading a video file.
 * @param {File} file The video file to upload.
 * @returns {Promise<object>} A promise that resolves with a mock success response.
 */
export const uploadVideo = (file) => {
  console.log('API Service: Starting upload for', file.name);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (file) {
        const mockVideoId = `vid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        console.log('API Service: Upload success for', file.name, 'Mock Video ID:', mockVideoId);
        resolve({ success: true, videoId: mockVideoId, fileName: file.name });
      } else {
        console.error('API Service: Upload failed, no file provided.');
        reject({ success: false, message: 'No file provided for upload.' });
      }
    }, 1500);
  });
};

/**
 * Simulates starting the analysis process for a video.
 * @param {string} videoId The ID of the video to analyze.
 * @returns {Promise<object>} A promise that resolves with a mock job ID.
 */
export const startAnalysis = (videoId) => {
  console.log('API Service: Starting analysis for video ID:', videoId);
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockJobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      console.log('API Service: Analysis started. Mock Job ID:', mockJobId);
      resolve({ success: true, jobId: mockJobId });
    }, 1000); // Simulate 1 second delay
  });
};

/**
 * Simulates fetching the status of an analysis job.
 * @param {string} jobId The ID of the analysis job.
 * @returns {Promise<object>} A promise that resolves with mock status and labels.
 */
export const getAnalysisStatus = (jobId) => {
  console.log('API Service: Getting status for job ID:', jobId);
  return new Promise((resolve) => {
    // Simulate polling - first time it's processing, second time it's complete
    const randomDelay = Math.random() * 2000 + 1000; // 1 to 3 seconds
    setTimeout(() => {
      // Simulate a chance of still processing vs complete
      if (Math.random() > 0.3) { // 70% chance of still processing for demo
        console.log('API Service: Analysis still processing for job ID:', jobId);
        resolve({ status: 'processing', labels: [] });
      } else {
        const mockLabels = ['SIX', 'FOUR', 'WICKET', 'DOT BALL', 'COMMENTARY', 'RUN OUT', 'APPEAL'];
        console.log('API Service: Analysis complete for job ID:', jobId, 'Labels:', mockLabels);
        resolve({ status: 'complete', labels: mockLabels });
      }
    }, randomDelay);
  });
};

/**
 * Simulates fetching the compiled highlights video URL.
 * @param {string} videoId The ID of the video.
 * @param {string} label The event label for highlights.
 * @returns {Promise<object>} A promise that resolves with a mock video URL.
 */
export const getHighlights = (videoId, label) => {
  console.log('API Service: Getting highlights for video ID:', videoId, 'Label:', label);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Using a publicly accessible video for testing, with a random part to make it unique
      const mockUrl = `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4#t=${label}_${Date.now()}`;
      console.log('API Service: Highlights ready. Mock URL:', mockUrl);
      resolve({ success: true, videoUrl: mockUrl });
    }, 2000); // Simulate 2 seconds delay
  });
};
