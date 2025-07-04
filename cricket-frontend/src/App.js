import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import VideoUpload from './components/VideoUpload';
import AnalysisControls from './components/AnalysisControls';
import ResultsDisplay from './components/ResultsDisplay';
import VideoPlayer from './components/VideoPlayer'; // Import VideoPlayer
import { startAnalysis, getAnalysisStatus, getHighlights } from './services/api';

function App() {
  // State variables
  const [currentVideoFile, setCurrentVideoFile] = useState(null);
  const [uploadedVideoInfo, setUploadedVideoInfo] = useState(null); // { videoId, fileName }
  const [currentJobId, setCurrentJobId] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('initial'); // 'initial', 'uploading', 'ready', 'loading', 'polling', 'complete', 'error'
  const [availableLabels, setAvailableLabels] = useState([]);
  const [highlightVideoUrl, setHighlightVideoUrl] = useState('');
  const [selectedLabelForPlayer, setSelectedLabelForPlayer] = useState(''); // To pass to VideoPlayer
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(false);
  const pollingIntervalRef = useRef(null);

  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const pollAnalysisStatus = useCallback(async (jobId) => {
    if (!jobId) return;
    try {
      console.log("Polling for status of job:", jobId);
      const response = await getAnalysisStatus(jobId);
      if (response.status === 'complete') {
        setAnalysisStatus('complete');
        setAvailableLabels(response.labels || []);
        setCurrentJobId(null);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      } else if (response.status === 'processing') {
        setAnalysisStatus('polling');
      } else {
        setAnalysisStatus('error');
        console.error("Analysis failed or unknown status:", response);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Error polling analysis status:', error);
      setAnalysisStatus('error');
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (analysisStatus === 'polling' && currentJobId && !pollingIntervalRef.current) {
      pollingIntervalRef.current = setInterval(() => {
        pollAnalysisStatus(currentJobId);
      }, 3000);
    }

    // If status transitions away from polling, clear any existing interval.
    if (analysisStatus !== 'polling' && pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    // Cleanup on dependency change
    return () => {
      if (pollingIntervalRef.current && analysisStatus !== 'polling') {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [analysisStatus, currentJobId, pollAnalysisStatus]);

  const handleVideoUploadSuccess = ({ videoId, fileName, originalFile }) => {
    setUploadedVideoInfo({ videoId, fileName });
    setCurrentVideoFile(originalFile);
    setAnalysisStatus('ready');
    setAvailableLabels([]);
    setHighlightVideoUrl('');
    setSelectedLabelForPlayer('');
    setCurrentJobId(null);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleStartAnalysis = async () => {
    if (!uploadedVideoInfo) return;
    setAnalysisStatus('loading');
    setHighlightVideoUrl('');
    setSelectedLabelForPlayer('');
    try {
      const response = await startAnalysis(uploadedVideoInfo.videoId);
      if (response.success && response.jobId) {
        setCurrentJobId(response.jobId);
        setAnalysisStatus('polling');
        pollAnalysisStatus(response.jobId);
      } else {
        setAnalysisStatus('error');
        console.error("Failed to start analysis:", response);
      }
    } catch (error) {
      console.error('Error starting analysis:', error);
      setAnalysisStatus('error');
    }
  };

  const handleGetHighlights = async (videoId, label) => {
    if (!videoId || !label) return;
    setIsLoadingHighlights(true);
    setHighlightVideoUrl('');
    setSelectedLabelForPlayer(label); // Set the label for the player
    try {
      const response = await getHighlights(videoId, label);
      if (response.success && response.videoUrl) {
        setHighlightVideoUrl(response.videoUrl);
      } else {
        console.error("Failed to get highlights:", response);
        setHighlightVideoUrl('');
      }
    } catch (error) {
      console.error('Error fetching highlights:', error);
      setHighlightVideoUrl('');
    } finally {
      setIsLoadingHighlights(false);
    }
  };

  const resetApp = () => {
    setCurrentVideoFile(null);
    setUploadedVideoInfo(null);
    setCurrentJobId(null);
    setAnalysisStatus('initial');
    setAvailableLabels([]);
    setHighlightVideoUrl('');
    setSelectedLabelForPlayer('');
    setIsLoadingHighlights(false);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cricket Analysis Platform</h1>
      </header>
      <main>
        {!uploadedVideoInfo ? (
          <VideoUpload onUploadSuccess={handleVideoUploadSuccess} />
        ) : (
          <>
            <AnalysisControls
              videoId={uploadedVideoInfo.videoId}
              fileName={uploadedVideoInfo.fileName}
              onStartAnalysis={handleStartAnalysis}
              analysisStatus={analysisStatus}
              onReset={resetApp}
            />
            {(analysisStatus === 'complete' || (analysisStatus === 'polling' && availableLabels.length > 0)) && (
              <ResultsDisplay
                videoId={uploadedVideoInfo.videoId}
                availableLabels={availableLabels}
                onGetHighlights={handleGetHighlights}
                isLoadingHighlights={isLoadingHighlights}
              />
            )}
            {highlightVideoUrl && (
              <VideoPlayer videoUrl={highlightVideoUrl} label={selectedLabelForPlayer} />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
