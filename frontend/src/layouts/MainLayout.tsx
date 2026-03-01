import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const menuItems = [
    { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { label: 'Vehicles', path: '/vehicles', icon: <ListAltIcon /> },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Logout',
      text: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1976D2',
      cancelButtonColor: '#9e9e9e',
      confirmButtonText: 'Yes, logout',
    });
    if (result.isConfirmed) {
      logout();
      navigate('/');
    }
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setDrawerOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F5F5F5' }}>
      {/* Navbar */}
      <AppBar position="sticky" sx={{ bgcolor: '#1B2A4A' }} elevation={2}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 1 }}>
            {/* Mobile hamburger */}
            {isMobile && (
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)} edge="start">
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <DirectionsCarIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography
              variant="h6"
              noWrap
              sx={{
                fontWeight: 700,
                letterSpacing: '.05rem',
                cursor: 'pointer',
                mr: 4,
              }}
              onClick={() => navigate('/')}
            >
              FleetCar
            </Typography>

            {/* Desktop nav links */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.path}
                    color="inherit"
                    startIcon={item.icon}
                    onClick={() => navigate(item.path)}
                    sx={{
                      textTransform: 'none',
                      fontWeight: isActive(item.path) ? 700 : 400,
                      bgcolor: isActive(item.path) ? 'rgba(255,255,255,0.12)' : 'transparent',
                      borderRadius: 2,
                      px: 2,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* Spacer for mobile */}
            {isMobile && <Box sx={{ flexGrow: 1 }} />}

            {/* Auth buttons */}
            {isAuthenticated ? (
              <>
                <Button
                  color="inherit"
                  startIcon={<AccountCircleIcon />}
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{ textTransform: 'none' }}
                >
                  {!isMobile && user?.username}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem disabled>
                    <Typography variant="body2" color="text.secondary">
                      Signed in as <strong>{user?.username}</strong>
                    </Typography>
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  color="inherit"
                  startIcon={!isMobile ? <LoginIcon /> : undefined}
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none' }}
                >
                  Login
                </Button>
                {!isMobile && (
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate('/register')}
                    sx={{
                      textTransform: 'none',
                      borderColor: 'rgba(255,255,255,0.5)',
                      '&:hover': { borderColor: 'white' },
                    }}
                  >
                    Register
                  </Button>
                )}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260 }}>
          <Box sx={{ p: 2, bgcolor: '#1B2A4A', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DirectionsCarIcon />
              <Typography variant="h6" fontWeight={700}>FleetCar</Typography>
            </Box>
          </Box>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  selected={isActive(item.path)}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
            <Divider sx={{ my: 1 }} />
            {!isAuthenticated && (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigate('/login')}>
                    <ListItemIcon><LoginIcon /></ListItemIcon>
                    <ListItemText primary="Login" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleNavigate('/register')}>
                    <ListItemIcon><PersonAddIcon /></ListItemIcon>
                    <ListItemText primary="Register" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
            {isAuthenticated && (
              <ListItem disablePadding>
                <ListItemButton onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
        <Outlet />
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: '#1B2A4A', color: 'rgba(255,255,255,0.7)' }}>
        <Typography variant="body2">
          © 2026 FleetCar Management System
        </Typography>
      </Box>
    </Box>
  );
}
