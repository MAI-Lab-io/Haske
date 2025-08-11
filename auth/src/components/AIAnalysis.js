import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Grid, Paper,
  Button, Card, CardContent, CardMedia, Divider,
  Chip, Stack, IconButton, Modal, Container,
  Avatar, useTheme, useScrollTrigger, Slider,
  TextField, Alert, Snackbar, Checkbox
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { 
  GitHub as GitHubIcon,
  ZoomIn as ZoomInIcon, Download as DownloadIcon,
  Save as SaveIcon, Refresh as RefreshIcon,
  Close as CloseIcon, Science as ScienceIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  Check as CheckIcon, Warning as WarningIcon,
  Info as InfoIcon, Error as ErrorIcon,
  PlayArrow as PlayArrowIcon, Timer as TimerIcon
} from '@mui/icons-material';

const AIAnalysis = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [seriesDetails, setSeriesDetails] = useState([]);
  const [patientDetails, setPatientDetails] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [githubRepo, setGithubRepo] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [processingStatus, setProcessingStatus] = useState(null);
  const [feedback, setFeedback] = useState({
    accuracy: 3,
    usefulness: 3,
    comments: '',
    approved: false
  });

  const orthancId = query.get('orthancId');
  const jobId = query.get('jobId'); 
  const initialModality = query.get('modality');
  const initialBodyPart = query.get('bodyPart');

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const getVisualizationUrl = () => {
    if (!job?.results) return null;
    
    // Case 1: Direct visualization path from container logs
    if (job.results.visualization_path) {
      return `https://api.haske.online${job.results.visualization_path}`;
    }
    
    // Case 2: Check for visualization.png in the output directory
    if (job.results.output_path) {
      const basePath = job.results.output_path.split('.')[0]; // Remove extension
      return `https://api.haske.online${basePath}_visualization.png`;
    }
    
    // Case 3: Check output_files array for visualization
    if (job.results.output_files) {
      const visFile = job.results.output_files.find(f => f.type === 'visualization');
      if (visFile) {
        return `https://api.haske.online${visFile.path}`;
      }
    }
    
    return null;
  };

  const visualizationUrl = getVisualizationUrl();

  const formatPatientName = (name) => {
    if (!name) return 'N/A';
    return name.replace(/\\/g, ' ').trim();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const year = dateString.substring(0, 4);
      const month = dateString.substring(4, 6);
      const day = dateString.substring(6, 8);
      return `${year}-${month}-${day}`;
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#10b981';
      case 'running': return '#f59e0b';
      case 'pending': return '#6b7280';
      case 'failed': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckIcon />;
      case 'running': return <TimerIcon />;
      case 'pending': return <InfoIcon />;
      case 'failed': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  const handleScroll = (direction) => {
    const container = document.getElementById('model-gallery');
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const submitFeedback = async () => {
    try {
      await axios.post('https://api.haske.online/api/ai/feedback', {
        jobId: job.id,
        feedback: {
          ...feedback,
          modality: initialModality || seriesDetails[0]?.Modality,
          bodyPart: initialBodyPart || seriesDetails[0]?.BodyPartExamined
        }
      });
      showSnackbar('Feedback submitted successfully!', 'success');
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      showSnackbar('Failed to submit feedback', 'error');
    }
  };

  const fetchConfig = async () => {
    try {
      const configResponse = await axios.get('https://api.haske.online/api/ai/config');
      return {
        models: configResponse.data.models || [],
        githubRepo: configResponse.data.githubRepo || 'https://github.com/MAILABHASKE/mailab-models'
      };
    } catch (err) {
      console.error('Failed to fetch config:', err);
      return { models: [], githubRepo: '' };
    }
  };

  const fetchStudyDetails = async (studyId) => {
    try {
      const studyResponse = await axios.get(
        `https://api.haske.online/proxy/orthanc/studies/${studyId}`,
        { timeout: 5000 }
      );
      
      if (!studyResponse.data) {
        throw new Error('Study not found in Orthanc');
      }

      const seriesResponse = await axios.get(
        `https://api.haske.online/proxy/orthanc/studies/${studyId}/series`,
        { timeout: 5000 }
      );

      const seriesData = await Promise.all(
        seriesResponse.data.slice(0, 3).map(async (series) => {
          try {
            const seriesDetails = await axios.get(
              `https://api.haske.online/proxy/orthanc/series/${series.ID}`,
              { timeout: 3000 }
            );
            return {
              ...series,
              Modality: seriesDetails.data.MainDicomTags?.Modality || 'UNKNOWN',
              BodyPartExamined: seriesDetails.data.MainDicomTags?.BodyPartExamined || 'UNKNOWN'
            };
          } catch (seriesError) {
            console.error('Error fetching series details:', seriesError);
            return {
              ...series,
              Modality: 'UNKNOWN',
              BodyPartExamined: 'UNKNOWN'
            };
          }
        })
      );

      return {
        patientDetails: studyResponse.data.PatientMainDicomTags || {},
        seriesDetails: seriesData
      };
    } catch (err) {
      console.error('Failed to fetch study details:', err);
      return {
        patientDetails: {},
        seriesDetails: [{
          Modality: initialModality || 'UNKNOWN',
          BodyPartExamined: initialBodyPart || 'UNKNOWN'
        }]
      };
    }
  };

  const startAnalysis = async (modality, bodyPart) => {
    try {
      const { data } = await axios.post('https://api.haske.online/api/ai/analyze', {
        orthancId,
        modality,
        bodyPart
      });
      
      if (data.status === 'no_model') {
        return { error: data.message || 'No suitable model found for this study' };
      }
      
      if (data.status === 'queued' || data.status === 'completed') {
        return { jobId: data.jobId, cached: data.cached };
      }

      return { error: 'Unknown response from server' };
    } catch (err) {
      return { error: err.response?.data?.error || err.message || 'Failed to start analysis' };
    }
  };

  const checkJobStatus = async (jobId) => {
    try {
      const { data: jobData } = await axios.get(
        `https://api.haske.online/api/ai/job/${jobId}`,
        { timeout: 5000 }
      );
      
      console.log('Job status:', jobData.status);
      
      if (jobData.status === 'completed') {
        return { job: jobData };
      } else if (jobData.status === 'failed') {
        return { 
          error: jobData.error || 
                jobData.results?.error || 
                'Analysis failed' 
        };
      } else {
        const startedAt = new Date(jobData.started_at || jobData.created_at);
        const now = new Date();
        const minutesRunning = (now - startedAt) / (1000 * 60);
        
        if (minutesRunning > 45) { // Increased timeout to 45 minutes
          return { error: 'Analysis timed out (45+ minutes)' };
        }
        
        return { continuePolling: true, job: jobData };
      }
    } catch (err) {
      console.error('Job status check error:', err);
      return { error: err.response?.data?.error || 'Failed to check job status' };
    }
  };

  const retryAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentModality = initialModality || seriesDetails[0]?.Modality;
      const currentBodyPart = initialBodyPart || seriesDetails[0]?.BodyPartExamined;
      
      const { jobId: newJobId, error: analysisError, cached } = await startAnalysis(
        currentModality,
        currentBodyPart
      );

      if (analysisError) {
        throw new Error(analysisError);
      }

      if (cached) {
        const { job: completedJob } = await checkJobStatus(newJobId);
        if (completedJob) {
          setJob(completedJob);
          setLoading(false);
          showSnackbar('Using cached results', 'info');
          return;
        }
      }

      // Start polling for new job
      let pollCount = 0;
      const maxPolls = 450; // 15 minutes with 2-second intervals
      
      const pollJobStatus = async () => {
        if (pollCount >= maxPolls) {
          throw new Error('Analysis timed out');
        }
        
        try {
          const { job: completedJob, error: statusError, continuePolling, job: currentJob } = 
            await checkJobStatus(newJobId);

          if (statusError) throw new Error(statusError);

          if (completedJob) {
            setJob(completedJob);
            setLoading(false);
            showSnackbar('Analysis completed successfully!', 'success');
            return;
          }

          if (continuePolling) {
            if (currentJob) {
              setJob(currentJob); // Update with current status
            }
            pollCount++;
            setTimeout(pollJobStatus, 2000);
          }
        } catch (err) {
          throw err;
        }
      };

      pollJobStatus();
      
    } catch (err) {
      setError(err.message);
      setLoading(false);
      showSnackbar(err.message, 'error');
    }
  };

  useEffect(() => {
    let isMounted = true;
    let pollingTimeout;

    const initialize = async () => {
      try {
        setLoading(true);
        setError(null);

        const configData = await fetchConfig();
        if (!isMounted) return;
        setAvailableModels(configData.models);
        setGithubRepo(configData.githubRepo);

        if (jobId) {
          const { job: existingJob, error: statusError } = await checkJobStatus(jobId);
          
          if (statusError) throw new Error(statusError);
          if (existingJob) {
            setJob(existingJob);
            
            // If job is still running, start polling
            if (existingJob.status === 'running' || existingJob.status === 'pending') {
              const pollJobStatus = async () => {
                if (!isMounted) return;
                
                try {
                  const { job: updatedJob, error: pollError, continuePolling } = 
                    await checkJobStatus(jobId);

                  if (pollError) throw new Error(pollError);

                  if (updatedJob) {
                    setJob(updatedJob);
                    if (updatedJob.status === 'completed') {
                      setLoading(false);
                      showSnackbar('Analysis completed!', 'success');
                      return;
                    } else if (updatedJob.status === 'failed') {
                      throw new Error(updatedJob.error || 'Analysis failed');
                    }
                  }

                  if (continuePolling && isMounted) {
                    pollingTimeout = setTimeout(pollJobStatus, 2000);
                  }
                } catch (err) {
                  if (isMounted) {
                    setError(err.message);
                    setLoading(false);
                  }
                }
              };

              pollJobStatus();
            } else {
              setLoading(false);
            }
            
            // Fetch study details
            if (existingJob.orthanc_id && !patientDetails) {
              try {
                const studyData = await fetchStudyDetails(existingJob.orthanc_id);
                if (isMounted) {
                  setPatientDetails(studyData.patientDetails);
                  setSeriesDetails(studyData.seriesDetails);
                }
              } catch (err) {
                console.error('Could not fetch study details:', err);
              }
            }
            return;
          }
        }

        if (orthancId) {
          const studyData = await fetchStudyDetails(orthancId);
          if (!isMounted) return;
          
          setPatientDetails(studyData.patientDetails);
          setSeriesDetails(studyData.seriesDetails);

          const currentModality = initialModality || studyData.seriesDetails[0]?.Modality;
          const currentBodyPart = initialBodyPart || studyData.seriesDetails[0]?.BodyPartExamined;

          const { jobId: newJobId, error: analysisError, cached } = await startAnalysis(
            currentModality,
            currentBodyPart
          );

          if (analysisError) throw new Error(analysisError);
          if (!newJobId) throw new Error('No job ID returned from server');

          if (cached) {
            const { job: cachedJob } = await checkJobStatus(newJobId);
            if (cachedJob) {
              setJob(cachedJob);
              setLoading(false);
              showSnackbar('Using cached results', 'info');
              return;
            }
          }

          const pollJobStatus = async () => {
            if (!isMounted) return;
            
            try {
              const { job: completedJob, error: statusError, continuePolling, job: currentJob } = 
                await checkJobStatus(newJobId);

              if (statusError) throw new Error(statusError);

              if (completedJob) {
                if (isMounted) {
                  setJob(completedJob);
                  setLoading(false);
                  showSnackbar('Analysis completed!', 'success');
                }
                return;
              }

              if (currentJob && isMounted) {
                setJob(currentJob);
              }

              if (continuePolling && isMounted) {
                pollingTimeout = setTimeout(pollJobStatus, 2000);
              }
            } catch (err) {
              if (isMounted) {
                setError(err.message);
                setLoading(false);
              }
            }
          };

          pollJobStatus();
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      clearTimeout(pollingTimeout);
    };
  }, [orthancId, jobId, initialModality, initialBodyPart]);

  const handleDownloadResults = async () => {
    try {
      const response = await axios.get(`https://api.haske.online/api/ai/results/${job.id}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from job results or use default
      const filename = job.results?.output_files?.[0]?.filename || `ai_results_${orthancId || job.orthanc_id}.nii.gz`;
      link.setAttribute('download', filename);
      
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSnackbar('Download started', 'success');
    } catch (err) {
      console.error('Failed to download results:', err);
      showSnackbar('Failed to download results', 'error');
    }
  };

  const handleProcessAnother = () => {
    navigate('/');
  };

  const currentModality = initialModality || seriesDetails[0]?.Modality;
  const currentBodyPart = initialBodyPart || seriesDetails[0]?.BodyPartExamined;

  if (!orthancId && !jobId) {
    return (
      <Box sx={{ 
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)'
      }}>
        <ScienceIcon sx={{ fontSize: 80, color: '#ef4444', mb: 3 }} />
  
        <Typography variant="h4" color="white" gutterBottom>
          Error: Missing Parameters
        </Typography>
  
        <Typography variant="body1" color="#94a3b8" sx={{ mb: 4, maxWidth: '600px' }}>
          No Orthanc study ID or job ID was provided. Please go back and try again.
        </Typography>
  
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: 3,
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)'
      }}>
        <ScienceIcon sx={{
          fontSize: 80,
          color: '#dd841a',
          filter: 'drop-shadow(0 4px 6px rgba(221, 132, 26, 0.3))'
        }} />
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ color: '#dd841a' }}
        />
        <Typography variant="h4" fontWeight="bold" sx={{
          background: `linear-gradient(90deg, #dd841a 0%, #f59e0b 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>
          {job?.status === 'running' ? 'AI Analysis In Progress' : 'Processing AI Analysis'}
        </Typography>
        <Typography variant="body1" color="white" textAlign="center">
          Analyzing {currentModality || 'unknown'} scan of {currentBodyPart || 'unknown'}
        </Typography>
        
        {job && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Chip 
              icon={getStatusIcon(job.status)}
              label={`Status: ${job.status.toUpperCase()}`}
              sx={{ 
                backgroundColor: getStatusColor(job.status),
                color: 'white',
                fontWeight: 'bold'
              }}
            />
            {job.started_at && (
              <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mt: 1 }}>
                Started: {new Date(job.started_at).toLocaleString()}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
        p: 4
      }}>
        <Box sx={{ textAlign: 'center', mb: 4, pt: 4 }}>
          <Typography variant="h2" fontWeight="bold" sx={{
            background: `linear-gradient(90deg, #ffff 0%, #dd841a 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            Haske MedAI
          </Typography>
          <Typography variant="subtitle1" color="white" sx={{ mb: 3 }}>
            Advanced diagnostic imaging analysis powered by AI
          </Typography>
          {githubRepo && (
            <Button
              variant="contained"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 8,
                fontWeight: 'bold',
                backgroundColor: '#dd841a',
                color: 'white',
                mr: 2,
                '&:hover': {
                  backgroundColor: '#f59e0b',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.4)'
                }
              }}
              startIcon={<GitHubIcon />}
              href={githubRepo}
              target="_blank"
            >
              View on GitHub
            </Button>
          )}
          <Button
            variant="outlined"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 8,
              fontWeight: 'bold',
              borderColor: '#dd841a',
              color: '#dd841a',
              '&:hover': {
                backgroundColor: '#dd841a',
                color: 'white',
                transform: 'translateY(-2px)'
              }
            }}
            startIcon={<RefreshIcon />}
            onClick={retryAnalysis}
          >
            Retry Analysis
          </Button>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 4 }}>
          <Alert severity="error" sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Analysis Failed
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={retryAnalysis}
              startIcon={<RefreshIcon />}
            >
              Retry Analysis
            </Button>
          </Alert>
          
          {availableModels.length > 0 && (
            <>
              <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
                mb: 3,
                textAlign: 'center',
                color: 'white'
              }}>
                Available AI Models
              </Typography>
              
              <Box sx={{ position: 'relative', width: '100%', mb: 4 }}>
                <IconButton
                  onClick={() => handleScroll('left')}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    backgroundColor: '#0f172a',
                    color: '#dd841a',
                    '&:hover': { backgroundColor: '#1e293b' }
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
                
                <Box
                  id="model-gallery"
                  sx={{
                    display: 'flex',
                    overflowX: 'auto',
                    scrollBehavior: 'smooth',
                    py: 2,
                    px: 1,
                    gap: 3,
                    '&::-webkit-scrollbar': { height: '6px' },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: '#dd841a',
                      borderRadius: '3px',
                    }
                  }}
                >
                  {availableModels.map((model) => (
                    <Card 
                      key={model.id}
                      sx={{ 
                        width: 400,
                        height: 300,
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        border: selectedModel?.id === model.id ? 
                          `2px solid #dd841a` : `1px solid #334155`,
                        borderRadius: 12,
                        backgroundColor: '#1e293b',
                        boxShadow: selectedModel?.id === model.id ? 
                          `0 10px 15px -3px rgba(221, 132, 26, 0.3)` : 
                          '0 4px 6px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 15px -3px rgba(221, 132, 26, 0.4)'
                        }
                      }}
                      onClick={() => setSelectedModel(model)}
                    >
                      <CardContent sx={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        p: 2,
                        overflow: 'hidden'
                      }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
                          <Avatar sx={{ 
                            bgcolor: '#dd841a',
                            width: 32,
                            height: 32
                          }}>
                            <ScienceIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="h6" fontWeight="bold" color="white" noWrap>
                            {model.name}
                          </Typography>
                        </Stack>
                        
                        <Box sx={{ flex: 1, overflow: 'hidden', mb: 1 }}>
                          <Typography variant="body2" color="#e2e8f0" sx={{                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {model.description}
                          </Typography>
                        </Box>
                        
                        <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                          {model.modalities?.map(modality => (
                            <Chip
                              key={modality}
                              label={modality}
                              size="small"
                              sx={{
                                backgroundColor: '#334155',
                                color: '#e2e8f0'
                              }}
                            />
                          ))}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
                
                <IconButton
                  onClick={() => handleScroll('right')}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    backgroundColor: '#0f172a',
                    color: '#dd841a',
                    '&:hover': { backgroundColor: '#1e293b' }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
      color: 'white',
      pb: 8
    }}>
      {/* Header */}
      <Box sx={{
        pt: 4,
        pb: 2,
        px: 4,
        borderBottom: '1px solid #1e293b',
        background: 'rgba(2, 6, 23, 0.7)',
        backdropFilter: 'blur(10px)'
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1800px',
          margin: '0 auto'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ScienceIcon sx={{ fontSize: 40, color: '#dd841a' }} />
            <Typography variant="h4" fontWeight="bold" sx={{
              background: `linear-gradient(90deg, #dd841a 0%, #f59e0b 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Haske MedAI
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            {githubRepo && (
              <Button
                variant="contained"
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 8,
                  fontWeight: 'bold',
                  backgroundColor: '#dd841a',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#f59e0b',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.4)'
                  }
                }}
                startIcon={<GitHubIcon />}
                href={githubRepo}
                target="_blank"
              >
                View on GitHub
              </Button>
            )}
            <Button
              variant="outlined"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 8,
                fontWeight: 'bold',
                borderColor: '#dd841a',
                color: '#dd841a',
                '&:hover': {
                  backgroundColor: '#dd841a',
                  color: 'white',
                  transform: 'translateY(-2px)'
                }
              }}
              onClick={handleProcessAnother}
            >
              Process Another
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          {/* Patient Info */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper sx={{
              p: 3,
              borderRadius: 12,
              backgroundColor: '#1e293b',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#dd841a' }}>
                Patient Information
              </Typography>
              
              {patientDetails ? (
                <>
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Box>
                      <Typography variant="subtitle2" color="#94a3b8">
                        Patient Name
                      </Typography>
                      <Typography variant="body1" color="white">
                        {formatPatientName(patientDetails.PatientName)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="#94a3b8">
                        Patient ID
                      </Typography>
                      <Typography variant="body1" color="white">
                        {patientDetails.PatientID || 'N/A'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="#94a3b8">
                        Birth Date
                      </Typography>
                      <Typography variant="body1" color="white">
                        {formatDate(patientDetails.PatientBirthDate)}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="#94a3b8">
                        Sex
                      </Typography>
                      <Typography variant="body1" color="white">
                        {patientDetails.PatientSex || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Divider sx={{ my: 2, borderColor: '#334155' }} />
                </>
              ) : (
                <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
                  Patient details not available
                </Typography>
              )}
              
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#dd841a' }}>
                Study Information
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="#94a3b8">
                    Modality
                  </Typography>
                  <Typography variant="body1" color="white">
                    {currentModality || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="#94a3b8">
                    Body Part
                  </Typography>
                  <Typography variant="body1" color="white">
                    {currentBodyPart || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="#94a3b8">
                    Analysis Model
                  </Typography>
                  <Typography variant="body1" color="white">
                    {job?.model_name || 'N/A'}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="#94a3b8">
                    Analysis Status
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: getStatusColor(job?.status)
                    }} />
                    <Typography variant="body1" color="white" textTransform="capitalize">
                      {job?.status || 'unknown'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Typography variant="subtitle2" color="#94a3b8">
                    Completed At
                  </Typography>
                  <Typography variant="body1" color="white">
                    {job?.completed_at ? new Date(job.completed_at).toLocaleString() : 'N/A'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          
          {/* Results Visualization */}
          <Grid item xs={12} md={8} lg={9}>
            <Paper sx={{
              p: 3,
              borderRadius: 12,
              backgroundColor: '#1e293b',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              mb: 4
            }}>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#dd841a' }}>
                  AI Analysis Results
                </Typography>
                
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadResults}
                    sx={{
                      color: '#dd841a',
                      borderColor: '#dd841a',
                      '&:hover': {
                        backgroundColor: '#dd841a',
                        color: 'white'
                      }
                    }}
                  >
                    Download Results
                  </Button>
                  
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={retryAnalysis}
                    sx={{
                      backgroundColor: '#dd841a',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: '#f59e0b'
                      }
                    }}
                  >
                    Re-run Analysis
                  </Button>
                </Stack>
              </Box>
              
              {visualizationUrl ? (
                <Box sx={{
                  position: 'relative',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid #334155'
                }}>
                  <img
                    src={visualizationUrl}
                    alt="AI Analysis Visualization"
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                  <IconButton
                    onClick={() => setZoomedImage(visualizationUrl)}
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 16,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.8)'
                      }
                    }}
                  >
                    <ZoomInIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{
                  height: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  border: '1px dashed #334155'
                }}>
                  <ScienceIcon sx={{ fontSize: 60, color: '#334155', mb: 2 }} />
                  <Typography variant="h6" color="#64748b">
                    No visualization available
                  </Typography>
                  <Typography variant="body2" color="#64748b" sx={{ mt: 1 }}>
                    The AI analysis did not produce a visual output
                  </Typography>
                </Box>
              )}
            </Paper>
            
            {/* Results Details */}
            {job?.results && (
              <Paper sx={{
                p: 3,
                borderRadius: 12,
                backgroundColor: '#1e293b',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                mb: 4
              }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#dd841a' }}>
                  Detailed Results
                </Typography>
                
                <Box sx={{
                  backgroundColor: '#0f172a',
                  borderRadius: 8,
                  p: 3,
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  overflowX: 'auto',
                  color: '#e2e8f0'
                }}>
                  {JSON.stringify(job.results, null, 2)}
                </Box>
              </Paper>
            )}
            
            {/* Feedback Section */}
            <Paper sx={{
              p: 3,
              borderRadius: 12,
              backgroundColor: '#1e293b',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: '#dd841a' }}>
                Provide Feedback
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom color="white">
                    How accurate was the analysis?
                  </Typography>
                  <Slider
                    value={feedback.accuracy}
                    onChange={(e, value) => setFeedback({...feedback, accuracy: value})}
                    min={1}
                    max={5}
                    step={1}
                    marks={[
                      { value: 1, label: '1 - Poor' },
                      { value: 2, label: '2' },
                      { value: 3, label: '3 - Average' },
                      { value: 4, label: '4' },
                      { value: 5, label: '5 - Excellent' }
                    ]}
                    valueLabelDisplay="auto"
                    sx={{
                      color: '#dd841a',
                      '& .MuiSlider-markLabel': {
                        color: '#94a3b8'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom color="white">
                    How useful was the analysis?
                  </Typography>
                  <Slider
                    value={feedback.usefulness}
                    onChange={(e, value) => setFeedback({...feedback, usefulness: value})}
                    min={1}
                    max={5}
                    step={1}
                    marks={[
                      { value: 1, label: '1 - Not Useful' },
                      { value: 2, label: '2' },
                      { value: 3, label: '3 - Somewhat Useful' },
                      { value: 4, label: '4' },
                      { value: 5, label: '5 - Very Useful' }
                    ]}
                    valueLabelDisplay="auto"
                    sx={{
                      color: '#dd841a',
                      '& .MuiSlider-markLabel': {
                        color: '#94a3b8'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="Additional Comments"
                    multiline
                    rows={4}
                    fullWidth
                    value={feedback.comments}
                    onChange={(e) => setFeedback({...feedback, comments: e.target.value})}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: '#334155'
                        },
                        '&:hover fieldset': {
                          borderColor: '#dd841a'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#dd841a'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#94a3b8'
                      },
                      '& .MuiInputBase-input': {
                        color: 'white'
                      }
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox
                        checked={feedback.approved}
                        onChange={(e) => setFeedback({...feedback, approved: e.target.checked})}
                        sx={{
                          color: '#dd841a',
                          '&.Mui-checked': {
                            color: '#dd841a'
                          }
                        }}
                      />
                      <Typography variant="body1" color="white">
                        I approve these results for research purposes
                      </Typography>
                    </Box>
                    
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={submitFeedback}
                      sx={{
                        backgroundColor: '#dd841a',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#f59e0b'
                        }
                      }}
                    >
                      Submit Feedback
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Zoomed Image Modal */}
      <Modal
        open={!!zoomedImage}
        onClose={() => setZoomedImage(null)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box sx={{
          position: 'relative',
          outline: 'none'
        }}>
          <img
            src={zoomedImage}
            alt="Zoomed Analysis"
            style={{
              maxHeight: '90vh',
              maxWidth: '90vw',
              borderRadius: 8
            }}
          />
          <IconButton
            onClick={() => setZoomedImage(null)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.8)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Modal>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({...snackbar, open: false})}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AIAnalysis;
