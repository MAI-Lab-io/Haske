import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, CircularProgress, Grid, Paper, 
  Button, Card, CardContent, CardMedia, Divider,
  Chip, Stack, IconButton, Modal, Alert,
  Container, Avatar, useTheme
} from '@mui/material';
import axios from 'axios';
import { 
  Info as InfoIcon, GitHub as GitHubIcon, 
  ZoomIn as ZoomInIcon, Download as DownloadIcon,
  Save as SaveIcon, Refresh as RefreshIcon, 
  Close as CloseIcon, Science as ScienceIcon
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
  
  const orthancId = query.get('orthancId');
  const initialModality = query.get('modality');
  const initialBodyPart = query.get('bodyPart');

  // Format patient name consistently
  const formatPatientName = (name) => {
    if (!name) return 'N/A';
    return name.replace(/\\/g, ' ').trim();
  };

  // Format date consistently
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
          axios.get(`https://haske.online:5000/studies/${orthancId}`),
          axios.get(`https://haske.online:5000/studies/${orthancId}/series`)
        ]);

        if (isMounted) {
          setPatientDetails(studyResponse.data.PatientMainDicomTags || {});
          
          // Get details from first series if not provided in URL
          const firstSeries = seriesResponse.data[0] || {};
          const seriesData = await Promise.all(
            seriesResponse.data.map(async (series) => {
              const seriesDetails = await axios.get(`https://haske.online:5000/series/${series.ID}`);
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
      <Container maxWidth="xl" sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        flexDirection: 'column',
        gap: 3
      }}>
        <ScienceIcon sx={{ fontSize: 80, color: theme.palette.primary.main }} />
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h4" color="text.primary" fontWeight="medium">
          Processing AI Analysis...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyzing {currentModality} scan of {currentBodyPart}
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Card sx={{ 
          borderRadius: 4,
          boxShadow: theme.shadows[10],
          overflow: 'visible'
        }}>
          <Box sx={{ 
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            p: 4,
            textAlign: 'center',
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4
          }}>
            <Typography variant="h3" fontWeight="bold">
              Haske AI Analysis
            </Typography>
            {githubRepo && (
              <Button 
                variant="contained"
                color="secondary"
                startIcon={<GitHubIcon />}
                href={githubRepo}
                target="_blank"
                sx={{ 
                  mt: 3,
                  px: 4,
                  py: 1.5,
                  borderRadius: 50,
                  boxShadow: theme.shadows[4]
                }}
              >
                View Main Repository
              </Button>
            )}
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Box sx={{ 
              backgroundColor: theme.palette.error.light,
              p: 3,
              borderRadius: 3,
              mb: 4
            }}>
              <Typography variant="h5" color="error" gutterBottom fontWeight="bold">
                Analysis Not Available
              </Typography>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Typography variant="body1" color="text.secondary">
                We couldn't find a suitable AI model for {currentModality} scans of the {currentBodyPart}.
              </Typography>
            </Box>
            
            {availableModels.length > 0 && (
              <>
                <Divider sx={{ my: 4 }} />
                <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
                  Available AI Models
                </Typography>
                
                <Box sx={{ 
                  width: '100%',
                  overflowX: 'auto',
                  py: 2,
                  px: 1,
                  '&::-webkit-scrollbar': {
                    height: '8px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '4px',
                  }
                }}>
                  <Stack direction="row" spacing={4} sx={{ width: 'max-content' }}>
                    {availableModels.map((model) => (
                      <Card 
                        key={model.id}
                        sx={{ 
                          minWidth: 300,
                          maxWidth: 350,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          border: selectedModel?.id === model.id ? 
                            `2px solid ${theme.palette.primary.main}` : 
                            `1px solid ${theme.palette.divider}`,
                          borderRadius: 3,
                          boxShadow: selectedModel?.id === model.id ? theme.shadows[6] : theme.shadows[2],
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: theme.shadows[8]
                          }
                        }}
                        onClick={() => setSelectedModel(model)}
                      >
                        <CardContent sx={{ flexGrow: 1, p: 3 }}>
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: theme.palette.primary.main,
                              width: 50,
                              height: 50
                            }}>
                              <ScienceIcon />
                            </Avatar>
                            <Typography variant="h5" fontWeight="bold">
                              {model.name}
                            </Typography>
                          </Stack>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            {model.description}
                          </Typography>
                          
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Supported Modalities:
                            </Typography>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                              {model.modality?.map(m => (
                                <Chip 
                                  key={m} 
                                  label={m} 
                                  size="small" 
                                  sx={{ 
                                    backgroundColor: theme.palette.primary.light,
                                    color: theme.palette.primary.contrastText
                                  }}
                                />
                              ))}
                            </Stack>
                          </Box>
                          
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                              Supported Body Parts:
                            </Typography>
                            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                              {model.body_part?.map(b => (
                                <Chip 
                                  key={b} 
                                  label={b} 
                                  size="small" 
                                  color="secondary"
                                />
                              ))}
                            </Stack>
                          </Box>
                          
                          {model.github_link && (
                            <Button 
                              fullWidth
                              variant="outlined"
                              startIcon={<GitHubIcon />}
                              href={model.github_link}
                              target="_blank"
                              sx={{ 
                                mt: 1,
                                borderRadius: 2,
                                borderWidth: 2,
                                '&:hover': {
                                  borderWidth: 2
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Model Code
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        <Card sx={{ 
          mt: 4,
          borderRadius: 4,
          boxShadow: theme.shadows[5]
        }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Study Details
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  backgroundColor: theme.palette.grey[100],
                  p: 3,
                  borderRadius: 3
                }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    PATIENT INFORMATION
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Name:</strong> {formatPatientName(patientDetails?.PatientName)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>ID:</strong> {patientDetails?.PatientID || 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>DOB:</strong> {formatDate(patientDetails?.PatientBirthDate)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ 
                  backgroundColor: theme.palette.grey[100],
                  p: 3,
                  borderRadius: 3
                }}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    STUDY INFORMATION
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Study Date:</strong> {formatDate(seriesDetails[0]?.StudyDate)}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Modality:</strong> {currentModality}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Body Part:</strong> {currentBodyPart}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Card sx={{ 
        borderRadius: 4,
        boxShadow: theme.shadows[10],
        overflow: 'hidden'
      }}>
        <Box sx={{ 
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          p: 4,
          textAlign: 'center'
        }}>
          <Typography variant="h3" fontWeight="bold">
            Haske AI Analysis Results
          </Typography>
          {githubRepo && (
            <Button 
              variant="contained"
              color="secondary"
              startIcon={<GitHubIcon />}
              href={githubRepo}
              target="_blank"
              sx={{ 
                mt: 3,
                px: 4,
                py: 1.5,
                borderRadius: 50,
                boxShadow: theme.shadows[4]
              }}
            >
              View Main Repository
            </Button>
          )}
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Card sx={{ 
            mb: 6,
            borderRadius: 3,
            boxShadow: theme.shadows[3]
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Study Information
              </Typography>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    backgroundColor: theme.palette.grey[100],
                    p: 3,
                    borderRadius: 3
                  }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      PATIENT INFORMATION
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Name:</strong> {formatPatientName(patientDetails?.PatientName)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>ID:</strong> {patientDetails?.PatientID || 'N/A'}
                    </Typography>
                    <Typography variant="body1">
                      <strong>DOB:</strong> {formatDate(patientDetails?.PatientBirthDate)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ 
                    backgroundColor: theme.palette.grey[100],
                    p: 3,
                    borderRadius: 3
                  }}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      STUDY INFORMATION
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Study Date:</strong> {formatDate(seriesDetails[0]?.StudyDate)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Modality:</strong> {currentModality}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Body Part:</strong> {currentBodyPart}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
            Analysis Results
          </Typography>
          
          <Grid container spacing={4} sx={{ mb: 6 }}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: theme.shadows[3],
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: theme.shadows[6]
                }
              }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight="bold">Original Image</Typography>
                    <IconButton 
                      onClick={() => setZoomedImage(`https://haske.online:8090/instances/${orthancId}/preview`)}
                      sx={{
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.main
                        }
                      }}
                    >
                      <ZoomInIcon />
                    </IconButton>
                  </Stack>
                  <CardMedia
                    component="img"
                    image={`https://haske.online:8090/instances/${orthancId}/preview`}
                    alt="Original DICOM"
                    sx={{ 
                      mt: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                    onClick={() => setZoomedImage(`https://haske.online:8090/instances/${orthancId}/preview`)}
                  />
                </CardContent>
              </Card>
            </Grid>
            
            {job?.results?.outputs?.map((output, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ 
                  borderRadius: 3,
                  boxShadow: theme.shadows[3],
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: theme.shadows[6]
                  }
                }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight="bold">{output.label}</Typography>
                      <IconButton 
                        onClick={() => setZoomedImage(output.url)}
                        sx={{
                          backgroundColor: theme.palette.primary.light,
                          color: theme.palette.primary.contrastText,
                          '&:hover': {
                            backgroundColor: theme.palette.primary.main
                          }
                        }}
                      >
                        <ZoomInIcon />
                      </IconButton>
                    </Stack>
                    <CardMedia
                      component="img"
                      image={output.url}
                      alt={output.label}
                      sx={{ 
                        mt: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)'
                        }
                      }}
                      onClick={() => setZoomedImage(output.url)}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {job?.results && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 3,
              flexWrap: 'wrap'
            }}>
              <Button 
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadResults}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  minWidth: 200
                }}
              >
                Download Results
              </Button>
              <Button 
                variant="outlined"
                color="primary"
                startIcon={<SaveIcon />}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  minWidth: 200,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2
                  }
                }}
              >
                Save to Orthanc
              </Button>
              <Button 
                variant="outlined"
                color="secondary"
                startIcon={<RefreshIcon />}
                onClick={handleProcessAnother}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  minWidth: 200,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2
                  }
                }}
              >
                Process Another
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

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
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 3,
          outline: 'none',
          maxWidth: '95%',
          maxHeight: '95%',
          boxShadow: theme.shadows[24]
        }}>
          <IconButton
            sx={{ 
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1,
              backgroundColor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.error.dark
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
              maxHeight: '90vh',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </Box>
      </Modal>
    </Container>
  );
};

export default AIAnalysis;
