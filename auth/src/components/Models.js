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
import { logAction } from '../utils/analytics'; // Add this import
import { useUser } from '../context/UserContext'; // Import your user context

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

  const { currentUser } = useUser(); // Get current user from context

  useEffect(() => {
    fetchModels();
    // Track initial page view
    logAction('Models Page View', { page: 'Models Management' }, currentUser);
  }, [currentUser]);

  const fetchModels = async () => {
    try {
      const { data } = await axios.get('https://haske.online:8090/api/ai/models');
      setModels(data);
      // Track successful model fetch
      logAction('Models Fetched', { count: data.length }, currentUser);
    } catch (err) {
      showSnackbar('Error fetching models', 'error');
      // Track failed fetch
      logAction('Models Fetch Failed', { error: err.message }, currentUser);
    }
  };

  const handleSubmit = async () => {
    try {
      if (currentModel) {
        await axios.put(`https://haske.online:8090/api/ai/models/${currentModel.id}`, formData);
        showSnackbar('Model updated successfully', 'success');
        // Track model update
        logAction('Model Updated', { 
          modelId: currentModel.id,
          modelName: formData.name,
          changes: formData 
        }, currentUser);
      } else {
        const response = await axios.post('https://haske.online:8090/api/ai/models', formData);
        showSnackbar('Model created successfully', 'success');
        // Track model creation
        logAction('Model Created', { 
          modelId: response.data.id,
          modelName: formData.name 
        }, currentUser);
      }
      fetchModels();
      setOpenDialog(false);
    } catch (err) {
      showSnackbar('Error saving model', 'error');
      // Track failed save
      logAction('Model Save Failed', { 
        action: currentModel ? 'update' : 'create',
        error: err.message 
      }, currentUser);
    }
  };

  const handleDelete = async (id) => {
    try {
      const modelToDelete = models.find(m => m.id === id);
      await axios.delete(`https://haske.online:8090/api/ai/models/${id}`);
      showSnackbar('Model deleted successfully', 'success');
      fetchModels();
      // Track model deletion
      logAction('Model Deleted', { 
        modelId: id,
        modelName: modelToDelete?.name 
      }, currentUser);
    } catch (err) {
      showSnackbar('Error deleting model', 'error');
      // Track failed deletion
      logAction('Model Delete Failed', { 
        modelId: id,
        error: err.message 
      }, currentUser);
    }
  };

  // ... rest of your existing functions remain the same ...

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
              is_active: true,
              github_link: ''
            });
            setOpenDialog(true);
            // Track "Add Model" button click
            logAction('Add Model Clicked', {}, currentUser);
          }}
        >
          Add Model
        </Button>
      </Box>

      {/* ... rest of your JSX remains the same ... */}

      <Dialog open={openDialog} onClose={() => {
        setOpenDialog(false);
        // Track dialog close
        logAction('Model Dialog Closed', { action: currentModel ? 'edit' : 'add' }, currentUser);
      }} fullWidth maxWidth="md">
        {/* ... dialog content remains the same ... */}
      </Dialog>

      {/* ... snackbar and other components remain the same ... */}
    </Box>
  );
};

export default Models;
