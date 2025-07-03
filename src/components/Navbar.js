import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Drawer, 
  IconButton, 
  List, 
  ListItem, 
  ListItemText, 
  Box,
  useMediaQuery,
  useTheme,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import logo from './back.jpeg'; // Replace this with your logo
import { useTranslation } from 'react-i18next';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MovieIcon from '@mui/icons-material/Movie';
import ForestIcon from '@mui/icons-material/Forest';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import UploadIcon from '@mui/icons-material/Upload';
import LanguageIcon from '@mui/icons-material/Language';

function Navbar({ user }) {
  const { t, i18n } = useTranslation();
  const [role, setRole] = useState('user');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [openDrawer, setOpenDrawer] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  // Fetch user role and language on component mount
  useEffect(() => {
    const storedRole = localStorage.getItem('userRole');
    const storedLanguage = localStorage.getItem('language');
    if (storedRole) {
      setRole(storedRole);
    }
    if (storedLanguage) {
      setSelectedLanguage(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    }
  }, [i18n]);

  const handleLanguageChange = (event) => {
    const languageCode = event.target.value;
    setSelectedLanguage(languageCode);
    localStorage.setItem('language', languageCode);
    i18n.changeLanguage(languageCode);
  };

  const handleUploadPageRedirect = () => {
    navigate('/record-reel');
    setOpenDrawer(false);
  };

  const handleDashboardRedirect = () => {
    if (role === 'admin') {
      navigate('/admin-dashboard');
    } else {
      navigate('/dashboard');
    }
    setOpenDrawer(false);
  };

  const handleDrawerToggle = () => {
    setOpenDrawer(!openDrawer);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setOpenDrawer(false);
  };

  const getLanguageFlag = (lang) => {
    const flags = {
      'en': '🇺🇸',
      'hi': '🇮🇳',
      'es': '🇪🇸',
      'ka': '🇮🇳',
      'mr': '🇮🇳',
      'ta': '🇮🇳'
    };
    return flags[lang] || '🌐';
  };

  const navigationItems = [
    { name: t('dashboard'), path: '/dashboard', icon: <DashboardIcon />, onClick: handleDashboardRedirect },
    { name: t('reels'), path: '/reels', icon: <MovieIcon /> },
    { name: t('ecoChallenge'), path: '/eco-challenge', icon: <ForestIcon /> },
    { name: t('community'), path: '/community', icon: <GroupIcon /> },
    { name: t('profile'), path: '/profile', icon: <PersonIcon /> },
  ];

  return (
    <>
      <AppBar position="sticky" sx={styles.appBar}>
        <Toolbar sx={styles.toolbar}>
          <Container maxWidth="xl" sx={styles.container}>
            {/* Logo and Brand Name */}
            <Box sx={styles.logoContainer}>
              <Avatar
                src={logo}
                alt="EcoConnect Logo"
                sx={styles.logoAvatar}
              />
              <Typography
                variant="h6"
                component="div"
                sx={styles.brandName}
              >
                EcoConnect
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={styles.desktopNav}>
                {navigationItems.map((item) => (
                  <Button
                    key={item.name}
                    color="inherit"
                    startIcon={item.icon}
                    onClick={item.onClick || (() => handleNavigation(item.path))}
                    sx={styles.navButton}
                  >
                    {item.name}
                  </Button>
                ))}

                {/* Language Selector */}
                <FormControl sx={styles.languageSelect}>
                  <Select
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    sx={styles.languageSelectBox}
                    displayEmpty
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LanguageIcon sx={{ fontSize: 20 }} />
                        {getLanguageFlag(selected)}
                      </Box>
                    )}
                  >
                    <MenuItem value="en">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🇺🇸 {t('english')}
                      </Box>
                    </MenuItem>
                    <MenuItem value="hi">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🇮🇳 {t('hindi')}
                      </Box>
                    </MenuItem>
                    <MenuItem value="es">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🇪🇸 {t('spanish')}
                      </Box>
                    </MenuItem>
                    <MenuItem value="ka">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🇮🇳 {t('kannada')}
                      </Box>
                    </MenuItem>
                    <MenuItem value="mr">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🇮🇳 {t('marathi')}
                      </Box>
                    </MenuItem>
                    <MenuItem value="ta">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        🇮🇳 {t('tamil')}
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Upload Button */}
                <Button
                  variant="contained"
                  startIcon={<UploadIcon />}
                  onClick={handleUploadPageRedirect}
                  sx={styles.uploadButton}
                >
                  {t('uploadReel')}
                </Button>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                edge="end"
                onClick={handleDrawerToggle}
                sx={styles.menuButton}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Container>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={handleDrawerToggle}
        sx={styles.drawer}
      >
        <Box sx={styles.drawerContent}>
          {/* Drawer Header */}
          <Box sx={styles.drawerHeader}>
            <Box sx={styles.drawerLogo}>
              <Avatar src={logo} alt="EcoConnect Logo" sx={styles.drawerLogoAvatar} />
              <Typography variant="h6" sx={styles.drawerBrandName}>
                EcoConnect
              </Typography>
            </Box>
            <IconButton onClick={handleDrawerToggle} sx={styles.closeButton}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          {/* Navigation Items */}
          <List sx={styles.drawerList}>
            {navigationItems.map((item) => (
              <ListItem
                key={item.name}
                button
                onClick={item.onClick || (() => handleNavigation(item.path))}
                sx={styles.drawerListItem}
              >
                <Box sx={styles.drawerItemContent}>
                  {item.icon}
                  <ListItemText 
                    primary={item.name} 
                    sx={styles.drawerListItemText}
                  />
                </Box>
              </ListItem>
            ))}

            <Divider sx={{ my: 2 }} />

            {/* Language Selector in Drawer */}
            <ListItem sx={styles.drawerLanguageItem}>
              <FormControl fullWidth sx={styles.drawerLanguageSelect}>
                <InputLabel id="language-select-mobile">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LanguageIcon />
                    {t('language')}
                  </Box>
                </InputLabel>
                <Select
                  labelId="language-select-mobile"
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  sx={styles.drawerLanguageSelectBox}
                >
                  <MenuItem value="en">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🇺🇸 {t('english')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="hi">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🇮🇳 {t('hindi')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="es">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🇪🇸 {t('spanish')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="ka">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🇮🇳 {t('kannada')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="mr">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🇮🇳 {t('marathi')}
                    </Box>
                  </MenuItem>
                  <MenuItem value="ta">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      🇮🇳 {t('tamil')}
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </ListItem>

            {/* Upload Button in Drawer */}
            <ListItem sx={styles.drawerUploadItem}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<UploadIcon />}
                onClick={handleUploadPageRedirect}
                sx={styles.drawerUploadButton}
              >
                {t('uploadReel')}
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
}

const styles = {
  appBar: {
    background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 50%, #43a047 100%)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  toolbar: {
    minHeight: { xs: 56, sm: 64 },
    px: { xs: 1, sm: 2 },
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    px: { xs: 0, sm: 2 },
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: { xs: 1, sm: 2 },
  },
  logoAvatar: {
    width: { xs: 40, sm: 50 },
    height: { xs: 40, sm: 50 },
    border: '2px solid rgba(255, 255, 255, 0.3)',
    transition: 'transform 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },
  brandName: {
    fontWeight: 700,
    fontSize: { xs: '1.1rem', sm: '1.3rem' },
    color: 'white',
    letterSpacing: '0.5px',
    display: { xs: 'none', sm: 'block' },
  },
  desktopNav: {
    display: 'flex',
    alignItems: 'center',
    gap: { sm: 1, md: 2 },
    flexWrap: 'wrap',
  },
  navButton: {
    color: 'white',
    fontWeight: 500,
    fontSize: { sm: '0.8rem', md: '0.9rem' },
    px: { sm: 1, md: 2 },
    py: 1,
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-1px)',
    },
  },
  languageSelect: {
    minWidth: { sm: 80, md: 100 },
    '& .MuiSelect-select': {
      color: 'white',
      py: 1,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '& .MuiSvgIcon-root': {
      color: 'white',
    },
  },
  languageSelectBox: {
    borderRadius: 2,
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'white',
    },
  },
  uploadButton: {
    background: 'linear-gradient(45deg, #1b5e20 30%, #2e7d32 90%)',
    color: 'white',
    fontWeight: 600,
    px: { sm: 2, md: 3 },
    py: 1,
    borderRadius: 2,
    fontSize: { sm: '0.8rem', md: '0.9rem' },
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'linear-gradient(45deg, #0d4017 30%, #1b5e20 90%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
    },
  },
  menuButton: {
    color: 'white',
    p: 1,
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'scale(1.05)',
    },
  },
  drawer: {
    '& .MuiDrawer-paper': {
      width: 300,
      background: 'linear-gradient(180deg, #2e7d32 0%, #388e3c 100%)',
      color: 'white',
    },
  },
  drawerContent: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  drawerHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    p: 2,
    minHeight: 64,
  },
  drawerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  drawerLogoAvatar: {
    width: 40,
    height: 40,
    border: '2px solid rgba(255, 255, 255, 0.3)',
  },
  drawerBrandName: {
    fontWeight: 700,
    color: 'white',
    letterSpacing: '0.5px',
  },
  closeButton: {
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
  drawerList: {
    flex: 1,
    p: 2,
  },
  drawerListItem: {
    borderRadius: 2,
    mb: 1,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateX(5px)',
    },
  },
  drawerItemContent: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },
  drawerListItemText: {
    '& .MuiTypography-root': {
      fontWeight: 500,
    },
  },
  drawerLanguageItem: {
    px: 0,
    py: 1,
  },
  drawerLanguageSelect: {
    '& .MuiInputLabel-root': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
    '& .MuiSelect-select': {
      color: 'white',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '& .MuiSvgIcon-root': {
      color: 'white',
    },
  },
  drawerLanguageSelectBox: {
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: 'white',
    },
  },
  drawerUploadItem: {
    px: 0,
    py: 2,
  },
  drawerUploadButton: {
    background: 'linear-gradient(45deg, #1b5e20 30%, #2e7d32 90%)',
    color: 'white',
    fontWeight: 600,
    py: 1.5,
    '&:hover': {
      background: 'linear-gradient(45deg, #0d4017 30%, #1b5e20 90%)',
      transform: 'translateY(-2px)',
    },
  },
};

export default Navbar;