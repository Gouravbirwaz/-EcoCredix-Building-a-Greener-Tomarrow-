import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Firebase Auth imports
import { auth } from './firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

// Component Imports
import Home from './components/Home';
import Dashboard from './components/Dashboard'; // Will receive 'user' prop
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import Reels from './components/Reels';
import EcoChallenge from './components/EcoChallenge';
import ImpactVisualizer from './components/ImpactVisulizer';
import Navbar from './components/Navbar'; // Will receive 'user' prop
import RecordReel from './components/RecordReel';
import EditProfile from './components/EditProfile';
import RegisterChallenge from './components/RegisterChallenge';
import AdminDashboard from './components/AdminDashboard';
import Community from './components/Community';
import DonationPage from './components/DonationPage';
import CreditRequests from './components/CreditRequests';
import ManageChallenges from './components/ManageChallenges';
import Statistics from './components/Statistics';
// Removed: import IssueReportButton from './components/IssueReportButton'; 
import IssueReportingPage from './components/IssueReportingPage'; 


const appTheme = createTheme({
    palette: {
        primary: { main: '#4CAF50' }, 
        secondary: { main: '#2196F3' }, 
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif',
        h4: { fontWeight: 600 },
    },
});

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []); 

    if (loading) {
        return <div>Loading Application...</div>;
    }

    return (
        <Router>
            <ThemeProvider theme={appTheme}>
                
                {/* 🎯 Navbar only receives the user object (or null) to show the Profile/Logout button */}
                <Navbar user={user} /> 
                
                {/* Removed: <IssueReportButton userLoggedIn={!!user} /> */}

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    
                    {/* 🎯 Dashboard now receives the 'user' prop to render the button */}
                    <Route path="/dashboard" element={<Dashboard user={user} />} /> 
                    
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
                    
                    <Route 
                        path="/report-issue" 
                        element={<IssueReportingPage user={user} />} 
                    />

                </Routes>
            </ThemeProvider>
        </Router>
    );
}

export default App;