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
  DialogTitle,
  CircularProgress,
  Pagination,
  Alert,
  Snackbar
} from '@mui/material';

const Institutions = () => {
  const [institutions, setInstitutions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    address: '',
    contactEmail: '',
    contactPhone: ''
  });

  useEffect(() => {
    fetchInstitutions();
  }, [pagination.page, searchTerm]);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.haske.online/api/institutions?page=${pagination.page}&pageSize=${pagination.pageSize}&search=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setInstitutions(data.institutions);
      setPagination(prev => ({
        ...prev,
        totalCount: data.totalCount,
        totalPages: Math.ceil(data.totalCount / prev.pageSize)
      }));
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
      setError('Failed to load institutions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInstitution(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('https://api.haske.online/api/institutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInstitution)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSuccess('Institution added successfully!');
      setOpen(false);
      setNewInstitution({
        name: '',
        address: '',
        contactEmail: '',
        contactPhone: ''
      });
      fetchInstitutions(); // Refresh the list
    } catch (error) {
      console.error('Error adding institution:', error);
      setError('Failed to add institution. Please try again.');
    }
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Manage Institutions
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          label="Search Institutions"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ width: 300 }}
        />
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)}
        >
          Add New Institution
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
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
                {institutions.length > 0 ? (
                  institutions.map((institution) => (
                    <TableRow key={institution.id}>
                      <TableCell>{institution.id}</TableCell>
                      <TableCell>{institution.name}</TableCell>
                      <TableCell>{institution.address}</TableCell>
                      <TableCell>{institution.contactEmail}</TableCell>
                      <TableCell>{institution.contactPhone}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No institutions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {pagination.totalCount > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={Math.ceil(pagination.totalCount / pagination.pageSize)}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
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
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="address"
            label="Address"
            fullWidth
            value={newInstitution.address}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="contactEmail"
            label="Contact Email"
            fullWidth
            value={newInstitution.contactEmail}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
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
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!newInstitution.name} // Require at least a name
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Institutions;
