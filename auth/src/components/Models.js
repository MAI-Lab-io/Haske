import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, IconButton,
  Snackbar, Alert
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import axios from 'axios';
import GitHubIcon from '@mui/icons-material/GitHub';

const Models = () => {
  const [models, setModels] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentModel, setCurrentModel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modality: [],
    body_part: [],
    docker_image: '',
    entry_point: '',
    is_active: true,
    github_link: ''
  });
  const [tempModality, setTempModality] = useState('');
  const [tempBodyPart, setTempBodyPart] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const { data } = await axios.get('https://haske.online:8090/api/ai/models');
      setModels(data);
    } catch (err) {
      showSnackbar('Error fetching models', 'error');
    }
  };

  const handleSubmit = async () => {
    try {
      if (currentModel) {
        await axios.put(`https://haske.online:8090/api/ai/models/${currentModel.id}`, formData);
        showSnackbar('Model updated successfully', 'success');
      } else {
        await axios.post('https://haske.online:8090/api/ai/models', formData);
        showSnackbar('Model created successfully', 'success');
      }
      fetchModels();
      setOpenDialog(false);
    } catch (err) {
      showSnackbar('Error saving model', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://haske.online:8090/api/ai/models/${id}`);
      showSnackbar('Model deleted successfully', 'success');
      fetchModels();
    } catch (err) {
      showSnackbar('Error deleting model', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Helper functions for managing arrays in form data
  const addToArray = (field, value, setTempValue) => {
    if (value && !formData[field].includes(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value]
      }));
      setTempValue('');
    }
  };

  const removeFromArray = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter(item => item !== value)
    }));
  };

  return (
    <Box p={4}>
      <Box display="flex" justifyContent="space-between" mb={4}>
        <Typography variant="h4">AI Model Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => {
            setCurrentModel(null);
            setFormData({
              name: '',
              description: '',
              modality: [],
              body_part: [],
              docker_image: '',
              entry_point: '',
              is_active: true
            });
            setOpenDialog(true);
          }}
        >
          Add Model
        </Button>
      </Box>

     <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Modalities</TableCell>
              <TableCell>Body Parts</TableCell>
              <TableCell>Docker Image</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
              <TableCell>GitHub</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.id}>
                <TableCell>{model.name}</TableCell>
                <TableCell>{model.description}</TableCell>
                <TableCell>
                  {model.modality?.map(m => (
                    <Chip key={m} label={m} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </TableCell>
                <TableCell>
                  {model.body_part?.map(b => (
                    <Chip key={b} label={b} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </TableCell>
                <TableCell>{model.docker_image}</TableCell>
                <TableCell>
                  <Chip 
                    label={model.is_active ? 'Active' : 'Inactive'} 
                    color={model.is_active ? 'success' : 'error'} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => {
                    setCurrentModel(model);
                    setFormData({
                      name: model.name,
                      description: model.description,
                      modality: model.modality || [],
                      body_part: model.body_part || [],
                      docker_image: model.docker_image,
                      entry_point: model.entry_point,
                      is_active: model.is_active,
                      github_link: model.github_link || ''
                    });
                    setOpenDialog(true);
                  }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(model.id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
                <TableCell>
                  {model.github_link && (
                    <IconButton 
                      href={model.github_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <GitHubIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>{currentModel ? 'Edit Model' : 'Add New Model'}</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={3}>
            <TextField
              label="Model Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
            <TextField
              label="GitHub Repository Link"
              fullWidth
              value={formData.github_link}
              onChange={(e) => setFormData({...formData, github_link: e.target.value})}
              placeholder="https://github.com/Heartz00/mailabhaske"
              sx={{ mb: 2 }}
            />
                        
            <Box>
              <Typography variant="subtitle1" gutterBottom>Supported Modalities</Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  size="small"
                  value={tempModality}
                  onChange={(e) => setTempModality(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToArray('modality', tempModality, setTempModality)}
                  placeholder="Add modality (e.g., CT, MRI)"
                  fullWidth
                />
                <Button onClick={() => addToArray('modality', tempModality, setTempModality)}>Add</Button>
              </Box>
              <Box>
                {formData.modality.map(m => (
                  <Chip 
                    key={m} 
                    label={m} 
                    onDelete={() => removeFromArray('modality', m)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
            
            <Box>
              <Typography variant="subtitle1" gutterBottom>Supported Body Parts</Typography>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TextField
                  size="small"
                  value={tempBodyPart}
                  onChange={(e) => setTempBodyPart(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addToArray('body_part', tempBodyPart, setTempBodyPart)}
                  placeholder="Add body part (e.g., HEAD, CHEST)"
                  fullWidth
                />
                <Button onClick={() => addToArray('body_part', tempBodyPart, setTempBodyPart)}>Add</Button>
              </Box>
              <Box>
                {formData.body_part.map(b => (
                  <Chip 
                    key={b} 
                    label={b} 
                    onDelete={() => removeFromArray('body_part', b)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
            
            <TextField
              label="Docker Image"
              fullWidth
              value={formData.docker_image}
              onChange={(e) => setFormData({...formData, docker_image: e.target.value})}
              placeholder="e.g., username/repo:tag"
            />
            
            <TextField
              label="Entry Point Command"
              fullWidth
              value={formData.entry_point}
              onChange={(e) => setFormData({...formData, entry_point: e.target.value})}
              placeholder="e.g., python predict.py"
            />
            
            {currentModel && (
              <Box display="flex" alignItems="center">
                <Typography variant="body1" sx={{ mr: 2 }}>Status:</Typography>
                <Button
                  variant={formData.is_active ? "contained" : "outlined"}
                  color={formData.is_active ? "success" : "error"}
                  onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                >
                  {formData.is_active ? 'Active' : 'Inactive'}
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {currentModel ? 'Update Model' : 'Create Model'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Models;
