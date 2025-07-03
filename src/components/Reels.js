import React, { useState } from 'react';
import { Box, Button, Typography, TextField, Grid, Card, CardContent, CardActions, IconButton, Collapse } from '@mui/material';
import { ThumbUp, ChatBubble, PersonAdd, Comment as CommentIcon, ExpandMore, ExpandLess } from '@mui/icons-material';
import { styled } from '@mui/system';

// ---
// Styled Components for Aesthetic Enhancements (remain the same)
// ---

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 345,
  position: 'relative',
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[6],
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const StyledVideo = styled('video')({
  width: '100%',
  height: 'auto',
  borderRadius: 'inherit',
  display: 'block',
});

const UploaderName = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  left: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: '#fff',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 1.5),
  fontSize: '0.85rem',
  fontWeight: 'bold',
  zIndex: 1,
}));

const ActionsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginTop: theme.spacing(2),
  justifyContent: 'space-around',
}));

// ---

const Reels = () => {
  const [reels, setReels] = useState([
    {
      id: 1,
      videoUrl: '/video/video1.mp4',
      uploader: 'EcoWarrior123',
      description: 'Cleaning the community park. Every small step makes a big difference!',
      likes: 45,
      comments: ['Great job!', 'Inspiring!', 'Keep up the good work!'],
      isLiked: false,
      isFollowed: false,
      newComment: '',
      showComments: false, // New state for comments visibility
    },
    {
      id: 2,
      videoUrl: '/video/vido2.mp4',
      uploader: 'GreenPlanetHero',
      description: 'Reducing plastic waste. Let\'s make our planet greener!',
      likes: 25,
      comments: ['Important initiative!', 'More people should join!', 'We need this!'],
      isLiked: false,
      isFollowed: false,
      newComment: '',
      showComments: false,
    },
    {
      id: 3,
      videoUrl: '/video/vido2.mp4',
      uploader: 'NatureLover456',
      description: 'Planting trees for a better tomorrow. Join the green revolution!',
      likes: 55,
      comments: ['Beautiful initiative!', 'Trees are life!', 'Count me in!'],
      isLiked: false,
      isFollowed: false,
      newComment: '',
      showComments: false,
    },
    {
      id: 4,
      videoUrl: '/video/vido2.mp4',
      uploader: 'CleanSeasAdvocate',
      description: 'Beach cleanup drive. Protecting marine life is our responsibility.',
      likes: 30,
      comments: ['Thank you for doing this!', 'Save our oceans!', 'Amazing effort!'],
      isLiked: false,
      isFollowed: false,
      newComment: '',
      showComments: false,
    },
  ]);

  const handleLike = (id) => {
    setReels((prevReels) =>
      prevReels.map((reel) =>
        reel.id === id
          ? { ...reel, isLiked: !reel.isLiked, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1 }
          : reel
      )
    );
  };

  const handleFollow = (id) => {
    setReels((prevReels) =>
      prevReels.map((reel) =>
        reel.id === id ? { ...reel, isFollowed: !reel.isFollowed } : reel
      )
    );
  };

  const handleCommentChange = (id, value) => {
    setReels((prevReels) =>
      prevReels.map((reel) =>
        reel.id === id ? { ...reel, newComment: value } : reel
      )
    );
  };

  const handleAddComment = (id) => {
    setReels((prevReels) =>
      prevReels.map((reel) => {
        if (reel.id === id && reel.newComment.trim()) {
          return {
            ...reel,
            comments: [...reel.comments, reel.newComment.trim()],
            newComment: '',
            showComments: true, // Automatically show comments after adding one
          };
        }
        return reel;
      })
    );
  };

  // New handler to toggle comments visibility
  const handleToggleComments = (id) => {
    setReels((prevReels) =>
      prevReels.map((reel) =>
        reel.id === id ? { ...reel, showComments: !reel.showComments } : reel
      )
    );
  };

  return (
    <Box sx={{ padding: 4, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Typography variant="h3" align="center" gutterBottom sx={{ color: '#333', fontWeight: 'bold', marginBottom: 4 }}>
        Community Reels
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {reels.map((reel) => (
          <Grid item xs={12} sm={6} md={4} key={reel.id}>
            <StyledCard>
              <UploaderName variant="body1">
                {reel.uploader}
                <Button
                  variant="text"
                  size="small"
                  onClick={() => handleFollow(reel.id)}
                  sx={{
                    color: reel.isFollowed ? '#ccc' : '#1976d2',
                    marginLeft: 1,
                    textTransform: 'none',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline',
                    }
                  }}
                >
                  {reel.isFollowed ? 'Following' : 'Follow'}
                </Button>
              </UploaderName>
              <StyledVideo
                src={reel.videoUrl}
                controls
                playsInline
                loop
                muted
              />
              <CardContent>
                <Typography variant="body2" color="text.secondary" sx={{ marginBottom: 1 }}>
                  {reel.description}
                </Typography>
                <ActionsBox>
                  <Button
                    variant="contained"
                    startIcon={<ThumbUp />}
                    onClick={() => handleLike(reel.id)}
                    sx={{
                      backgroundColor: reel.isLiked ? '#d32f2f' : '#4caf50',
                      '&:hover': {
                        backgroundColor: reel.isLiked ? '#c62828' : '#388e3c',
                      },
                      color: '#fff',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {reel.isLiked ? 'Liked' : 'Like'} ({reel.likes})
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CommentIcon />}
                    onClick={() => handleToggleComments(reel.id)} // Toggle comments on click
                    sx={{
                      color: '#2196f3',
                      borderColor: '#2196f3',
                      borderRadius: '20px',
                      padding: '8px 16px',
                      fontSize: '0.8rem',
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.04)',
                      }
                    }}
                  >
                    {reel.showComments ? 'Hide Comments' : 'View Comments'} ({reel.comments.length})
                  </Button>
                </ActionsBox>
              </CardContent>
              <CardActions sx={{ padding: '0 16px 16px' }}>
                <TextField
                  label="Add a comment"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={reel.newComment}
                  onChange={(e) => handleCommentChange(reel.id, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment(reel.id)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                      fieldset: {
                        borderColor: '#ccc',
                      },
                      '&:hover fieldset': {
                        borderColor: '#999',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3',
                      },
                    },
                  }}
                />
              </CardActions>
              {/* Collapsible Comments Section */}
              <Collapse in={reel.showComments} timeout="auto" unmountOnExit>
                <CardContent sx={{ paddingTop: 0 }}>
                  {reel.comments.length > 0 ? (
                    <Box sx={{ marginTop: 2 }}>
                      <Typography variant="subtitle2" color="text.primary" gutterBottom>
                        All Comments:
                      </Typography>
                      {reel.comments.map((comment, index) => (
                        <Typography variant="body2" color="text.secondary" key={index} sx={{ marginBottom: 0.5 }}>
                          - {comment}
                        </Typography>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ marginTop: 2 }}>
                      No comments yet. Be the first to comment!
                    </Typography>
                  )}
                </CardContent>
              </Collapse>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Reels;