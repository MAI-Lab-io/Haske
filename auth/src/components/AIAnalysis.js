import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, CircularProgress, Grid, Paper, 
  Button, Card, CardContent, CardMedia, Divider,
  Chip, Stack, IconButton, Modal, Alert
} from '@mui/material';
import axios from 'axios';
import { 
  Info as InfoIcon, GitHub as GitHubIcon, 
  ZoomIn as ZoomInIcon, Download as DownloadIcon,
  Save as SaveIcon, Refresh as RefreshIcon, Close as CloseIcon 
} from '@mui/icons-material';

const AIAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [error, setError] = useState(null);
  const [studyDetails, setStudyDetails] = useState(null);
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
          setGithubRepo(configResponse.data.githubRepo || '');
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
          setStudyDetails({
            ...studyResponse.data.MainDicomTags,
            Modality: initialModality || studyResponse.data.MainDicomTags?.Modality || 'UNKNOWN',
            BodyPartExamined: initialBodyPart || seriesResponse.data[0]?.MainDicomTags?.BodyPartExamined || 'UNKNOWN'
          });

          setPatientDetails(studyResponse.data.PatientMainDicomTags || {});
        }
      } catch (err) {
        console.error('Failed to fetch study details:', err);
        if (isMounted) {
          setStudyDetails({
            Modality: initialModality || 'UNKNOWN',
            BodyPartExamined: initialBodyPart || 'UNKNOWN'
          });
          setPatientDetails({});
        }
      }
    };

    const startAnalysis = async () => {
      try {
        const { data } = await axios.post('https://haske.online:8090/api/ai/analyze', {
          orthancId,
          modality: initialModality || studyDetails?.Modality,
          bodyPart: initialBodyPart || studyDetails?.BodyPartExamined
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

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Typography variant="h5" color="textSecondary">
          Processing AI analysis...
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Analyzing {studyDetails?.Modality || initialModality} scan of {studyDetails?.BodyPartExamined || initialBodyPart}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        maxWidth: 1200, 
        mx: 'auto', 
        p: 4,
        backgroundColor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Haske AI Analysis
          </Typography>
          {githubRepo && (
            <Button 
              variant="text" 
              startIcon={<GitHubIcon />}
              href={githubRepo}
              target="_blank"
              sx={{ mt: 1 }}
            >
              View Main Repository
            </Button>
          )}
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" color="error" gutterBottom>
              Analysis Not Available
            </Typography>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography variant="body2" color="textSecondary" paragraph>
              We couldn't find a suitable AI model for {studyDetails?.Modality || initialModality} scans of the {studyDetails?.BodyPartExamined || initialBodyPart}.
            </Typography>
            
            {availableModels.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Available Models
                </Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  {availableModels.map((model) => (
                    <Grid item xs={12} sm={6} md={4} key={model.id}>
                      <Card 
                        variant="outlined"
                        sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderColor: selectedModel?.id === model.id ? 'primary.main' : 'divider',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 1
                          }
                        }}
                        onClick={() => setSelectedModel(model)}
                      >
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              bgcolor: 'primary.main', 
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%'
                            }}>
                              <InfoIcon />
                            </Box>
                            <Typography variant="h6">{model.name}</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ mt: 1, mb: 2 }}>
                            {model.description}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                            {model.modality?.map(m => (
                              <Chip key={m} label={m} size="small" />
                            ))}
                          </Stack>
                          <Stack direction="row" spacing={1}>
                            {model.body_part?.map(b => (
                              <Chip key={b} label={b} size="small" color="secondary" />
                            ))}
                          </Stack>
                          {model.github_link && (
                            <Button 
                              size="small" 
                              startIcon={<GitHubIcon />}
                              href={model.github_link}
                              target="_blank"
                              sx={{ mt: 1 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Model Code
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Study Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Patient:</strong> {formatPatientName(patientDetails?.PatientName)}
                </Typography>
                <Typography variant="body1">
                  <strong>Study Date:</strong> {formatDate(studyDetails?.StudyDate)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body1">
                  <strong>Modality:</strong> {studyDetails?.Modality}
                </Typography>
                <Typography variant="body1">
                  <strong>Body Part:</strong> {studyDetails?.BodyPartExamined}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: 1200, 
      mx: 'auto', 
      p: 4,
      backgroundColor: 'background.paper',
      borderRadius: 2,
      boxShadow: 1
    }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Haske AI Analysis Results
        </Typography>
        {githubRepo && (
          <Button 
            variant="text" 
            startIcon={<GitHubIcon />}
            href={githubRepo}
            target="_blank"
            sx={{ mt: 1 }}
          >
            View Main Repository
          </Button>
        )}
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Study Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                <strong>Patient:</strong> {formatPatientName(patientDetails?.PatientName)}
              </Typography>
              <Typography variant="body1">
                <strong>Study Date:</strong> {formatDate(studyDetails?.StudyDate)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body1">
                <strong>Modality:</strong> {studyDetails?.Modality}
              </Typography>
              <Typography variant="body1">
                <strong>Body Part:</strong> {studyDetails?.BodyPartExamined}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Analysis Results
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Original Image</Typography>
                <IconButton onClick={() => setZoomedImage(`https://haske.online:8090/instances/${orthancId}/preview`)}>
                  <ZoomInIcon />
                </IconButton>
              </Stack>
              <CardMedia
                component="img"
                image={`https://haske.online:8090/instances/${orthancId}/preview`}
                alt="Original DICOM"
                sx={{ 
                  mt: 2,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'scale(1.02)',
                    transition: 'transform 0.3s'
                  }
                }}
                onClick={() => setZoomedImage(`https://haske.online:8090/instances/${orthancId}/preview`)}
              />
            </CardContent>
          </Card>
        </Grid>
        
        {job?.results?.outputs?.map((output, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{output.label}</Typography>
                  <IconButton onClick={() => setZoomedImage(output.url)}>
                    <ZoomInIcon />
                  </IconButton>
                </Stack>
                <CardMedia
                  component="img"
                  image={output.url}
                  alt={output.label}
                  sx={{ 
                    mt: 2,
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'scale(1.02)',
                      transition: 'transform 0.3s'
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
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="outlined" 
            startIcon={<DownloadIcon />}
            onClick={handleDownloadResults}
          >
            Download Results
          </Button>
          <Button variant="outlined" startIcon={<SaveIcon />}>
            Save to Orthanc
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<RefreshIcon />}
            onClick={handleProcessAnother}
          >
            Process Another
          </Button>
        </Box>
      )}

      <Modal
        open={Boolean(zoomedImage)}
        onClose={() => setZoomedImage(null)}
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Box sx={{ 
          position: 'relative',
          bgcolor: 'background.paper',
          p: 4,
          borderRadius: 2,
          outline: 'none',
          maxWidth: '90%',
          maxHeight: '90%'
        }}>
          <IconButton
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'text.primary'
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
              maxHeight: '80vh',
              display: 'block'
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default AIAnalysis;
