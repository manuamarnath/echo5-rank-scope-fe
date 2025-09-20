import { useAuth } from '../src/components/auth/AuthContext';
import AuthWrapper from '../src/components/auth/AuthWrapper';
import MainLayout from '../src/components/layout/MainLayout';
import ConnectionTest from '../components/ConnectionTest';
import {
  Box,
  Typography,
  Button,
  Container,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';

export default function Home() {
  const { user, loading } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Loading...</Typography>
      </Container>
    );
  }

  if (!user) {
    return <AuthWrapper />;
  }

  return (
    <MainLayout>
      <ConnectionTest />
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant={isMobile ? 'h4' : 'h2'}
            component="h1"
            gutterBottom
            sx={{ fontWeight: 'bold', mb: 2 }}
          >
            Welcome to RankScope
          </Typography>
          <Typography variant="h6" color="textSecondary" paragraph>
            Hello {user.email}! You are logged in as a {user.role}.
          </Typography>
        </Box>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ maxWidth: 400, mx: 'auto' }}
        >
          <Button
            variant="contained"
            color="primary"
            fullWidth
            href="/dashboard"
            sx={{ py: 1.5 }}
          >
            Go to Dashboard
          </Button>
          <Button
            variant="contained"
            color="success"
            fullWidth
            href="/clients"
            sx={{ py: 1.5 }}
          >
            Manage Clients
          </Button>
          <Button
            variant="contained"
            color="warning"
            fullWidth
            href="/pages"
            sx={{ py: 1.5 }}
          >
            Pages Management
          </Button>
        </Stack>
      </Container>
    </MainLayout>
  );
}
