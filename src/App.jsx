import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, CircularProgress, Paper, LinearProgress } from '@mui/material';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const API_URL = 'https://ai-music-backend-3829.onrender.com';

function App() {
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('Select MIDI files to begin.');
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    if (jobId && (jobStatus === 'starting' || jobStatus === 'processing' || jobStatus === 'training')) {
      const intervalId = setInterval(async () => {
        try {
          const response = await fetch(`${API_URL}/status/${jobId}`);
          const data = await response.json();
          setJobStatus(data.status);
          setStatusMessage(data.message);
          if (data.status === 'complete' || data.status === 'failed') {
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error("Error fetching status:", error);
          clearInterval(intervalId);
        }
      }, 5000);

      return () => clearInterval(intervalId);
    }
  }, [jobId, jobStatus]);

  const handleFileSelect = (event) => {
    setSelectedFiles(event.target.files);
    setStatusMessage(`${event.target.files.length} file(s) selected.`);
    setJobId(null);
    setDownloadUrl(null);
    setJobStatus('');
  };

  const handleUploadAndTrain = async () => {
    if (!selectedFiles) return;
    setJobStatus('starting');
    setStatusMessage('Uploading files...');
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]);
    }
    try {
      const response = await fetch(`${API_URL}/upload-and-train`, { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed.');
      const result = await response.json();
      setJobId(result.job_id);
      setStatusMessage(result.message);
    } catch (error) {
      setStatusMessage('Error during upload. Please try again.');
    }
  };

  const handleStopTraining = async () => {
    if (!jobId) return;
    setStatusMessage("Stop signal sent. Waiting for current epoch to finish...");
    try {
      await fetch(`${API_URL}/stop/${jobId}`, { method: 'POST' });
    } catch (error) {
      console.error("Failed to send stop signal:", error);
    }
  };

  const handleGenerate = async () => {
    setStatusMessage("Generating your masterpiece...");
    setJobStatus("generating");
    try {
      const response = await fetch(`${API_URL}/generate/${jobId}`);
      if (!response.ok) throw new Error('Generation failed.');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setStatusMessage("Your composition is ready!");
      setJobStatus("finished");
    } catch (error) {
      setStatusMessage("Error during generation. Please try again.");
    }
  };

  const isTraining = jobStatus === 'training';
  const isProcessing = jobStatus === 'starting' || jobStatus === 'processing' || isTraining;

  return (
    // --- THIS BOX IS THE FIX FOR CENTERING ---
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <MusicNoteIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        <Typography variant="h3" component="h1" gutterBottom>
          AI Style Teacher
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Upload your own MIDI files to teach the AI a new style. Then, generate a new composition.
        </Typography>
        
        <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
          <Typography variant="h5" gutterBottom>Step 1: Upload & Train</Typography>
          <Button component="label" variant="contained" startIcon={<UploadFileIcon />} disabled={isProcessing}>
            Select MIDI Files
            <input type="file" accept=".mid, .midi" multiple hidden onChange={handleFileSelect} />
          </Button>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handleUploadAndTrain} disabled={!selectedFiles || isProcessing}>
              Upload & Train
            </Button>
            {isTraining && (
              <Button
                variant="contained"
                color="secondary"
                onClick={handleStopTraining}
                sx={{ ml: 2 }}
              >
                Stop Training
              </Button>
            )}
          </Box>
          <Box sx={{ mt: 2, height: '40px' }}>
            {isProcessing ? (
              <Box sx={{ width: '100%' }}>
                <Typography>{statusMessage}</Typography>
                <LinearProgress sx={{mt: 1}}/>
              </Box>
            ) : (
              <Typography>{statusMessage}</Typography>
            )}
          </Box>
        </Paper>

        {jobStatus === 'complete' && (
          <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h5" gutterBottom>Step 2: Generate Music</Typography>
            <Button variant="contained" size="large" onClick={handleGenerate}>
              Generate
            </Button>
          </Paper>
        )}

        {downloadUrl && (
          <Paper elevation={3} sx={{ mt: 4, p: 3 }}>
            <Typography variant="h5" gutterBottom>Step 3: Download</Typography>
            <Button variant="outlined" href={downloadUrl} download="ai_composition.mid">
              Download Your Composition
            </Button>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default App;