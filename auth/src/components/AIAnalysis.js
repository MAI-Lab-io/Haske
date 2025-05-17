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
