import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  Grid,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { styled } from '@mui/system';

// **CORRECTED IMPORT:** Now importing 'database' which is exported from your firebase.js
import { database } from '../firebase';
import {
  ref,
  onValue,
  push, // 'push' is also exported from your firebase.js, but we can import directly too
  set,
  remove,
} from 'firebase/database';

// --- Styled Components (remain the same for UI aesthetics) ---

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 3,
  boxShadow: theme.shadows[10],
  maxWidth: '900px',
  margin: '40px auto',
  backgroundColor: '#e8f0fe',
  border: `1px solid ${theme.palette.primary.light}`,
}));

const TitleTypography = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.primary.dark,
  marginBottom: theme.spacing(4),
  textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& svg': {
    marginRight: theme.spacing(1.5),
    fontSize: '2.8rem',
    color: theme.palette.primary.main,
  },
}));

const FormSectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.grey[700],
  marginBottom: theme.spacing(3),
  borderBottom: `2px solid ${theme.palette.divider}`,
  paddingBottom: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    '& fieldset': {
      borderColor: theme.palette.grey[300],
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.light,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: '2px',
    },
  },
}));

const AddChallengeButton = styled(Button)(({ theme }) => ({
  borderRadius: '25px',
  padding: theme.spacing(1.5, 4),
  textTransform: 'uppercase',
  fontWeight: 700,
  fontSize: '1rem',
  background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
  color: '#ffffff',
  boxShadow: theme.shadows[3],
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[6],
    background: `linear-gradient(45deg, ${theme.palette.success.dark} 30%, ${theme.palette.success.main} 90%)`,
  },
}));

const ChallengeListContainer = styled(List)(({ theme }) => ({
  maxHeight: '500px',
  overflowY: 'auto',
  padding: theme.spacing(1),
  borderRadius: '12px',
  backgroundColor: '#ffffff',
  boxShadow: theme.shadows[2],
}));

const StyledChallengeListItem = styled(ListItem)(({ theme }) => ({
  backgroundColor: '#fafafa',
  borderRadius: '10px',
  marginBottom: theme.spacing(1.5),
  padding: theme.spacing(2),
  boxShadow: theme.shadows[1],
  transition: 'background-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: '#f0f4f8',
    boxShadow: theme.shadows[3],
  },
  display: 'flex',
  alignItems: 'flex-start',
}));

const DeleteIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.error.main,
  '&:hover': {
    backgroundColor: theme.palette.error.light,
    color: '#ffffff',
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '200px',
  color: theme.palette.primary.main,
}));

// --- ManageChallenges Component (Realtime Database Version) ---

const ManageChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    place: '',
    mentors: '',
    reason: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  // Realtime Database reference to the 'challenges' path
  // **CORRECTED USAGE:** Using 'database' from your firebase.js
  const challengesRef = ref(database, 'challenges');

  // --- Fetch Challenges from Realtime Database ---
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = onValue(challengesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        const fetchedChallenges = [];

        if (data) {
          Object.keys(data).forEach((key) => {
            fetchedChallenges.push({
              id: key,
              ...data[key],
            });
          });
          fetchedChallenges.sort((a, b) => a.title.localeCompare(b.title));
        }
        setChallenges(fetchedChallenges);
      } catch (err) {
        console.error("Error fetching challenges from Realtime Database: ", err);
        setError("Failed to load challenges. Please try again.");
        setSnackbarMessage("Failed to load challenges.");
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // --- Add Challenge to Realtime Database ---
  const handleAddChallenge = async () => {
    if (!newChallenge.title.trim() || !newChallenge.description.trim()) {
      setSnackbarMessage("Title and Description are required!");
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    setLoading(true);
    try {
      // Use push() to add a new challenge with an auto-generated unique ID
      const newChallengeRef = push(challengesRef);
      await set(newChallengeRef, {
        title: newChallenge.title,
        place: newChallenge.place,
        mentors: newChallenge.mentors,
        reason: newChallenge.reason,
        description: newChallenge.description,
        createdAt: new Date().toISOString(),
      });

      // Local state will be updated automatically by the onValue listener (useEffect)

      setNewChallenge({
        title: '',
        place: '',
        mentors: '',
        reason: '',
        description: '',
      });

      setSnackbarMessage("Challenge added successfully!");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error adding challenge to Realtime Database: ", err);
      setError("Failed to add challenge. Please try again.");
      setSnackbarMessage("Failed to add challenge.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // --- Remove Challenge from Realtime Database ---
  const handleRemoveChallenge = async (id) => {
    setLoading(true);
    try {
      // Use remove() to delete the challenge at the specified path
      await remove(ref(database, `challenges/${id}`)); // **CORRECTED USAGE:** Using 'database'

      // Local state will be updated automatically by the onValue listener (useEffect)

      setSnackbarMessage("Challenge removed successfully!");
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error("Error removing challenge from Realtime Database: ", err);
      setError("Failed to remove challenge. Please try again.");
      setSnackbarMessage("Failed to remove challenge.");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <StyledPaper>
      <TitleTypography variant="h4">
        <EventAvailableIcon /> Manage EcoChallenges
      </TitleTypography>

      {/* Add New Challenge Section */}
      <Box sx={{ marginBottom: '30px' }}>
        <FormSectionTitle variant="h6">
          Add New Challenge
        </FormSectionTitle>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Challenge Title"
              fullWidth
              value={newChallenge.title}
              onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Location (e.g., City, Park)"
              fullWidth
              value={newChallenge.place}
              onChange={(e) => setNewChallenge({ ...newChallenge, place: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Mentors (Comma-separated)"
              fullWidth
              value={newChallenge.mentors}
              onChange={(e) => setNewChallenge({ ...newChallenge, mentors: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <StyledTextField
              label="Reason for Challenge"
              fullWidth
              value={newChallenge.reason}
              onChange={(e) => setNewChallenge({ ...newChallenge, reason: e.target.value })}
            />
          </Grid>
          <Grid item xs={12}>
            <StyledTextField
              label="Detailed Description"
              fullWidth
              multiline
              rows={4}
              value={newChallenge.description}
              onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: 3 }}>
          <AddChallengeButton
            variant="contained"
            color="success"
            onClick={handleAddChallenge}
            startIcon={<AddCircleOutlineIcon />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Add Challenge'}
          </AddChallengeButton>
        </Box>
      </Box>

      <Divider sx={{ marginY: 4, borderColor: '#a7d9b5' }} />

      {/* Existing Challenges Section */}
      <Box>
        <FormSectionTitle variant="h6">
          Existing Challenges
        </FormSectionTitle>

        {loading && (
          <LoadingContainer>
            <CircularProgress color="inherit" size={40} />
            <Typography variant="body1" sx={{ marginTop: 1 }}>Loading Challenges...</Typography>
          </LoadingContainer>
        )}

        {error && (
          <Typography color="error" align="center" sx={{ padding: 2 }}>{error}</Typography>
        )}

        {!loading && !error && (
          <ChallengeListContainer>
            {challenges.length > 0 ? (
              challenges.map((challenge) => (
                <StyledChallengeListItem
                  key={challenge.id}
                >
                  <ListItemText
                    primary={<Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>{challenge.title}</Typography>}
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ color: '#424242' }}>
                          <strong>Location:</strong> {challenge.place}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#424242' }}>
                          <strong>Mentors:</strong> {challenge.mentors}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#424242' }}>
                          <strong>Reason:</strong> {challenge.reason}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#424242' }}>
                          <strong>Description:</strong> {challenge.description}
                        </Typography>
                      </Box>
                    }
                  />
                  <DeleteIconButton edge="end" aria-label="delete" onClick={() => handleRemoveChallenge(challenge.id)}>
                    <DeleteIcon />
                  </DeleteIconButton>
                </StyledChallengeListItem>
              ))
            ) : (
              <Typography variant="body1" align="center" sx={{ padding: 3, color: '#757575', fontStyle: 'italic' }}>
                No challenges added yet. Start by adding a new one above!
              </Typography>
            )}
          </ChallengeListContainer>
        )}
      </Box>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </StyledPaper>
  );
};

export default ManageChallenges;