import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Grid, Paper } from '@mui/material';
import axios from 'axios';

const AIAnalysis = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  
  const orthancId = query.get('orthancId');
  const modality = query.get('modality');
  const bodyPart = query.get('bodyPart');
  
  useEffect(() => {
    const startAnalysis = async () => {
      try {
        // 1. Start analysis
        const { data } = await axios.post('https://haske.online:8090/api/ai/analyze', {
          orthancId,
          modality,
          bodyPart
        });
        
        // 2. Poll for results
        const checkStatus = async (jobId) => {
          const { data: jobData } = await axios.get(`https://haske.online:8090/api/ai/job/${jobId}`);
          
          if (jobData.status === 'completed') {
            setJob(jobData);
            setLoading(false);
          } else if (jobData.status === 'failed') {
            setError(jobData.results.error);
            setLoading(false);
          } else {
            setTimeout(() => checkStatus(jobId), 2000);
          }
        };
        
        checkStatus(data.jobId);
        
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    startAnalysis();
  }, [orthancId, modality, bodyPart]);
  
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>Processing AI analysis...</Typography>
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box p={4}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }
  
  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        AI Analysis Results
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6">Original Image</Typography>
            <img 
              src={`https://haske.online:8090/instances/${orthancId}/preview`} 
              alt="Original DICOM"
              style={{ width: '100%', height: 'auto' }}
            />
          </Paper>
        </Grid>
        
        {job?.results?.outputs?.map((output, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6">{output.label}</Typography>
              <img 
                src={output.url} 
                alt={output.label}
                style={{ width: '100%', height: 'auto' }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AIAnalysis;
