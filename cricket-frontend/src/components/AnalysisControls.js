import React from 'react';

function AnalysisControls({ videoId, fileName, onStartAnalysis, analysisStatus, onReset }) {

  const getStatusMessage = () => {
    switch (analysisStatus) {
      case 'ready':
        return <p>Ready to analyze <strong>{fileName}</strong>.</p>;
      case 'loading':
        return <p className="analysis-status-loading">Initializing analysis...</p>;
      case 'polling':
        return <p className="analysis-status-loading">Analysis in progress, please wait...</p>;
      case 'complete':
        return <p className="analysis-status-complete">Analysis complete for <strong>{fileName}</strong>! You can now select highlights below.</p>;
      case 'error':
        return <p className="analysis-status-error">Analysis failed. Please try resetting or upload a new video.</p>;
      default:
        return <p>Video uploaded: <strong>{fileName}</strong></p>;
    }
  };

  return (
    <div className="analysis-controls card"> {/* Added card class */}
      <h3>Video Analysis</h3>
      {getStatusMessage()}
      <div style={{ marginTop: '15px' }}>
        {(analysisStatus === 'ready' || analysisStatus === 'error') && (
          <button onClick={onStartAnalysis} disabled={analysisStatus === 'loading' || analysisStatus === 'polling'}>
            Start Analysis
          </button>
        )}
        {(analysisStatus === 'loading' || analysisStatus === 'polling') && (
            <button disabled>Processing...</button>
        )}
        <button onClick={onReset} className="warning" style={{ marginLeft: '10px' }}>
          Upload New Video
        </button>
      </div>
    </div>
  );
}

export default AnalysisControls;
