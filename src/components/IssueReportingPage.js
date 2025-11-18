import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, TextField, Button, Box, Alert, CircularProgress } from '@mui/material';

// --- NEW IMPORTS for Leaflet ---
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet'; // Import Leaflet object for marker fix
// -------------------------------

// Assuming you have imported your submission function
import { submitIssueReport } from '../api'; 

// --- Map Configuration ---
const containerStyle = {
    width: '100%',
    height: '400px',
    margin: '20px 0',
    border: '1px solid #ccc',
};

// Default map center (e.g., a city center, you can change this)
const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // Using a standard starting coordinate

// --- FIX: Leaflet marker icons often break without this setting ---
// This uses external links to the default Leaflet marker assets.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// --- Component to handle map clicks and display the marker ---
const LocationMarker = ({ setLocation, location }) => {
    // Hook to listen for clicks on the map
    useMapEvents({
        click(e) {
            setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return location ? (
        <Marker position={location} />
    ) : null;
};


// ---------------------------

const IssueReportingPage = ({ user }) => {
    const navigate = useNavigate();
    const [issueName, setIssueName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState(null); // Stores { lat, lng }
    const [submissionStatus, setSubmissionStatus] = useState('idle'); // idle, loading, success, error
    const [error, setError] = useState('');

    // Redirect if user is not logged in
    if (!user) {
        return <Alert severity="warning">You must be logged in to report an issue. <Button onClick={() => navigate('/login')}>Login</Button></Alert>;
    }

    // Function to handle the form submission (remains unchanged)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!issueName || !description) {
            setError('Issue Name and Description are required.');
            return;
        }

        setSubmissionStatus('loading');
        setError('');

        const reportData = {
            issueName,
            description,
            location: location, // Send the pinned location
            reporterUid: user.uid,
            reporterEmail: user.email,
        };

        try {
            await submitIssueReport(reportData);
            setSubmissionStatus('success'); 
            setTimeout(() => navigate('/dashboard'), 3000); 
        } catch (err) {
            setError('Failed to submit issue. Please try again.');
            setSubmissionStatus('error');
            console.error(err);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>Report an Environmental Issue</Typography>
            
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                
                {/* Issue Name Field */}
                <TextField
                    label="Issue Name / Title"
                    fullWidth
                    required
                    value={issueName}
                    onChange={(e) => setIssueName(e.target.value)}
                    margin="normal"
                />

                {/* Description Field */}
                <TextField
                    label="Detailed Description"
                    fullWidth
                    required
                    multiline
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    margin="normal"
                />

                <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
                    Pin Location (Click on the map to set the precise location)
                </Typography>
                
                {/* Location Display */}
                {location && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Location Pinned: Lat {location.lat.toFixed(6)}, Lng {location.lng.toFixed(6)}
                    </Alert>
                )}

                {/* --- Leaflet/OpenStreetMap Component (FREE) --- */}
                <Box sx={containerStyle}>
                    <MapContainer
                        center={defaultCenter}
                        zoom={10}
                        scrollWheelZoom={true}
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                    >
                        {/* Tile Layer provides the actual map images (OpenStreetMap) */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        
                        {/* Component that handles click and marker display */}
                        <LocationMarker setLocation={setLocation} location={location} />
                        
                    </MapContainer>
                </Box>
                {/* ----------------------------- */}

                {/* Feedback and Submission Button */}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                {submissionStatus === 'success' && <Alert severity="success" sx={{ mt: 2 }}>Issue reported successfully! Redirecting...</Alert>}

                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={submissionStatus === 'loading'}
                    sx={{ mt: 3 }}
                >
                    {submissionStatus === 'loading' ? <CircularProgress size={24} color="inherit" /> : 'Submit Issue'}
                </Button>
            </Box>
        </Container>
    );
};

export default IssueReportingPage;