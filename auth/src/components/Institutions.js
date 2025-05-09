// src/admin/Institutions.js
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
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';

const Institutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [open, setOpen] = useState(false);
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    address: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await fetch('https://haske.online:8090/api/institutions');
      const data = await response.json();
      setInstitutions(data);
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInstitution(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('https://haske.online:8090/api/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInstitution)
      });
      
      if (response.ok) {
        setOpen(false);
        setNewInstitution({
          name: '',
          address: '',
          contactEmail: '',
          contactPhone: ''
        });
        fetchInstitutions();
      }
    } catch (error) {
      console.error('Error adding institution:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Institutions
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={() => setOpen(true)}
        sx={{ mb: 3 }}
      >
        Add New Institution
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Contact Email</TableCell>
              <TableCell>Contact Phone</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {institutions.map((institution) => (
              <TableRow key={institution.id}>
                <TableCell>{institution.id}</TableCell>
                <TableCell>{institution.name}</TableCell>
                <TableCell>{institution.address}</TableCell>
                <TableCell>{institution.contactEmail}</TableCell>
                <TableCell>{institution.contactPhone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Institution</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Institution Name"
            fullWidth
            value={newInstitution.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="address"
            label="Address"
            fullWidth
            value={newInstitution.address}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="contactEmail"
            label="Contact Email"
            fullWidth
            value={newInstitution.contactEmail}
            onChange={handleInputChange}
          />
          <TextField
            margin="dense"
            name="contactPhone"
            label="Contact Phone"
            fullWidth
            value={newInstitution.contactPhone}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Institutions;
