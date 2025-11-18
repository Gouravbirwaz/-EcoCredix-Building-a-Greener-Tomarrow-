// Inside src/components/IssueReportButton.js

import React from 'react';
import { useNavigate } from 'react-router-dom';

// Note: Remove any absolute/fixed positioning styles here.
const IssueReportButton = ({ userLoggedIn, style = {} }) => {
  const navigate = useNavigate();

  if (!userLoggedIn) {
    return null; 
  }

  const handleClick = () => {
    navigate('/report-issue');
  };

  return (
    <button
      onClick={handleClick}
      style={style} // Apply custom styles passed from Dashboard.js
      // Use styles that match your upload button (e.g., from MUI/Tailwind)
      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow-md"
      aria-label="Report an Eco-issue"
    >
      ⚠️ Report an Issue
    </button>
  );
};

export default IssueReportButton;