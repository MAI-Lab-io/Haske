import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Custom Tesla-inspired UI components
const TeslaContainer = ({ children, maxWidth = '1440px' }) => (
  <div style={{
    maxWidth,
    margin: '0 auto',
    padding: '24px',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  }}>
    {children}
  </div>
);

const TeslaCard = ({ children, elevation = 1, padding = '24px', style = {} }) => (
  <div style={{
    background: '#fff',
    borderRadius: '12px',
    padding,
    boxShadow: elevation === 1 ? '0 1px 3px rgba(0,0,0,0.1)' : 
               elevation === 2 ? '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)' : 
               '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
    ...style
  }}>
    {children}
  </div>
);

const TeslaButton = ({ 
  children, 
  variant = 'contained', 
  color = 'primary', 
  onClick, 
  startIcon, 
  style = {},
  disabled = false,
  fullWidth = false
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#e2e8f0';
    if (variant === 'text') return 'transparent';
    return color === 'primary' ? '#0f172a' : 
           color === 'secondary' ? '#fff' : '#f1f5f9';
  };

  const getTextColor = () => {
    if (disabled) return '#94a3b8';
    if (variant === 'contained') {
      return color === 'primary' ? '#fff' : '#0f172a';
    }
    return '#0f172a';
  };

  const getBorder = () => {
    if (variant === 'outlined') {
      return `2px solid ${color === 'primary' ? '#0f172a' : '#cbd5e1'}`;
    }
    return 'none';
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      style={{
        background: getBackgroundColor(),
        color: getTextColor(),
        border: getBorder(),
        padding: '12px 24px',
        borderRadius: '4px',
        fontWeight: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        width: fullWidth ? '100%' : 'auto',
        ...style
      }}
    >
      {startIcon && <span>{startIcon}</span>}
      {children}
    </button>
  );
};

const TeslaTypography = ({ 
  variant = 'body1', 
  children, 
  color = 'inherit',
  style = {},
  gutterBottom = false
}) => {
  const getStyles = () => {
    let styles = { color, margin: 0, ...style };
    
    if (gutterBottom) {
      styles.marginBottom = '16px';
    }
    
    switch (variant) {
      case 'h1':
        return { ...styles, fontSize: '32px', fontWeight: 700, lineHeight: 1.2 };
      case 'h2':
        return { ...styles, fontSize: '28px', fontWeight: 600, lineHeight: 1.2 };
      case 'h3':
        return { ...styles, fontSize: '24px', fontWeight: 600, lineHeight: 1.3 };
      case 'h4':
        return { ...styles, fontSize: '20px', fontWeight: 600, lineHeight: 1.4 };
      case 'h5':
        return { ...styles, fontSize: '18px', fontWeight: 500, lineHeight: 1.4 };
      case 'h6':
        return { ...styles, fontSize: '16px', fontWeight: 500, lineHeight: 1.4 };
      case 'body1':
        return { ...styles, fontSize: '16px', fontWeight: 400, lineHeight: 1.5 };
      case 'body2':
        return { ...styles, fontSize: '14px', fontWeight: 400, lineHeight: 1.5 };
      case 'subtitle1':
        return { ...styles, fontSize: '16px', fontWeight: 500, lineHeight: 1.5, opacity: 0.9 };
      case 'subtitle2':
        return { ...styles, fontSize: '14px', fontWeight: 500, lineHeight: 1.5, opacity: 0.9 };
      default:
        return styles;
    }
  };

  return <div style={getStyles()}>{children}</div>;
};

const TeslaGrid = ({ children, container = false, item = false, xs = 12, gap = '24px', style = {} }) => {
  if (container) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap,
        width: '100%',
        ...style
      }}>
        {children}
      </div>
    );
  }
  
  if (item) {
    return (
      <div style={{
        gridColumn: `span ${xs}`,
        ...style
      }}>
        {children}
      </div>
    );
  }
  
  return <div style={style}>{children}</div>;
};

