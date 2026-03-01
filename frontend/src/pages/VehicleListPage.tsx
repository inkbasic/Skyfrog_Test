import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Tooltip,
  InputAdornment,
  Alert,
  TableSortLabel,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import { vehicleApi, type VehicleDto, type VehicleQueryParams } from '../api/vehicleApi';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';

const statusOptions = ['', 'Available', 'InUse', 'Maintenance', 'Retired'];
const sortableColumns = ['licensePlate', 'brand', 'model', 'year', 'status', 'createdAt'];

export default function VehicleListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  // State
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters from URL
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(Number(searchParams.get('page') || '0'));
  const [pageSize, setPageSize] = useState(Number(searchParams.get('pageSize') || '10'));
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    (searchParams.get('sortDirection') as 'asc' | 'desc') || 'desc'
  );

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params: VehicleQueryParams = {
        page: page + 1, // API is 1-based
        pageSize,
        sortBy,
        sortDirection,
      };
      if (search.trim()) params.search = search.trim();
      if (status) params.status = status;

      const res = await vehicleApi.getAll(params);
      setVehicles(res.data.items);
      setTotalCount(res.data.totalCount);
    } catch {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortDirection, search, status]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Sync URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (page > 0) params.page = String(page);
    if (pageSize !== 10) params.pageSize = String(pageSize);
    if (sortBy !== 'id') params.sortBy = sortBy;
    if (sortDirection !== 'desc') params.sortDirection = sortDirection;
    setSearchParams(params, { replace: true });
  }, [search, status, page, pageSize, sortBy, sortDirection, setSearchParams]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
    setPage(0);
  };

  const handleDelete = async (vehicle: VehicleDto) => {
    const result = await Swal.fire({
      title: 'Delete Vehicle',
      html: `Are you sure you want to delete <strong>${vehicle.brand} ${vehicle.model}</strong> (${vehicle.licensePlate})?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#9e9e9e',
      confirmButtonText: 'Yes, delete it',
    });

    if (result.isConfirmed) {
      try {
        await vehicleApi.delete(vehicle.id);
        Swal.fire({
          title: 'Deleted!',
          text: 'Vehicle has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        fetchVehicles();
      } catch {
        Swal.fire('Error', 'Failed to delete vehicle.', 'error');
      }
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setPage(0);
    setSortBy('id');
    setSortDirection('desc');
  };

  const hasFilters = search || status || sortBy !== 'id' || sortDirection !== 'desc';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Vehicles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalCount} vehicle{totalCount !== 1 ? 's' : ''} found
          </Typography>
        </Box>
        {isAuthenticated && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/vehicles/create')}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Add Vehicle
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search plate, brand, model..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ minWidth: 250, flexGrow: 1, maxWidth: 400 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
            >
              <MenuItem value="">All Status</MenuItem>
              {statusOptions.filter(Boolean).map((s) => (
                <MenuItem key={s} value={s}>
                  <Chip
                    label={s === 'InUse' ? 'In Use' : s}
                    size="small"
                    color={
                      s === 'Available' ? 'success' :
                      s === 'InUse' ? 'info' :
                      s === 'Maintenance' ? 'warning' : 'default'
                    }
                    variant="filled"
                    sx={{ cursor: 'pointer' }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {hasFilters && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              sx={{ textTransform: 'none' }}
            >
              Clear filters
            </Button>
          )}
        </Box>
      </Paper>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Loading vehicles..." />
      ) : vehicles.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No vehicles found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hasFilters ? 'Try adjusting your filters' : 'Get started by adding a vehicle'}
          </Typography>
          {isAuthenticated && !hasFilters && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/vehicles/create')}
              sx={{ mt: 2, textTransform: 'none' }}
            >
              Add Vehicle
            </Button>
          )}
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                  <TableCell sx={{ fontWeight: 600, width: 60 }}>#</TableCell>
                  {[
                    { id: 'licensePlate', label: 'License Plate' },
                    { id: 'brand', label: 'Brand' },
                    { id: 'model', label: 'Model' },
                    { id: 'year', label: 'Year' },
                    { id: 'status', label: 'Status' },
                    { id: 'createdAt', label: 'Created' },
                  ].map((col) => (
                    <TableCell key={col.id} sx={{ fontWeight: 600 }}>
                      {sortableColumns.includes(col.id) ? (
                        <TableSortLabel
                          active={sortBy === col.id}
                          direction={sortBy === col.id ? sortDirection : 'asc'}
                          onClick={() => handleSort(col.id)}
                        >
                          {col.label}
                        </TableSortLabel>
                      ) : (
                        col.label
                      )}
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 600, width: 130 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.map((v, index) => (
                  <TableRow
                    key={v.id}
                    hover
                    sx={{ cursor: 'pointer', '&:last-child td': { border: 0 } }}
                    onClick={() => navigate(`/vehicles/${v.id}`)}
                  >
                    <TableCell>{page * pageSize + index + 1}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {v.licensePlate}
                      </Typography>
                    </TableCell>
                    <TableCell>{v.brand}</TableCell>
                    <TableCell>{v.model}</TableCell>
                    <TableCell>{v.year}</TableCell>
                    <TableCell>
                      <StatusBadge status={v.status} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/vehicles/${v.id}`)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isAuthenticated && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => navigate(`/vehicles/${v.id}/edit`)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(v)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </>
      )}
    </Box>
  );
}
