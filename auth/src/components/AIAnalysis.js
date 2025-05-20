import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Grid, Paper,
  Button, Card, CardContent, CardMedia, Divider,
  Chip, Stack, IconButton, Modal, Container,
  Avatar, useTheme, useScrollTrigger
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';
import {
  GitHub as GitHubIcon,
  ZoomIn as ZoomInIcon, Download as DownloadIcon,
  Save as SaveIcon, Refresh as RefreshIcon,
  Close as CloseIcon, Science as ScienceIcon,
  ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

// Create a custom theme using MUI's createTheme function
const customTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0f172a',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#dd841a',
      contrastText: '#ffffff'
    },
    background: {
      default: '#020617',
      paper: '#1e293b'
    },
    text: {
      primary: '#ffffff',
      secondary: '#dd841a'
    }
  },
  shape: {
    borderRadius: 12
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem'
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem'
    }
  }
});
const AIAnalysis = () => {
  // Use the theme from ThemeProvider context instead of creating inline
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
      setScrollPosition(container.scrollLeft + scrollAmount);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      try {
        const configResponse = await axios.get('https://haske.online:8090/api/ai/config');
        if (isMounted) {
          setAvailableModels(configResponse.data.models || []);
          setGithubRepo(configResponse.data.githubRepo || 'https://github.com/MAILABHASKE/mailab-models');
        }
      } catch (err) {
        console.error('Failed to fetch config:', err);
        if (isMounted) {
          setAvailableModels([]);
          setGithubRepo('');
        }
      }
    };

    const fetchStudyDetails = async () => {
      try {
        const [studyResponse, seriesResponse] = await Promise.all([
          axios.get(`https://haske.online:8090/proxy/orthanc/studies/${orthancId}`),
          axios.get(`https://haske.online:8090/proxy/orthanc/studies/${orthancId}/series`)
        ]);

        if (isMounted) {
          setPatientDetails(studyResponse.data.PatientMainDicomTags || {});
          
          const seriesData = await Promise.all(
            seriesResponse.data.map(async (series) => {
              const seriesDetails = await axios.get(`https://haske.online:8090/proxy/orthanc/series/${series.ID}`);
              return {
                ...series,
                Modality: seriesDetails.data.MainDicomTags?.Modality || 'UNKNOWN',
                BodyPartExamined: seriesDetails.data.MainDicomTags?.BodyPartExamined || 'UNKNOWN'
              };
            })
          );

          setSeriesDetails(seriesData);
        }
      } catch (err) {
        console.error('Failed to fetch study details:', err);
        if (isMounted) {
          setSeriesDetails([{
            Modality: initialModality || 'UNKNOWN',
            BodyPartExamined: initialBodyPart || 'UNKNOWN'
          }]);
          setPatientDetails({});
        }
      }
    };

    
    const startAnalysis = async () => {
      try {
        const { data } = await axios.post('https://haske.online:8090/api/ai/analyze', {
          orthancId,
          modality: initialModality || seriesDetails[0]?.Modality,
          bodyPart: initialBodyPart || seriesDetails[0]?.BodyPartExamined
        });
        
        if (!isMounted) return;

        if (data.status === 'no_model') {
          setError(data.message || 'No suitable model found for this study');
          setLoading(false);
          return;
        }
        
        if (data.status === 'queued') {
          const checkStatus = async (jobId) => {
            try {
              const { data: jobData } = await axios.get(
                `https://haske.online:8090/api/ai/job/${jobId}`
              );
              
              if (!isMounted) return;

              if (jobData.status === 'completed') {
                setJob(jobData);
                setLoading(false);
              } else if (jobData.status === 'failed') {
                setError(jobData.results?.error || 'Analysis failed');
                setLoading(false);
              } else {
                setTimeout(() => checkStatus(jobId), 2000);
              }
            } catch (err) {
              if (isMounted) {
                setError('Failed to check job status');
                setLoading(false);
              }
            }
          };
          checkStatus(data.jobId);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || err.message || 'Failed to start analysis');
          setLoading(false);
        }
      }
    };

    const initialize = async () => {
      try {
        await Promise.all([fetchConfig(), fetchStudyDetails()]);
        await startAnalysis();
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
    };
  }, [orthancId, initialModality, initialBodyPart]);

  const handleDownloadResults = async () => {
    try {
      const response = await axios.get(`https://haske.online:8090/api/ai/results/${job.jobId}`, {
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
          color: theme.palette.secondary.main,
          filter: 'drop-shadow(0 4px 6px rgba(59, 130, 246, 0.3))'
        }} />
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ color: theme.palette.secondary.main }}
        />
        <Typography variant="h4" fontWeight="bold" sx={{
          background: `linear-gradient(90deg, rgb(147, 197, 253) 0%, #93c5fd 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}>
          Processing AI Analysis
        </Typography>
        <Typography variant="body1" color="#ffff" textAlign="center">
          Analyzing {currentModality} scan of {currentBodyPart}
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
        {/* Row 1: Header Section */}
        <Box sx={{
          textAlign: 'center',
          mb: 4,
          pt: 4
        }}>
          <Typography variant="h2" fontWeight="bold" sx={{
            background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, #93c5fd 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}>
            Haske MedAI
          </Typography>
          <Typography variant="subtitle1" color="#ffff" sx={{ mb: 3 }}>
            Advanced diagnostic imaging analysis powered by AI
          </Typography>
          {githubRepo && (
            <Button
              variant="contained"
              color="#dd841a"
              startIcon={<GitHubIcon />}
              href={githubRepo}
              target="_blank"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 8,
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.4)'
                }
              }}
            >
              View on GitHub
            </Button>
          )}
        </Box>

        {/* Row 2: Model Gallery */}
        <Box sx={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          mb: 4
        }}>
          <Box sx={{ 
            backgroundColor: '#0f172a',
            p: 4,
            borderRadius: 12,
            mb: 4,
            borderLeft: '4px solid #dd841a',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}>
            <Typography variant="h4" color="#fffff" gutterBottom fontWeight="bold">
              Analysis Not Available
            </Typography>
            <Typography variant="body1" color="#ffff" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Typography variant="body1" color="#94a3b8">
              We couldn't find a suitable AI model for {currentModality} scans of the {currentBodyPart}.
            </Typography>
          </Box>
          
          {availableModels.length > 0 && (
            <>
              <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
                mb: 3,
                textAlign: 'center',
                color: theme.palette.text.primary
              }}>
                Available AI Models
              </Typography>
              
              <Box sx={{ 
                position: 'relative',
                width: '50%',
                mb: 4
              }}>
                <IconButton
                  onClick={() => handleScroll('left')}
                  sx={{
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 2,
                    backgroundColor: '#0f172a',
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      backgroundColor: '#334155'
                    }
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
                    '&::-webkit-scrollbar': {
                      height: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: theme.palette.secondary.main,
                      borderRadius: '3px',
                    }
                  }}
                >
                  {availableModels.map((model) => (
                    <Card 
                      key={model.id}
                      sx={{ 
                        minWidth: 300,
                        flexShrink: 0,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: selectedModel?.id === model.id ? 
                          `2px solid ${theme.palette.secondary.main}` : 
                          `1px solid #334155`,
                        borderRadius: 12,
                        backgroundColor: '#1e293b',
                        boxShadow: selectedModel?.id === model.id ? 
                          `0 10px 15px -3px rgba(59, 130, 246, 0.3)` : 
                          '0 4px 6px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)'
                        }
                      }}
                      onClick={() => setSelectedModel(model)}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                          <Avatar sx={{ 
                            bgcolor: theme.palette.secondary.main,
                            width: 40,
                            height: 40
                          }}>
                            <ScienceIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="h6" fontWeight="bold" color="text.primary">
                            {model.name}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          {model.description}
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            SUPPORTED MODALITIES
                          </Typography>
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                            {model.modality?.map(m => (
                              <Chip 
                                key={m} 
                                label={m} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: '#1e40af',
                                  color: '#bfdbfe',
                                  fontSize: '0.7rem',
                                  height: 24
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                        
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="caption" color="text.secondary" gutterBottom>
                            SUPPORTED BODY PARTS
                          </Typography>
                          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                            {model.body_part?.map(b => (
                              <Chip 
                                key={b} 
                                label={b} 
                                size="small" 
                                sx={{
                                  backgroundColor: '#1e3a8a',
                                  color: '#93c5fd',
                                  fontSize: '0.7rem',
                                  height: 24
                                }}
                              />
                            ))}
                          </Stack>
                        </Box>
                        
                        {model.github_link && (
                          <Button 
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={<GitHubIcon fontSize="small" />}
                            href={model.github_link}
                            target="_blank"
                            sx={{ 
                              mt: 1,
                              borderRadius: 8,
                              borderWidth: 1,
                              fontSize: '0.75rem',
                              color: theme.palette.secondary.main,
                              borderColor: theme.palette.secondary.main,
                              '&:hover': {
                                borderWidth: 1,
                                backgroundColor: 'rgba(59, 130, 246, 0.1)'
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Code
                          </Button>
                        )}
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
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      backgroundColor: '#334155'
                    }
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>
            </>
          )}
        </Box>

        {/* Row 3: Model Output */}
        <Box sx={{
          height: '30vh',
          background: 'linear-gradient(135deg, #ffff 0%, #0f172a 100%)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          boxShadow: 'inset 0 4px 6px rgba(0, 0, 0, 0.3)',
          border: '1px solid #334155'
        }}>
          <Typography variant="h5" color="text.secondary">
            Model output will be displayed here based on selected modality
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
      {/* Row 1: Header Section */}
      <Box sx={{
        textAlign: 'center',
        mb: 4,
        pt: 4
      }}>
        <Typography variant="h2" fontWeight="bold" sx={{
          background: `linear-gradient(90deg, #3b82f6 0%, #93c5fd 100%)`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 2
        }}>
          Medical AI Analysis
        </Typography>
        <Typography variant="subtitle1" color="#e2e8f0" sx={{ mb: 3 }}>
          Advanced diagnostic imaging analysis powered by AI
        </Typography>
        {githubRepo && (
          <Button
            variant="contained"
            color="secondary"
            startIcon={<GitHubIcon />}
            href={githubRepo}
            target="_blank"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 8,
              fontWeight: 'bold',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 8px rgba(0, 0, 0, 0.4)'
              }
            }}
          >
            View on GitHub
          </Button>
        )}
      </Box>

      {/* Row 2: Model Gallery */}
      <Box sx={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        mb: 4
      }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ 
          mb: 3,
          textAlign: 'center',
          color: '#fffff'
        }}>
          Available AI Models
        </Typography>
        
        <Box sx={{ 
          position: 'relative',
          width: '100%',
          mb: 4
        }}>
          <IconButton
            onClick={() => handleScroll('left')}
            sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: '#1e293b',
              color: '#3b82f6',
              '&:hover': {
                backgroundColor: '#334155'
              }
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
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#3b82f6',
                borderRadius: '3px',
              }
            }}
          >
            {availableModels.map((model) => (
              <Card 
                key={model.id}
                sx={{ 
                  minWidth: 320,
                  width: 320,
                  height: 420,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  border: selectedModel?.id === model.id ? 
                    `2px solid #3b82f6` : 
                    `1px solid #334155`,
                  borderRadius: 12,
                  backgroundColor: '#1e293b',
                  boxShadow: selectedModel?.id === model.id ? 
                    `0 10px 15px -3px rgba(59, 130, 246, 0.3)` : 
                    '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.4)'
                  }
                }}
                onClick={() => setSelectedModel(model)}
              >
                <CardContent sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  p: 3,
                  overflow: 'hidden'
                }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Avatar sx={{ 
                      bgcolor: '#3b82f6',
                      width: 40,
                      height: 40
                    }}>
                      <ScienceIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="h6" fontWeight="bold" color="#f8fafc" noWrap>
                      {model.name}
                    </Typography>
                  </Stack>
                  
                  <Box sx={{ 
                    flex: 1,
                    overflow: 'hidden',
                    mb: 2
                  }}>
                    <Typography variant="body2" color="#e2e8f0" sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {model.description}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="#94a3b8" gutterBottom>
                      SUPPORTED MODALITIES
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                      {model.modality?.map(m => (
                        <Chip 
                          key={m} 
                          label={m} 
                          size="small" 
                          sx={{ 
                            backgroundColor: '#1e40af',
                            color: '#bfdbfe',
                            fontSize: '0.7rem',
                            height: 24
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="#94a3b8" gutterBottom>
                      SUPPORTED BODY PARTS
                    </Typography>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                      {model.body_part?.map(b => (
                        <Chip 
                          key={b} 
                          label={b} 
                          size="small" 
                          sx={{
                            backgroundColor: '#1e3a8a',
                            color: '#93c5fd',
                            fontSize: '0.7rem',
                            height: 24
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                  
                  {model.github_link && (
                    <Button 
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<GitHubIcon fontSize="small" />}
                      href={model.github_link}
                      target="_blank"
                      sx={{ 
                        mt: 'auto',
                        borderRadius: 8,
                        borderWidth: 1,
                        fontSize: '0.75rem',
                        color: '#3b82f6',
                        borderColor: '#3b82f6',
                        '&:hover': {
                          borderWidth: 1,
                          backgroundColor: 'rgba(59, 130, 246, 0.1)'
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Code
                    </Button>
                  )}
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
              color: '#3b82f6',
              '&:hover': {
                backgroundColor: '#334155'
              }
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Row 3: Model Output */}
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
        ) : (
          <Typography variant="h5" color="#94a3b8">
            Model output will be displayed here based on selected modality
          </Typography>
        )}
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
              '&:hover': {
                backgroundColor: '#dc2626'
              }
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
