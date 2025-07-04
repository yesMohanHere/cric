import React, { useState, useEffect } from 'react';

function ResultsDisplay({ videoId, availableLabels, onGetHighlights, isLoadingHighlights }) {
  const [selectedLabel, setSelectedLabel] = useState('');

  // Reset selectedLabel if availableLabels change (e.g., new video analyzed)
  useEffect(() => {
    if (availableLabels && availableLabels.length > 0 && !availableLabels.includes(selectedLabel)) {
      setSelectedLabel(''); // Reset if current selection is no longer valid or on initial load
    }
  }, [availableLabels]);


  const handleLabelChange = (event) => {
    setSelectedLabel(event.target.value);
  };

  const handleFetchHighlights = () => {
    if (selectedLabel) {
      onGetHighlights(videoId, selectedLabel);
    } else {
      alert('Please select an event label first.');
    }
  };

  if (!availableLabels || availableLabels.length === 0) {
    return (
      <div className="results-display card"> {/* Added card class */}
        <h3>View Highlights</h3>
        <p className="message info">No highlight labels available for this video yet, or analysis is still in progress.</p>
      </div>
    );
  }

  return (
    <div className="results-display card"> {/* Added card class */}
      <h3>View Highlights</h3>
      <div>
        <label htmlFor="label-select">Select Event Type: </label>
        <select id="label-select" value={selectedLabel} onChange={handleLabelChange}>
          <option value="">-- Select an Event --</option>
          {availableLabels.map((label) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="highlight-button-container">
        <button
          onClick={handleFetchHighlights}
          disabled={!selectedLabel || isLoadingHighlights}
          className="primary" /* Assuming primary is your default button style */
        >
          {isLoadingHighlights ? 'Loading Highlights...' : 'Get Highlights Clip'}
        </button>
      </div>
    </div>
  );
}

export default ResultsDisplay;
