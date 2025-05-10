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
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel
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
    totalCount: 0,
    totalPages: 1
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [newInstitution, setNewInstitution] = useState({
    name: '',
    address: '',
    contactEmail: '',
    contactPhone: ''
  });
  const [cacheStatus, setCacheStatus] = useState('');

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `https://haske.online:8090/api/institutions?page=${pagination.page}&pageSize=${pagination.pageSize}&search=${encodeURIComponent(searchTerm)}`
      );
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'Failed to fetch institutions');
      }
      
      setInstitutions(result.data.institutions);
      setPagination(prev => ({
        ...prev,
        totalCount: result.data.pagination.totalCount,
        totalPages: result.data.pagination.totalPages
      }));
      setCacheStatus(result.data.meta.cacheStatus);
      
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
      setError(error.message);
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [pagination.page, searchTerm]);

  const handlePageChange = (event, newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
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
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to add institution');
      }

      setSuccess('Institution added successfully!');
      setOpen(false);
      setNewInstitution({
        name: '',
        address: '',
        contactEmail: '',
        contactPhone: ''
      });
      fetchInstitutions();
    } catch (error) {
      console.error('Error adding institution:', error);
      setError(error.message);
    }
  };

  const handleScanInstitutions = async () => {
    try {
      const response = await fetch('https://haske.online:8090/api/institutions/scan', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to start scan');
      }

      setSuccess('Institution scan started successfully!');
    } catch (error) {
      console.error('Error scanning institutions:', error);
      setError(error.message);
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, gap: 2 }}>
        <TextField
          label="Search Institutions"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1 }}
        />
        <Button 
          variant="contained" 
          onClick={() => setOpen(true)}
        >
          Add New Institution
        </Button>
        <Button
          variant="outlined"
          onClick={handleScanInstitutions}
          disabled={cacheStatus === 'initializing'}
        >
          Scan DICOM Institutions
        </Button>
      </Box>

      {cacheStatus && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {cacheStatus === 'current' 
            ? `Institutions up to date (last scanned: ${new Date(INSTITUTIONS_CACHE.lastUpdated).toLocaleString()})`
            : 'Initializing institution data...'}
        </Alert>
      )}

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
                  <TableCell>Source</TableCell>
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
                      <TableCell>{institution.source || 'manual'}</TableCell>
                      <TableCell>{institution.address}</TableCell>
                      <TableCell>{institution.contactEmail}</TableCell>
                      <TableCell>{institution.contactPhone}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
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
                count={pagination.totalPages}
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
            disabled={!newInstitution.name}
          >
            Add Institution
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
