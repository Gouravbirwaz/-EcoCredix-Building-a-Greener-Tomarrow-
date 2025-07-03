import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Import these two

import Home from './components/Home';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Reels from './components/Reels';
import EcoChallenge from './components/EcoChallenge';
import ImpactVisualizer from './components/ImpactVisulizer';
import Navbar from './components/Navbar';
import RecordReel from './components/RecordReel';
import EditProfile from './components/EditProfile';
import RegisterChallenge from './components/RegisterChallenge';
import AdminDashboard from './components/AdminDashboard';
import Community from './components/Community';
import DonationPage from './components/DonationPage';
import CreditRequests from './components/CreditRequests';
import ManageChallenges from './components/ManageChallenges';
import Statistics from './components/Statistics';


const appTheme = createTheme({
  // Example customizations (optional):
  palette: {
    primary: {
      main: '#4CAF50', // A shade of green for primary actions
    },
    secondary: {
      main: '#2196F3', // A shade of blue for secondary actions
    },
    // You can add more palette colors or override existing ones
  },
  typography: {
    // Customize fonts, sizes, weights
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontWeight: 600, // Make your h4 (used in Reels) a bit bolder
    },
  },
  // You can also add spacing, breakpoints, etc.
  // DO NOT define 'shadows' unless you intend to completely replace all 25 default shadows.
  // The default `createTheme()` already provides `theme.shadows[0]` through `theme.shadows[24]`.
});

function App() {
  return (
    <Router>
      {/* Wrap your entire application or the parts using Material-UI components with ThemeProvider */}
      <ThemeProvider theme={appTheme}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/eco-challenge" element={<EcoChallenge />} />
          <Route path="/register-challenge/:challengeId" element={<RegisterChallenge />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/record-reel" element={<RecordReel />} />
          <Route path="/impact" element={<ImpactVisualizer />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/donationPage" element={<DonationPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/credit-requests" element={<CreditRequests />} />
          <Route path="/manage-challenges" element={<ManageChallenges />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </ThemeProvider>
    </Router>
  );
}

export default App;