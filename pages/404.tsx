import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Container } from '@mui/material';

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    // Log the current path for debugging
    console.log('404 Error - Current path:', router.asPath);
    console.log('404 Error - Router pathname:', router.pathname);
    console.log('404 Error - Router query:', router.query);
  }, [router]);

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <Container maxWidth="md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Current path: {router.asPath}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoHome}
          size="large"
        >
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
}