const TeslaChip = ({ label, size = 'small', color = 'default' }) => {
  const getBackgroundColor = () => {
    return color === 'primary' ? 'rgba(15, 23, 42, 0.1)' : 
           color === 'secondary' ? 'rgba(30, 58, 138, 0.1)' : 
           'rgba(100, 116, 139, 0.1)';
  };

  const getTextColor = () => {
    return color === 'primary' ? '#0f172a' : 
           color === 'secondary' ? '#1e40af' : 
           '#475569';
  };

  return (
    <span style={{
      backgroundColor: getBackgroundColor(),
      color: getTextColor(),
      padding: size === 'small' ? '4px 8px' : '6px 12px',
      borderRadius: '16px',
      fontSize: size === 'small' ? '12px' : '14px',
      fontWeight: 500,
      display: 'inline-flex',
      alignItems: 'center',
      margin: '2px',
      whiteSpace: 'nowrap'
    }}>
      {label}
    </span>
  );
};

const TeslaDivider = ({ style = {} }) => (
  <div style={{
    height: '1px',
    width: '100%',
    backgroundColor: '#e2e8f0',
    margin: '24px 0',
    ...style
  }} />
);

const TeslaModal = ({ open, onClose, children }) => {
  if (!open) return null;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '90%',
        maxHeight: '90%',
        overflow: 'auto'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
};

