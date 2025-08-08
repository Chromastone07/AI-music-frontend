// Simplified App.jsx for local demo
import React, { useState } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Paper } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

const API_URL = 'https://ai-music-backend-3829.onrender.com';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setDownloadUrl(null);
    try {
      const response = await fetch(`${API_URL}/generate`);
      if (!response.ok) throw new Error('Generation failed.');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (error) {
      alert("Error generating music. Make sure the backend server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minHeight="100vh">
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <MusicNoteIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        <Typography variant="h3" component="h1" gutterBottom>
          AI Music Composer
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Click the button below to generate a new piece of music using a pre-trained AI model.
        </Typography>
        
        <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
          <Box sx={{ minHeight: '120px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            {isLoading ? (
              <CircularProgress />
            ) : !downloadUrl ? (
              <Button variant="contained" size="large" onClick={handleGenerate}>
                Generate Music
              </Button>
            ) : (
              <Button variant="outlined" href={downloadUrl} download="ai_composition.mid">
                Download Your Composition
              </Button>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default App;