import React, { useState, useEffect } from 'react';
import { Box, IconButton, Slider, Typography, Paper } from '@mui/material';
import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from '@mui/icons-material';

const VisualizationViewer = ({ originalImage, overlayImage }) => {
  const [zoom, setZoom] = useState(1);
  const [currentSlice, setCurrentSlice] = useState(0);
  const [view, setView] = useState('axial'); // 'axial', 'coronal', 'sagittal'

  // Mock data - in real implementation, these would come from props
  const [slices, setSlices] = useState({
    axial: { count: 30, current: 15 },
    coronal: { count: 25, current: 12 },
    sagittal: { count: 20, current: 10 }
  });

  const handleZoomChange = (event, newValue) => {
    setZoom(newValue);
  };

  const handleSliceChange = (event, newValue) => {
    setCurrentSlice(newValue);
    setSlices(prev => ({
      ...prev,
      [view]: { ...prev[view], current: newValue }
    }));
  };

  const changeView = (newView) => {
    setView(newView);
    setCurrentSlice(slices[newView].current);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: '#1e293b',
      borderRadius: 2,
      p: 2
    }}>
      {/* View Selector */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        {['axial', 'coronal', 'sagittal'].map(v => (
          <Typography
            key={v}
            variant="button"
            sx={{
              mx: 1,
              px: 2,
              py: 1,
              cursor: 'pointer',
              borderRadius: 1,
              backgroundColor: view === v ? '#dd841a' : '#334155',
              color: view === v ? 'white' : '#94a3b8',
              '&:hover': {
                backgroundColor: view === v ? '#f59e0b' : '#475569'
              }
            }}
            onClick={() => changeView(v)}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </Typography>
        ))}
      </Box>

      {/* Image Display */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Original Image */}
        <Box sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          borderRight: '1px solid #334155',
          position: 'relative'
        }}>
          <Box
            component="img"
            src={originalImage}
            alt="Original Scan"
            sx={{
              maxWidth: `${zoom * 100}%`,
              maxHeight: `${zoom * 100}%`,
              transition: 'all 0.3s ease',
              objectFit: 'contain'
            }}
          />
          <Typography 
            variant="caption" 
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              px: 1,
              borderRadius: 1
            }}
          >
            Original
          </Typography>
        </Box>
        
        {/* Overlay Image */}
        <Box sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}>
          <Box
            component="img"
            src={overlayImage}
            alt="Prediction Overlay"
            sx={{
              maxWidth: `${zoom * 100}%`,
              maxHeight: `${zoom * 100}%`,
              transition: 'all 0.3s ease',
              objectFit: 'contain'
            }}
          />
          <Typography 
            variant="caption" 
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              px: 1,
              borderRadius: 1
            }}
          >
            Prediction
          </Typography>
        </Box>
      </Box>

      {/* Controls */}
      <Box sx={{ mt: 2, px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ZoomOut sx={{ color: '#94a3b8', mr: 1 }} />
          <Slider
            value={zoom}
            onChange={handleZoomChange}
            min={0.5}
            max={3}
            step={0.1}
            sx={{ flex: 1, mx: 2 }}
          />
          <ZoomIn sx={{ color: '#94a3b8', ml: 1 }} />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ChevronLeft sx={{ color: '#94a3b8', mr: 1 }} />
          <Slider
            value={currentSlice}
            onChange={handleSliceChange}
            min={0}
            max={slices[view].count - 1}
            step={1}
            sx={{ flex: 1, mx: 2 }}
          />
          <ChevronRight sx={{ color: '#94a3b8', ml: 1 }} />
          <Typography variant="body2" sx={{ ml: 2, color: '#94a3b8' }}>
            Slice: {currentSlice + 1}/{slices[view].count}
          </Typography>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mt: 2,
        '& > *': { mx: 1 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            width: 16, 
            height: 16, 
            backgroundColor: 'red', 
            mr: 1 
          }} />
          <Typography variant="caption" color="#94a3b8">NCR</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            width: 16, 
            height: 16, 
            backgroundColor: 'green', 
            mr: 1 
          }} />
          <Typography variant="caption" color="#94a3b8">ED</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ 
            width: 16, 
            height: 16, 
            backgroundColor: 'blue', 
            mr: 1 
          }} />
          <Typography variant="caption" color="#94a3b8">ET</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default VisualizationViewer;