// Icons
const IconWrapper = ({ children, color = '#0f172a', size = 24 }) => (
  <div style={{ width: `${size}px`, height: `${size}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
    {children}
  </div>
);

const InfoIcon = (props) => (
  <IconWrapper {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="100%" height="100%">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </IconWrapper>
);

const GitHubIcon = (props) => (
  <IconWrapper {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" width="100%" height="100%">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  </IconWrapper>
);

const ZoomInIcon = (props) => (
  <IconWrapper {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="100%" height="100%">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
  </IconWrapper>
);

const DownloadIcon = (props) => (
  <IconWrapper {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="100%" height="100%">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  </IconWrapper>
);

const SaveIcon = (props) => (
  <IconWrapper {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="100%" height="100%">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  </IconWrapper>
);

const RefreshIcon = (props) => (
  <IconWrapper {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="100%" height="100%">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  </IconWrapper>
);

const ScienceIcon = (props) => (
  <IconWrapper {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="100%" height="100%">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  </IconWrapper>
);

const CloseIcon = (props) => (
  <IconWrapper {...props}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="100%" height="100%">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  </IconWrapper>
);

// Main Component
const AIAnalysis = () => {
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
      <TeslaContainer>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          gap: '24px'
        }}>
          <ScienceIcon size={80} color="#0f172a" />
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(15, 23, 42, 0.1)',
            borderTopColor: '#0f172a',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <TeslaTypography variant="h4" color="#0f172a" style={{ fontWeight: 500 }}>
            Processing AI Analysis...
          </TeslaTypography>
          <TeslaTypography variant="body1" color="#64748b">
            Analyzing {currentModality} scan of {currentBodyPart}
          </TeslaTypography>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </TeslaContainer>
    );
  }

  if (error) {
    return (
      <TeslaContainer>
        <TeslaCard elevation={3} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            backgroundColor: '#0f172a',
            color: 'white',
            padding: '28px',
            textAlign: 'center',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px'
          }}>
            <TeslaTypography variant="h3" style={{ fontWeight: 600, color: 'white' }}>
              Haske AI Analysis
            </TeslaTypography>
            {githubRepo && (
              <div style={{ marginTop: '16px' }}>
                <TeslaButton 
                  color="secondary"
                  startIcon={<GitHubIcon color="white" />}
                  onClick={() => window.open(githubRepo, '_blank')}
                  style={{ borderRadius: '24px', padding: '10px 20px' }}
                >
                  View Main Repository
                </TeslaButton>
              </div>
            )}
          </div>

          <div style={{ padding: '28px', flex: 1, overflow: 'auto' }}>
            <div style={{
              backgroundColor: '#fef2f2',
              padding: '20px',
              borderRadius: '8px',
              marginBottom: '24px',
              border: '1px solid #fee2e2'
            }}>
              <TeslaTypography variant="h5" color="#b91c1c" gutterBottom style={{ fontWeight: 600 }}>
                Analysis Not Available
              </TeslaTypography>
              <div style={{
                backgroundColor: '#fee2e2',
                padding: '16px',
                borderRadius: '4px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{ color: '#dc2626', flexShrink: 0 }}>⚠</div>
                <TeslaTypography variant="body1" color="#b91c1c">
                  {error}
                </TeslaTypography>
              </div>
              <TeslaTypography variant="body1" color="#64748b">
                We couldn't find a suitable AI model for {currentModality} scans of the {currentBodyPart}.
              </TeslaTypography>
            </div>
            
            {availableModels.length > 0 && (
              <>
                <TeslaDivider />
                <TeslaTypography variant="h4" gutterBottom style={{ fontWeight: 600, marginBottom: '24px' }}>
                  Available AI Models
                </TeslaTypography>
                
                <div style={{
                  width: '100%',
                  overflowX: 'auto',
                  padding: '8px 4px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#0f172a #f1f5f9'
                }}>
                  <div style={{ display: 'flex', gap: '20px', paddingBottom: '12px' }}>
                    {availableModels.map((model) => (
                      <TeslaCard 
                        key={model.id}
                        elevation={selectedModel?.id === model.id ? 3 : 1}
                        style={{ 
                          minWidth: '280px',
                          maxWidth: '320px',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          cursor: 'pointer',
                          border: selectedModel?.id === model.id ? '2px solid #0f172a' : '1px solid #e2e8f0',
                          transform: selectedModel?.id === model.id ? 'translateY(-4px)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                        onClick={() => setSelectedModel(model)}
                      >
                        <div style={{ padding: '20px' }}>
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '16px', 
                            marginBottom: '16px' 
                          }}>
                            <div style={{ 
                              backgroundColor: '#0f172a',
                              width: '48px',
                              height: '48px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white'
                            }}>
                              <ScienceIcon color="white" size={24} />
                            </div>
                            <TeslaTypography variant="h5" style={{ fontWeight: 600 }}>
                              {model.name}
                            </TeslaTypography>
                          </div>
                          <TeslaTypography variant="body1" color="#64748b" style={{ marginBottom: '20px' }}>
                            {model.description}
                          </TeslaTypography>
                          
                          <div style={{ marginBottom: '16px' }}>
                            <TeslaTypography variant="subtitle2" color="#64748b" gutterBottom>
                              Supported Modalities:
                            </TeslaTypography>
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '6px', 
                              marginTop: '6px' 
                            }}>
                              {model.modality?.map(m => (
                                <TeslaChip key={m} label={m} color="primary" />
                              ))}
                            </div>
                          </div>
                          
                          <div style={{ marginBottom: '16px' }}>
                            <TeslaTypography variant="subtitle2" color="#64748b" gutterBottom>
                              Supported Body Parts:
                            </TeslaTypography>
                            <div style={{ 
                              display: 'flex', 
                              flexWrap: 'wrap', 
                              gap: '6px', 
                              marginTop: '6px' 
                            }}>
                              {model.body_part?.map(b => (
                                <TeslaChip key={b} label={b} color="secondary" />
                              ))}
                            </div>
                          </div>
                          
                          {model.github_link && (
                            <TeslaButton 
                              variant="outlined"
                              startIcon={<GitHubIcon />}
                onClick={() => window.open(model.github_link, '_blank')}
                              style={{ borderRadius: '24px' }}
                            >
                              View Model Code
                            </TeslaButton>
                          )}
                        </div>
                      </TeslaCard>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </TeslaCard>

        <TeslaCard elevation={2} style={{ marginTop: '24px' }}>
          <div style={{ padding: '24px' }}>
            <TeslaTypography variant="h4" gutterBottom style={{ fontWeight: 600 }}>
              Study Details
            </TeslaTypography>
            
            <TeslaGrid container gap="24px">
              <TeslaGrid item xs={12} md={6}>
                <TeslaCard elevation={0} style={{ backgroundColor: '#f8fafc', padding: '24px' }}>
                  <TeslaTypography variant="subtitle1" color="#64748b" gutterBottom>
                    PATIENT INFORMATION
                  </TeslaTypography>
                  <TeslaTypography variant="body1" gutterBottom>
                    <strong>Name:</strong> {formatPatientName(patientDetails?.PatientName)}
                  </TeslaTypography>
                  <TeslaTypography variant="body1" gutterBottom>
                    <strong>ID:</strong> {patientDetails?.PatientID || 'N/A'}
                  </TeslaTypography>
                  <TeslaTypography variant="body1">
                    <strong>DOB:</strong> {formatDate(patientDetails?.PatientBirthDate)}
                  </TeslaTypography>
                </TeslaCard>
              </TeslaGrid>
              
              <TeslaGrid item xs={12} md={6}>
                <TeslaCard elevation={0} style={{ backgroundColor: '#f8fafc', padding: '24px' }}>
                  <TeslaTypography variant="subtitle1" color="#64748b" gutterBottom>
                    STUDY INFORMATION
                  </TeslaTypography>
                  <TeslaTypography variant="body1" gutterBottom>
                    <strong>Study Date:</strong> {formatDate(seriesDetails[0]?.StudyDate)}
                  </TeslaTypography>
                  <TeslaTypography variant="body1" gutterBottom>
                    <strong>Modality:</strong> {currentModality}
                  </TeslaTypography>
                  <TeslaTypography variant="body1">
                    <strong>Body Part:</strong> {currentBodyPart}
                  </TeslaTypography>
                </TeslaCard>
              </TeslaGrid>
            </TeslaGrid>
          </div>
        </TeslaCard>
      </TeslaContainer>
    );
  }

  // Successful analysis results view
  return (
    <TeslaContainer>
      <TeslaCard elevation={3} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          backgroundColor: '#0f172a',
          color: 'white',
          padding: '28px',
          textAlign: 'center',
          borderTopLeftRadius: '12px',
          borderTopRightRadius: '12px'
        }}>
          <TeslaTypography variant="h3" style={{ fontWeight: 600, color: 'white' }}>
            Haske AI Analysis Results
          </TeslaTypography>
          {githubRepo && (
            <div style={{ marginTop: '16px' }}>
              <TeslaButton 
                color="secondary"
                startIcon={<GitHubIcon color="white" />}
                onClick={() => window.open(githubRepo, '_blank')}
                style={{ borderRadius: '24px', padding: '10px 20px' }}
              >
                View Main Repository
              </TeslaButton>
            </div>
          )}
        </div>

        <div style={{ padding: '28px', flex: 1, overflow: 'auto' }}>
          <TeslaCard elevation={2} style={{ marginBottom: '32px' }}>
            <div style={{ padding: '24px' }}>
              <TeslaTypography variant="h4" gutterBottom style={{ fontWeight: 600 }}>
                Study Information
              </TeslaTypography>
              
              <TeslaGrid container gap="24px">
                <TeslaGrid item xs={12} md={6}>
                  <TeslaCard elevation={0} style={{ backgroundColor: '#f8fafc', padding: '24px' }}>
                    <TeslaTypography variant="subtitle1" color="#64748b" gutterBottom>
                      PATIENT INFORMATION
                    </TeslaTypography>
                    <TeslaTypography variant="body1" gutterBottom>
                      <strong>Name:</strong> {formatPatientName(patientDetails?.PatientName)}
                    </TeslaTypography>
                    <TeslaTypography variant="body1" gutterBottom>
                      <strong>ID:</strong> {patientDetails?.PatientID || 'N/A'}
                    </TeslaTypography>
                    <TeslaTypography variant="body1">
                      <strong>DOB:</strong> {formatDate(patientDetails?.PatientBirthDate)}
                    </TeslaTypography>
                  </TeslaCard>
                </TeslaGrid>
                
                <TeslaGrid item xs={12} md={6}>
                  <TeslaCard elevation={0} style={{ backgroundColor: '#f8fafc', padding: '24px' }}>
                    <TeslaTypography variant="subtitle1" color="#64748b" gutterBottom>
                      STUDY INFORMATION
                    </TeslaTypography>
                    <TeslaTypography variant="body1" gutterBottom>
                      <strong>Study Date:</strong> {formatDate(seriesDetails[0]?.StudyDate)}
                    </TeslaTypography>
                    <TeslaTypography variant="body1" gutterBottom>
                      <strong>Modality:</strong> {currentModality}
                    </TeslaTypography>
                    <TeslaTypography variant="body1">
                      <strong>Body Part:</strong> {currentBodyPart}
                    </TeslaTypography>
                  </TeslaCard>
                </TeslaGrid>
              </TeslaGrid>
            </div>
          </TeslaCard>

          <TeslaTypography variant="h4" gutterBottom style={{ fontWeight: 600, marginBottom: '24px' }}>
            Analysis Results
          </TeslaTypography>
          
          <TeslaGrid container gap="24px" style={{ marginBottom: '32px' }}>
            <TeslaGrid item xs={12} md={6}>
              <TeslaCard elevation={2} style={{ 
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }
              }}>
                <div style={{ padding: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <TeslaTypography variant="h5" style={{ fontWeight: 600 }}>
                      Original Image
                    </TeslaTypography>
                    <TeslaButton 
                      variant="text"
                      startIcon={<ZoomInIcon />}
                      onClick={() => setZoomedImage(`https://haske.online:8090/instances/${orthancId}/preview`)}
                      style={{ 
                        padding: '8px',
                        minWidth: 'auto',
                        borderRadius: '50%'
                      }}
                    />
                  </div>
                  <img
                    src={`https://haske.online:8090/instances/${orthancId}/preview`}
                    alt="Original DICOM"
                    style={{ 
                      width: '100%',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      ':hover': {
                        transform: 'scale(1.02)'
                      }
                    }}
                    onClick={() => setZoomedImage(`https://haske.online:8090/instances/${orthancId}/preview`)}
                  />
                </div>
              </TeslaCard>
            </TeslaGrid>
            
            {job?.results?.outputs?.map((output, index) => (
              <TeslaGrid item xs={12} md={6} key={index}>
                <TeslaCard elevation={2} style={{ 
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }
                }}>
                  <div style={{ padding: '16px' }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '16px'
                    }}>
                      <TeslaTypography variant="h5" style={{ fontWeight: 600 }}>
                        {output.label}
                      </TeslaTypography>
                      <TeslaButton 
                        variant="text"
                        startIcon={<ZoomInIcon />}
                        onClick={() => setZoomedImage(output.url)}
                        style={{ 
                          padding: '8px',
                          minWidth: 'auto',
                          borderRadius: '50%'
                        }}
                      />
                    </div>
                    <img
                      src={output.url}
                      alt={output.label}
                      style={{ 
                        width: '100%',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        ':hover': {
                          transform: 'scale(1.02)'
                        }
                      }}
                      onClick={() => setZoomedImage(output.url)}
                    />
                  </div>
                </TeslaCard>
              </TeslaGrid>
            ))}
          </TeslaGrid>

          {job?.results && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <TeslaButton 
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadResults}
                style={{ 
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  minWidth: '200px'
                }}
              >
                Download Results
              </TeslaButton>
              <TeslaButton 
                variant="outlined"
                color="primary"
                startIcon={<SaveIcon />}
                style={{ 
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  minWidth: '200px',
                  borderWidth: '2px'
                }}
              >
                Save to Orthanc
              </TeslaButton>
              <TeslaButton 
                variant="outlined"
                color="secondary"
                startIcon={<RefreshIcon />}
                onClick={handleProcessAnother}
                style={{ 
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  minWidth: '200px',
                  borderWidth: '2px'
                }}
              >
                Process Another
              </TeslaButton>
            </div>
          )}
        </div>
      </TeslaCard>

      <TeslaModal open={Boolean(zoomedImage)} onClose={() => setZoomedImage(null)}>
        <div style={{ position: 'relative' }}>
          <img 
            src={zoomedImage} 
            alt="Zoomed view" 
            style={{ 
              maxWidth: '80vw',
              maxHeight: '80vh',
              display: 'block',
              borderRadius: '8px'
            }}
          />
        </div>
      </TeslaModal>
    </TeslaContainer>
  );
};

export default AIAnalysis;
