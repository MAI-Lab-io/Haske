import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Grid, Paper,
  Button, Card, CardContent, CardMedia, Divider,
  Chip, Stack, IconButton, Modal, Container,
  Avatar, useTheme, useScrollTrigger, Slider,
  TextField
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import { 
  GitHub as GitHubIcon,
  ZoomIn as ZoomInIcon, Download as DownloadIcon,
  Save as SaveIcon, Refresh as RefreshIcon,
  Close as CloseIcon, Science as ScienceIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import VisualizationViewer from './VisualizationViewer';

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
    
    // Case 3: Fallback to checking container logs for visualization path
    if (job.logs?.includes('Visualization saved to')) {
      const logMatch = job.logs.match(/Visualization saved to (\/output\/[^\s]+)/);
      if (logMatch && logMatch[1]) {
        return `https://api.haske.online${logMatch[1]}`;
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
        jobId: job.jobId,
        feedback: {
          ...feedback,
          modality: initialModality || seriesDetails[0]?.Modality,
          bodyPart: initialBodyPart || seriesDetails[0]?.BodyPartExamined
        }
      });
    } catch (err) {
      console.error('Failed to submit feedback:', err);
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

  const fetchStudyDetails = async () => {
    try {
      const studyResponse = await axios.get(
        `https://api.haske.online/proxy/orthanc/studies/${orthancId}`,
        { timeout: 5000 }
      );
      
      if (!studyResponse.data) {
        throw new Error('Study not found in Orthanc');
      }

      const seriesResponse = await axios.get(
        `https://api.haske.online/proxy/orthanc/studies/${orthancId}/series`,
        { timeout: 5000 }
      );

      const seriesData = await Promise.all(
        seriesResponse.data.map(async (series) => {
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
      
      if (data.status === 'queued') {
        return { jobId: data.jobId };
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
        
        if (minutesRunning > 30) {
          return { error: 'Analysis timed out (30+ minutes)' };
        }
        
        return { continuePolling: true };
      }
    } catch (err) {
      console.error('Job status check error:', err);
      return { error: err.response?.data?.error || 'Failed to check job status' };
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
            setLoading(false);
            
            if (!patientDetails && existingJob.orthanc_id) {
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

          const { jobId: newJobId, error: analysisError } = await startAnalysis(
            currentModality,
            currentBodyPart
          );

          if (analysisError) throw new Error(analysisError);
          if (!newJobId) throw new Error('No job ID returned from server');

          const pollJobStatus = async () => {
            if (!isMounted) return;
            
            try {
              const { job: completedJob, error: statusError, continuePolling } = 
                await checkJobStatus(newJobId);

              if (statusError) throw new Error(statusError);

              if (completedJob) {
                if (isMounted) {
                  setJob(completedJob);
                  setLoading(false);
                }
                return;
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
      const response = await axios.get(`https://api.haske.online/api/ai/results/${job.jobId}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ai_results_${orthancId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download results:', err);
      setError('Failed to download results');
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
          Processing AI Analysis
        </Typography>
        <Typography variant="body1" color="white" textAlign="center">
          Analyzing {initialModality || seriesDetails[0]?.Modality} scan of {initialBodyPart || seriesDetails[0]?.BodyPartExamined}
        </Typography>
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
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 4 }}>
          <Box sx={{ 
            backgroundColor: '#0f172a',
            p: 4,
            borderRadius: 12,
            mb: 4,
            borderLeft: '4px solid #dd841a',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}>
            <Typography variant="h4" color="white" gutterBottom fontWeight="bold">
              Analysis Not Available
            </Typography>
            <Typography variant="body1" color="white" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Typography variant="body1" color="#94a3b8">
              We couldn't find a suitable AI model for this study.
            </Typography>
          </Box>
          
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
                          <Typography variant="body2" color="#e2e8f0" sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: '0.875rem'
                          }}>
                            {model.description}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" color="#94a3b8" gutterBottom>
                            MODALITIES
                          </Typography>
                          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                            {model.modality?.slice(0, 3).map(m => (
                              <Chip 
                                key={m} 
                                label={m} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: '#1e293b',
                                  color: '#dd841a',
                                  fontSize: '0.6rem',
                                  height: 20
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                        
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" color="#94a3b8" gutterBottom>
                            BODY PARTS
                          </Typography>
                          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                            {model.body_part?.slice(0, 3).map(b => (
                              <Chip 
                                key={b} 
                                label={b} 
                                size="small" 
                                sx={{
                                  backgroundColor: '#1e293b',
                                  color: '#dd841a',
                                  fontSize: '0.6rem',
                                  height: 20
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
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

        <Box sx={{
          height: '30vh',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          boxShadow: 'inset 0 4px 6px rgba(0, 0, 0, 0.3)',
          border: '1px solid #334155'
        }}>
          <Typography variant="h5" color="#94a3b8">
            Model output will be displayed here
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0a1128 0%, #1a2a4a 100%)',
      p: 4,
      overflow: 'hidden'
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
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 4 }}>
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
              backgroundColor: '#1e293b',
              color: '#dd841a',
              '&:hover': { backgroundColor: '#334155' }
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
                  width: 300,
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
                    <Typography variant="body2" color="#e2e8f0" sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontSize: '0.875rem'
                    }}>
                      {model.description}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="#94a3b8" gutterBottom>
                      MODALITIES
                    </Typography>
                    <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                      {model.modality?.slice(0, 3).map(m => (
                        <Chip 
                          key={m} 
                          label={m} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#1e293b',
                            color: '#dd841a',
                            fontSize: '0.6rem',
                            height: 20
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                  
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="#94a3b8" gutterBottom>
                      BODY PARTS
                    </Typography>
                    <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                      {model.body_part?.slice(0, 3).map(b => (
                        <Chip 
                          key={b} 
                          label={b} 
                          size="small" 
                          sx={{
                            backgroundColor: '#1e293b',
                            color: '#dd841a',
                            fontSize: '0.6rem',
                            height: 20
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
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
              backgroundColor: '#1e293b',
              color: '#dd841a',
              '&:hover': { backgroundColor: '#334155' }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{
        height: '30vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        borderRadius: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        boxShadow: 'inset 0 4px 6px rgba(0, 0, 0, 0.3)',
        border: '1px solid #334155',
        position: 'relative',
        overflow: 'hidden'
      }}>

{visualizationUrl ? (
  <Box sx={{
    height: '100%',
    width: '100%',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }}>
    <img 
      src={visualizationUrl}
      alt="AI Visualization"
      style={{
        maxHeight: '100%',
        maxWidth: '100%',
        objectFit: 'contain'
      }}
      onError={(e) => {
        console.error('Failed to load visualization:', e);
        e.target.style.display = 'none';
        setError('Failed to load visualization. The output might be available for download.');
      }}
    />
    
      {/* Download button for the raw output */}
      {job?.results?.output_path && (
        <Button
          variant="contained"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 1,
            backgroundColor: '#dd841a',
            color: 'white',
            '&:hover': {
              backgroundColor: '#f59e0b'
            }
          }}
          startIcon={<DownloadIcon />}
          onClick={handleDownloadResults}
        >
          Download Raw Output
        </Button>
      )}
      </Box>
      ) : (
      <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h5" color="#94a3b8" gutterBottom>
        Visualization not available
      </Typography>
      {job?.logs?.includes('Shape mismatch') && (
        <Typography variant="body2" color="#ef4444">
          Warning: The input data required resampling due to shape mismatch
        </Typography>
      )}
      {job?.results?.output_path && (
        <Button
          variant="outlined"
          color="primary"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadResults}
          sx={{ mt: 2 }}
        >
          Download Output Files
        </Button>
      )}
      </Box>
    
      <Box sx={{
        mt: 4,
        p: 4,
        backgroundColor: '#1e293b',
        borderRadius: 12,
        border: '1px solid #334155'
      }}>
        <Typography variant="h5" color="white" gutterBottom>
          Evaluation
        </Typography>
        
        <Box mb={3}>
          <Typography variant="body1" color="white" gutterBottom>
            How accurate was the segmentation?
          </Typography>
          <Slider
            value={feedback.accuracy}
            onChange={(e, value) => setFeedback({...feedback, accuracy: value})}
            min={1}
            max={5}
            step={1}
            marks={[
              {value: 1, label: 'Poor'},
              {value: 2, label: 'Fair'},
              {value: 3, label: 'Good'},
              {value: 4, label: 'Very Good'},
              {value: 5, label: 'Excellent'}
            ]}
            sx={{ maxWidth: 600 }}
          />
        </Box>
        
        <Box mb={3}>
          <Typography variant="body1" color="white" gutterBottom>
            How useful was this analysis for your diagnosis?
          </Typography>
          <Slider
            value={feedback.usefulness}
            onChange={(e, value) => setFeedback({...feedback, usefulness: value})}
            min={1}
            max={5}
            step={1}
            marks={[
              {value: 1, label: 'Not Useful'},
              {value: 2, label: 'Slightly Useful'},
              {value: 3, label: 'Moderately Useful'},
              {value: 4, label: 'Very Useful'},
              {value: 5, label: 'Extremely Useful'}
            ]}
            sx={{ maxWidth: 600 }}
          />
        </Box>
        
        <TextField
          label="Additional Comments"
          fullWidth
          multiline
          rows={3}
          value={feedback.comments}
          onChange={(e) => setFeedback({...feedback, comments: e.target.value})}
          sx={{ mb: 3, backgroundColor: '#0f172a' }}
        />
        
        <Box display="flex" alignItems="center" gap={2}>
          <Button
            variant={feedback.approved ? "contained" : "outlined"}
            color="success"
            onClick={() => setFeedback({...feedback, approved: true})}
            startIcon={<CheckIcon />}
          >
            Approve Results
          </Button>
          <Button
            variant={!feedback.approved ? "contained" : "outlined"}
            color="error"
            onClick={() => setFeedback({...feedback, approved: false})}
            startIcon={<CloseIcon />}
          >
            Reject Results
          </Button>
          <Button
            variant="contained"
            onClick={submitFeedback}
            sx={{ ml: 'auto' }}
          >
            Submit Feedback
          </Button>
        </Box>
      </Box>

      <Modal
        open={Boolean(zoomedImage)}
        onClose={() => setZoomedImage(null)}
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(8px)'
        }}
      >
        <Box sx={{ 
          position: 'relative',
          bgcolor: '#1e293b',
          p: 2,
          borderRadius: 12,
          outline: 'none',
          maxWidth: '90%',
          maxHeight: '90%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          border: '1px solid #334155'
        }}>
          <IconButton
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
              backgroundColor: '#ef4444',
              color: 'white',
              '&:hover': { backgroundColor: '#dc2626' }
            }}
            onClick={() => setZoomedImage(null)}
          >
            <CloseIcon />
          </IconButton>
          <img 
            src={zoomedImage} 
            alt="Zoomed view" 
            style={{ 
              maxWidth: '100%',
              maxHeight: 'calc(90vh - 32px)',
              display: 'block',
              borderRadius: 8
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default AIAnalysis;
