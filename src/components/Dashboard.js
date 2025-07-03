import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import api from './authority.json'

import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogContent,
  CircularProgress,
  Grid,
  Container,
  Paper,
  Card,
  CardContent,
  Chip,
  Divider,
  Avatar,
} from '@mui/material';
import { getDatabase, ref, push } from 'firebase/database';
import { database } from '../firebase';
import { GoogleGenerativeAI } from "@google/generative-ai";

function Dashboard() {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const healthScore = 85;

  const auth = getAuth();
  const currentUser = auth.currentUser;
  const userId = currentUser ? currentUser.uid : null;
  const [username, setUsername] = useState(currentUser);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const API_KEY = 'bcbb35af5421403782b2d29df1b5303b'; // Replace with your OpenWeatherMap API key
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
            );
            const data = await response.json();
    
            setWeatherData(data);
            setLoadingWeather(false);
            fetchRecommendations(data);  // Fetch AI-based recommendations
          });
        } else {
          alert('Geolocation is not supported by your browser.');
          setLoadingWeather(false);
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setLoadingWeather(false);
      }
    };

    fetchWeather();
  }, []);

  const fetchRecommendations = async (weatherData) => {
    const genAI = new GoogleGenerativeAI(api.GEMINI_API.api);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Based on the following weather conditions:
      - Temperature: ${weatherData.main.temp}°C
      - Humidity: ${weatherData.main.humidity}%
      - Wind Speed: ${weatherData.wind.speed} m/s
      
      Provide exactly 6 environmentally friendly tree recommendations for these conditions to keep climate sustainable. 
      For each tree, provide the information in this exact format (no asterisks, bullets, or markdown):
      
      TREE 1:
      Name: [Tree Name]
      Benefit: [Environmental benefit]
      Suitable: [Why suitable for these conditions]
      
      TREE 2:
      Name: [Tree Name]
      Benefit: [Environmental benefit]
      Suitable: [Why suitable for these conditions]
      
      Continue this pattern for all 6 trees. Make sure each tree is clearly separated and follows this exact format.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      
      // Parse the structured response
      const treeBlocks = responseText.split(/TREE \d+:/i).filter(block => block.trim());
   
      
      const parsedRecommendations = treeBlocks.map((block, index) => {
        const lines = block.trim().split('\n').filter(line => line.trim());
        const treeData = {};
        
        lines.forEach(line => {
          const cleanLine = line.trim();
          if (cleanLine.toLowerCase().startsWith('name:')) {
            treeData.name = cleanLine.replace(/^name:\s*/i, '').trim();
          } else if (cleanLine.toLowerCase().startsWith('benefit:')) {
            treeData.benefit = cleanLine.replace(/^benefit:\s*/i, '').trim();
          } else if (cleanLine.toLowerCase().startsWith('suitable:')) {
            treeData.suitability = cleanLine.replace(/^suitable:\s*/i, '').trim();
          }
        });
        
        // If parsing fails, create a fallback structure
        if (!treeData.name && lines.length > 0) {
          treeData.name = `Tree ${index + 1}`;
          treeData.benefit = lines[0] || 'Provides environmental benefits';
          treeData.suitability = lines[1] || 'Suitable for current climate conditions';
        }
        
        return treeData;
      }).filter(tree => tree.name && tree.name !== ''); // Only include trees with valid names


      
      // Fallback: If parsing fails, create a simple list from the raw response
      if (parsedRecommendations.length === 0) {
        const fallbackRecommendations = responseText
          .split('\n')
          .filter(line => line.trim() && !line.includes('TREE'))
          .slice(0, 6)
          .map((line, index) => ({
            name: `Recommended Tree ${index + 1}`,
            benefit: line.trim(),
            suitability: 'Suitable for your current climate conditions'
          }));
        
        setRecommendations(fallbackRecommendations);
      } else {
        setRecommendations(parsedRecommendations);
      }
      
      setLoadingRecommendations(false);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setRecommendations([]);
      setLoadingRecommendations(false);
    }
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleClaimReward = async () => {
    if (!userId) {
      alert('Please log in first to claim your reward!');
      return;
    }

    const rewardRequest = {
      user: username,
      reward: `Health Score Reward (${healthScore}%)`,
      status: 'Pending',
      timestamp: new Date().toLocaleString(),
    };

    setLoading(true);

    try {
      const rewardRef = ref(database, `rewardRequests/${userId}`);
      await push(rewardRef, rewardRequest);

      alert('Your reward request has been sent to the admin.');
      setLoading(false);
      setOpenDialog(false);
    } catch (error) {
      console.error('Error sending reward request: ', error);
      alert('There was an error submitting your request. Please try again.');
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(45deg, #56ab2f 30%, #a8e6cf 90%)',
      py: 4,
      fontFamily: "'Poppins', sans-serif" 
    }}>
      <Container maxWidth="lg">
        <Typography
          variant="h3"
          gutterBottom
          sx={{ 
            fontWeight: 700, 
            textAlign: 'center', 
            mb: 5, 
            fontFamily: "'Lora', serif",
            color: 'white',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          🌍 EcoConnect Dashboard
        </Typography>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              borderRadius: 4,
              padding: 2,
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
            }
          }}
        >
          <DialogContent>
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h4"
                sx={{ 
                  fontWeight: 600, 
                  fontFamily: "'Lora', serif",
                  mb: 2,
                  color: '#2d5016'
                }}
              >
                🎉 Congratulations!
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  mt: 1, 
                  fontFamily: "'Poppins', sans-serif",
                  color: '#2d5016',
                  mb: 3
                }}
              >
                Your Environmental Health Score is excellent at {healthScore}%! Keep up the great work!
              </Typography>
              <Button
                variant="contained"
                onClick={handleClaimReward}
                disabled={loading}
                sx={{
                  padding: '12px 30px',
                  borderRadius: 3,
                  background: 'linear-gradient(45deg, #56ab2f 30%, #a8e6cf 90%)',
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #4b8d29 30%, #96d9b8 90%)',
                    transform: 'translateY(-2px)'
                  },
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Claim Your Reward'}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        <Grid container spacing={4}>
          {/* Health Score Section */}
          <Grid item xs={12} sm={6} md={4}>
            <Paper
              elevation={8}
              sx={{
                minHeight: 320,
                borderRadius: 4,
                padding: 4,
                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                color: '#2d5016',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
                fontFamily: "'Poppins', sans-serif",
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto 16px',
                  background: 'linear-gradient(45deg, #56ab2f 30%, #a8e6cf 90%)',
                  fontSize: '2rem'
                }}
              >
                🏆
              </Avatar>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, mb: 2 }}>
                Health Score
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, mb: 2, color: '#56ab2f' }}>
                {healthScore}%
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                You are a true eco-soldier! Click here to claim your reward.
              </Typography>
              <Button
                variant="contained"
                onClick={handleOpenDialog}
                sx={{
                  padding: '12px 24px',
                  borderRadius: 3,
                  background: 'linear-gradient(45deg, #56ab2f 30%, #a8e6cf 90%)',
                  '&:hover': { 
                    background: 'linear-gradient(45deg, #4b8d29 30%, #96d9b8 90%)',
                    transform: 'translateY(-2px)'
                  },
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  transition: 'all 0.3s ease'
                }}
              >
                Claim Reward
              </Button>
            </Paper>
          </Grid>

          {/* Weather Information Section */}
          <Grid item xs={12} sm={6} md={8}>
            <Paper
              elevation={8}
              sx={{
                minHeight: 320,
                borderRadius: 4,
                padding: 4,
                background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                color: '#2d3748',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                fontFamily: "'Poppins', sans-serif",
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              {loadingWeather ? (
                <Box sx={{ textAlign: 'center' }}>
                  <CircularProgress size={60} sx={{ color: '#ff6b6b' }} />
                  <Typography variant="h6" sx={{ mt: 2 }}>Loading weather data...</Typography>
                </Box>
              ) : weatherData && weatherData.main && weatherData.weather ? (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
                    ☀️ Weather in {weatherData.name}
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 800, color: '#ff6b6b' }}>
                          {Math.round(weatherData.main.temp)}°C
                        </Typography>
                        <Typography variant="h6" sx={{ textTransform: 'capitalize', mt: 1 }}>
                          {weatherData.weather[0].description}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Chip 
                          label={`💧 Humidity: ${weatherData.main.humidity}%`} 
                          sx={{ 
                            fontSize: '1rem', 
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(10px)'
                          }} 
                        />
                        <Chip 
                          label={`🌬️ Wind: ${weatherData.wind.speed} m/s`} 
                          sx={{ 
                            fontSize: '1rem', 
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(10px)'
                          }} 
                        />
                        <Chip 
                          label={`🌅 Sunrise: ${formatTime(weatherData.sys.sunrise)}`} 
                          sx={{ 
                            fontSize: '1rem', 
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(10px)'
                          }} 
                        />
                        <Chip 
                          label={`🌇 Sunset: ${formatTime(weatherData.sys.sunset)}`} 
                          sx={{ 
                            fontSize: '1rem', 
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.3)',
                            backdropFilter: 'blur(10px)'
                          }} 
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Typography variant="body1" sx={{ textAlign: 'center', fontSize: '1.2rem' }}>
                  Weather data unavailable
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Recommendations Section */}
        <Grid container sx={{ mt: 4 }}>
          <Grid item xs={12}>
            <Paper
              elevation={8}
              sx={{
                borderRadius: 4,
                padding: 4,
                background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                color: '#2d3748',
                fontFamily: "'Poppins', sans-serif",
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'center', mb: 4 }}>
                🌱 Tree Recommendations for Your Climate
              </Typography>
              
              {loadingRecommendations ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress size={60} sx={{ color: '#56ab2f' }} />
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    Generating personalized recommendations...
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {recommendations.length > 0 ? (
                    recommendations.map((tree, index) => (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            borderRadius: 3,
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          <CardContent sx={{ padding: 3 }}>
                            <Typography 
                              variant="h6" 
                              sx={{ 
                                fontWeight: 700, 
                                color: '#2d5016',
                                mb: 2,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              🌳 {tree.name}
                            </Typography>
                            
                            <Divider sx={{ mb: 2 }} />
                            
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#56ab2f' }}>
                                🌿 Environmental Benefit:
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.6 }}>
                                {tree.benefit}
                              </Typography>
                            </Box>
                            
                            <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ff6b6b' }}>
                                🌤️ Climate Suitability:
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 1, lineHeight: 1.6 }}>
                                {tree.suitability}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ textAlign: 'center', color: '#666' }}>
                        No recommendations available at this time. Please try again later.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard;