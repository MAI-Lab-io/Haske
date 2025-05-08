// src/pages/admin/Models.js
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  IconButton
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import axios from 'axios';

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
    entry_point: ''
  });
  const [tempModality, setTempModality] = useState('');
  const [tempBodyPart, setTempBodyPart] = useState('');

  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      const { data } = await axios.get('https://haske.online:8090/api/ai/models');
      setModels(data);
    } catch (err) {
      console.error('Error fetching models:', err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (currentModel) {
        await axios.put(`https://haske.online:8090/api/ai/models/${currentModel.id}`, formData);
      } else {
        await axios.post('https://haske.online:8090/api/ai/models', formData);
      }
      fetchModels();
      setOpenDialog(false);
    } catch (err) {
      console.error('Error saving model:', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://haske.online:8090/api/ai/models/${id}`);
      fetchModels();
    } catch (err) {
      console.error('Error deleting model:', err);
    }
  };

  const addModality = () => {
    if (tempModality && !formData.modality.includes(tempModality)) {
      setFormData({
        ...formData,
        modality: [...formData.modality, tempModality]
      });
      setTempModality('');
    }
  };

  const removeModality = (modality) => {
    setFormData({
      ...formData,
      modality: formData.modality.filter(m => m !== modality)
    });
  };

  const addBodyPart = () => {
    if (tempBodyPart && !formData.body_part.includes(tempBodyPart)) {
      setFormData({
        ...formData,
        body_part: [...formData.body_part, tempBodyPart]
      });
      setTempBodyPart('');
    }
  };

  const removeBodyPart = (bodyPart) => {
    setFormData({
      ...formData,
      body_part: formData.body_part.filter(b => b !== bodyPart)
    });
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
              entry_point: ''
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.id}>
                <TableCell>{model.name}</TableCell>
                <TableCell>{model.description}</TableCell>
                <TableCell>
                  {model.modality.map(m => (
                    <Chip key={m} label={m} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </TableCell>
                <TableCell>
                  {model.body_part.map(b => (
                    <Chip key={b} label={b} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </TableCell>
                <TableCell>{model.docker_image}</TableCell>
                <TableCell>
                  <IconButton onClick={() => {
                    setCurrentModel(model);
                    setFormData({
                      name: model.name,
                      description: model.description,
                      modality: model.modality,
                      body_part: model.body_part,
                      docker_image: model.docker_image,
                      entry_point: model.entry_point
                    });
                    setOpenDialog(true);
                  }}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(model.id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="md">
        <DialogTitle>{currentModel ? 'Edit Model' : 'Add New Model'}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <TextField
              label="Model Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              sx={{ mb: 2 }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              sx={{ mb: 2 }}
            />
            <Box mb={2}>
              <Typography variant="subtitle1">Supported Modalities</Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <TextField
                  size="small"
                  value={tempModality}
                  onChange={(e) => setTempModality(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addModality()}
                />
                <Button onClick={addModality} sx={{ ml: 1 }}>Add</Button>
              </Box>
              <Box>
                {formData.modality.map(m => (
                  <Chip 
                    key={m} 
                    label={m} 
                    onDelete={() => removeModality(m)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            </Box>
            <Box mb={2}>
              <Typography variant="subtitle1">Supported Body Parts</Typography>
              <Box display="flex" alignItems="center" mb={1}>
                <TextField
                  size="small"
                  value={tempBodyPart}
                  onChange={(e) => setTempBodyPart(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addBodyPart()}
                />
                <Button onClick={addBodyPart} sx={{ ml: 1 }}>Add</Button>
              </Box>
              <Box>
                {formData.body_part.map(b => (
                  <Chip 
                    key={b} 
                    label={b} 
                    onDelete={() => removeBodyPart(b)}
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
              sx={{ mb: 2 }}
            />
            <TextField
              label="Entry Point Command"
              fullWidth
              value={formData.entry_point}
              onChange={(e) => setFormData({...formData, entry_point: e.target.value})}
              placeholder="e.g., python predict.py"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {currentModel ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Models;
