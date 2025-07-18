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
  const initialModality = query.get('modality');
  const initialBodyPart = query.get('bodyPart');

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
      // Optionally show a success message
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
      const [studyResponse, seriesResponse] = await Promise.all([
        axios.get(`https://api.haske.online/proxy/orthanc/studies/${orthancId}`),
        axios.get(`https://api.haske.online/proxy/orthanc/studies/${orthancId}/series`)
      ]);

      const seriesData = await Promise.all(
        seriesResponse.data.map(async (series) => {
          const seriesDetails = await axios.get(`https://api.haske.online/proxy/orthanc/series/${series.ID}`);
          return {
            ...series,
            Modality: seriesDetails.data.MainDicomTags?.Modality || 'UNKNOWN',
            BodyPartExamined: seriesDetails.data.MainDicomTags?.BodyPartExamined || 'UNKNOWN'
          };
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
        `https://api.haske.online/api/ai/job/${jobId}`
      );
      
      if (jobData.status === 'completed') {
        return { job: jobData };
      } else if (jobData.status === 'failed') {
        return { error: jobData.results?.error || 'Analysis failed' };
      } else {
        // Continue polling
        return { continuePolling: true };
      }
    } catch (err) {
      return { error: 'Failed to check job status' };
    }
  };

  useEffect(() => {
    let isMounted = true;
    let pollingTimeout;

    const initialize = async () => {
      try {
        const [configData, studyData] = await Promise.all([
          fetchConfig(),
          fetchStudyDetails()
        ]);

        if (!isMounted) return;

        setAvailableModels(configData.models);
        setGithubRepo(configData.githubRepo);
        setPatientDetails(studyData.patientDetails);
        setSeriesDetails(studyData.seriesDetails);

        const currentModality = initialModality || studyData.seriesDetails[0]?.Modality;
        const currentBodyPart = initialBodyPart || studyData.seriesDetails[0]?.BodyPartExamined;

        const { jobId, error: analysisError } = await startAnalysis(
          currentModality,
          currentBodyPart
        );

        if (analysisError) {
          setError(analysisError);
          setLoading(false);
          return;
        }

        if (!jobId) {
          setError('No job ID returned from server');
          setLoading(false);
          return;
        }

        const pollJobStatus = async () => {
          if (!isMounted) return;
          
          const { job: completedJob, error: statusError, continuePolling } = 
            await checkJobStatus(jobId);

          if (statusError) {
            setError(statusError);
            setLoading(false);
            return;
          }

          if (completedJob) {
            setJob(completedJob);
            setLoading(false);
            return;
          }

          if (continuePolling) {
            pollingTimeout = setTimeout(pollJobStatus, 2000);
          }
        };

        pollJobStatus();
      } catch (err) {
        if (isMounted) {
          setError('Initialization failed');
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;
      clearTimeout(pollingTimeout);
    };
  }, [orthancId, initialModality, initialBodyPart]);

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

  // Error State
  if (error) {
    return (
      <Box sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
        p: 4
      }}>
        {/* Header Section */}
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

        {/* Error Message */}
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
                        height: 300, // Fixed square size
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

        {/* Model Output Placeholder */}
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

  // Success State
  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #0a1128 0%, #1a2a4a 100%)',
      p: 4,
      overflow: 'hidden'
    }}>
      {/* Header Section */}
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

      {/* Model Gallery */}
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
                  height: 300, // Fixed square size
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

      {/* Model Output */}
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
        {job?.results?.outputs?.[0]?.url ? (
          <>
            <CardMedia
              component="img"
              image={job.results.outputs[0].url}
              alt="AI Analysis Output"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: 0.7
              }}
            />
            <Button
              variant="contained"
              sx={{
                position: 'absolute',
                bottom: 16,
                right: 16,
                zIndex: 1,
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
              startIcon={<DownloadIcon />}
              onClick={handleDownloadResults}
            >
              Download Results
            </Button>
            <Button
              variant="contained"
              sx={{
                position: 'absolute',
                bottom: 16,
                left: 16,
                zIndex: 1,
                borderRadius: 8,
                fontWeight: 'bold',
                backgroundColor: '#0f172a',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1e293b',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.4)'
                }
              }}
              startIcon={<RefreshIcon />}
              onClick={handleProcessAnother}
            >
              Process Another
            </Button>
          </>
        ) : (
          <Typography variant="h5" color="#94a3b8">
            Model output will be displayed here
          </Typography>
        )}
      </Box>

      {/* Feedback Section */}
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

      {/* Image Zoom Modal */}
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
