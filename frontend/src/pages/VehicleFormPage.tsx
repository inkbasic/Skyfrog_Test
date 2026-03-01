import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  Autocomplete,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { vehicleApi, type VehicleDto } from '../api/vehicleApi';
import { getImageUrl } from '../api/axiosInstance';
import ImageUpload from '../components/ImageUpload';
import LoadingSpinner from '../components/LoadingSpinner';
import Swal from 'sweetalert2';
import axios from 'axios';
import {
  BRAND_OPTIONS,
  MODEL_OPTIONS,
  COLOR_OPTIONS,
  ENGINE_TYPE_OPTIONS,
  FUEL_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from '../constants/vehicleData';

export default function VehicleFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  // Form state
  const [licensePlate, setLicensePlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [color, setColor] = useState('');
  const [vinNumber, setVinNumber] = useState('');
  const [engineType, setEngineType] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [mileage, setMileage] = useState<string>('');
  const [status, setStatus] = useState('Available');
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | undefined>();

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Model options based on selected brand
  const modelOptions = useMemo(() => {
    if (!brand) return [];
    // Check if the typed brand matches a key (case-insensitive)
    const key = [...BRAND_OPTIONS].find((b) => b.toLowerCase() === brand.toLowerCase());
    return key ? MODEL_OPTIONS[key] || [] : [];
  }, [brand]);

  // Load existing vehicle for edit
  useEffect(() => {
    if (!isEdit) return;
    const fetchVehicle = async () => {
      try {
        const res = await vehicleApi.getById(Number(id));
        const v: VehicleDto = res.data;
        setLicensePlate(v.licensePlate);
        setBrand(v.brand);
        setModel(v.model);
        setYear(v.year);
        setColor(v.color || '');
        setVinNumber(v.vinNumber || '');
        setEngineType(v.engineType || '');
        setFuelType(v.fuelType || '');
        setMileage(v.mileage != null ? String(v.mileage) : '');
        setStatus(v.status);
        setNotes(v.notes || '');
        setCurrentImageUrl(getImageUrl(v.imageUrl));
      } catch {
        setSubmitError('Vehicle not found');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [id, isEdit]);

  // Reset model when brand changes (only on create)
  useEffect(() => {
    if (!isEdit) {
      setModel('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand]);

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!licensePlate.trim()) {
      errs.licensePlate = 'License plate is required';
    } else if (licensePlate.trim().length > 20) {
      errs.licensePlate = 'Max 20 characters';
    }

    if (!brand.trim()) {
      errs.brand = 'Brand is required';
    } else if (brand.trim().length > 50) {
      errs.brand = 'Max 50 characters';
    }

    if (!model.trim()) {
      errs.model = 'Model is required';
    } else if (model.trim().length > 50) {
      errs.model = 'Max 50 characters';
    }

    if (!year || year < 1900 || year > new Date().getFullYear() + 2) {
      errs.year = `Year must be between 1900 and ${new Date().getFullYear() + 2}`;
    }

    if (color.trim().length > 20) {
      errs.color = 'Max 20 characters';
    }

    if (vinNumber.trim() && vinNumber.trim().length > 17) {
      errs.vinNumber = 'VIN must be max 17 characters';
    }

    if (fuelType.trim().length > 30) {
      errs.fuelType = 'Max 30 characters';
    }

    if (mileage && (isNaN(Number(mileage)) || Number(mileage) < 0)) {
      errs.mileage = 'Mileage must be a positive number';
    } else if (mileage && Number(mileage) > 9999999) {
      errs.mileage = 'Mileage seems too high';
    }

    if (notes.trim().length > 500) {
      errs.notes = 'Max 500 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) return;

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('licensePlate', licensePlate.trim());
      formData.append('brand', brand.trim());
      formData.append('model', model.trim());
      formData.append('year', String(year));
      formData.append('status', status);

      if (color.trim()) formData.append('color', color.trim());
      if (vinNumber.trim()) formData.append('vinNumber', vinNumber.trim());
      if (engineType) formData.append('engineType', engineType);
      if (fuelType.trim()) formData.append('fuelType', fuelType.trim());
      if (mileage) formData.append('mileage', mileage);
      if (notes.trim()) formData.append('notes', notes.trim());
      if (imageFile) formData.append('image', imageFile);

      if (isEdit) {
        await vehicleApi.update(Number(id), formData);
        Swal.fire({
          title: 'Updated!',
          text: 'Vehicle has been updated successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(`/vehicles/${id}`, { replace: true });
      } else {
        const res = await vehicleApi.create(formData);
        Swal.fire({
          title: 'Created!',
          text: 'Vehicle has been created successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(`/vehicles/${res.data.id}`, { replace: true });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data?.message || err.response?.data?.title || 'Failed to save vehicle';
        setSubmitError(msg);
      } else {
        setSubmitError('An unexpected error occurred');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading vehicle data..." />;

  return (
    <Box>
      {/* Back button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(isEdit ? `/vehicles/${id}` : '/vehicles')}
        sx={{ mb: 2, textTransform: 'none' }}
      >
        {isEdit ? 'Back to Vehicle' : 'Back to Vehicles'}
      </Button>

      <Card sx={{ maxWidth: 800, mx: 'auto', boxShadow: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {isEdit ? 'Update vehicle information' : 'Fill in the vehicle details'}
          </Typography>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Image Upload */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Vehicle Image
            </Typography>
            <ImageUpload
              currentImageUrl={currentImageUrl}
              onFileSelect={setImageFile}
            />

            <Divider sx={{ my: 3 }} />

            {/* === Basic Information === */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Basic Information *
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
              {/* License Plate */}
              <TextField
                label="License Plate *"
                value={licensePlate}
                onChange={(e) => { setLicensePlate(e.target.value); setErrors((p) => ({ ...p, licensePlate: '' })); }}
                error={!!errors.licensePlate}
                helperText={errors.licensePlate}
                fullWidth
                inputProps={{ maxLength: 20 }}
                placeholder="e.g. กข-1234"
              />

              {/* Brand */}
              <Autocomplete
                freeSolo
                options={[...BRAND_OPTIONS]}
                value={brand}
                onChange={(_, newValue) => {
                  setBrand(newValue || '');
                  setErrors((p) => ({ ...p, brand: '' }));
                }}
                onInputChange={(_, inputValue, reason) => {
                  if (reason === 'input') {
                    setBrand(inputValue);
                    setErrors((p) => ({ ...p, brand: '' }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Brand *"
                    error={!!errors.brand}
                    helperText={errors.brand}
                    placeholder="Select or type brand"
                    inputProps={{ ...params.inputProps, maxLength: 50 }}
                  />
                )}
              />

              {/* Model */}
              <Autocomplete
                freeSolo
                options={modelOptions}
                value={model}
                onChange={(_, newValue) => {
                  setModel(newValue || '');
                  setErrors((p) => ({ ...p, model: '' }));
                }}
                onInputChange={(_, inputValue, reason) => {
                  if (reason === 'input') {
                    setModel(inputValue);
                    setErrors((p) => ({ ...p, model: '' }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Model *"
                    error={!!errors.model}
                    helperText={errors.model || (!brand ? 'Select brand first for suggestions' : '')}
                    placeholder="Select or type model"
                    inputProps={{ ...params.inputProps, maxLength: 50 }}
                  />
                )}
              />

              {/* Year */}
              <TextField
                label="Year *"
                type="number"
                value={year}
                onChange={(e) => { setYear(Number(e.target.value)); setErrors((p) => ({ ...p, year: '' })); }}
                error={!!errors.year}
                helperText={errors.year}
                fullWidth
                inputProps={{ min: 1900, max: new Date().getFullYear() + 2 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* === Additional Details === */}
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Additional Details
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
              {/* Color */}
              <Autocomplete
                freeSolo
                options={[...COLOR_OPTIONS]}
                value={color}
                onChange={(_, newValue) => {
                  setColor(newValue || '');
                  setErrors((p) => ({ ...p, color: '' }));
                }}
                onInputChange={(_, inputValue, reason) => {
                  if (reason === 'input') {
                    setColor(inputValue);
                    setErrors((p) => ({ ...p, color: '' }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Color"
                    error={!!errors.color}
                    helperText={errors.color}
                    placeholder="Select or type color"
                    inputProps={{ ...params.inputProps, maxLength: 20 }}
                  />
                )}
              />

              {/* VIN Number */}
              <TextField
                label="VIN Number"
                value={vinNumber}
                onChange={(e) => { setVinNumber(e.target.value.toUpperCase()); setErrors((p) => ({ ...p, vinNumber: '' })); }}
                error={!!errors.vinNumber}
                helperText={errors.vinNumber}
                fullWidth
                inputProps={{ maxLength: 17 }}
                placeholder="e.g. 1HGCM82633A004352"
              />

              {/* Engine Type */}
              <Autocomplete
                freeSolo
                options={[...ENGINE_TYPE_OPTIONS]}
                value={engineType}
                onChange={(_, newValue) => setEngineType(newValue || '')}
                onInputChange={(_, inputValue, reason) => {
                  if (reason === 'input') setEngineType(inputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Engine Type"
                    placeholder="Select or type"
                    inputProps={{ ...params.inputProps, maxLength: 20 }}
                  />
                )}
              />

              {/* Fuel Type */}
              <Autocomplete
                freeSolo
                options={[...FUEL_TYPE_OPTIONS]}
                value={fuelType}
                onChange={(_, newValue) => {
                  setFuelType(newValue || '');
                  setErrors((p) => ({ ...p, fuelType: '' }));
                }}
                onInputChange={(_, inputValue, reason) => {
                  if (reason === 'input') {
                    setFuelType(inputValue);
                    setErrors((p) => ({ ...p, fuelType: '' }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Fuel Type"
                    error={!!errors.fuelType}
                    helperText={errors.fuelType}
                    placeholder="Select or type"
                    inputProps={{ ...params.inputProps, maxLength: 30 }}
                  />
                )}
              />

              {/* Mileage */}
              <TextField
                label="Mileage (km)"
                type="number"
                value={mileage}
                onChange={(e) => { setMileage(e.target.value); setErrors((p) => ({ ...p, mileage: '' })); }}
                error={!!errors.mileage}
                helperText={errors.mileage}
                fullWidth
                inputProps={{ min: 0, max: 9999999 }}
              />

              {/* Status */}
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Notes */}
            <TextField
              label="Notes"
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setErrors((p) => ({ ...p, notes: '' })); }}
              error={!!errors.notes}
              helperText={errors.notes || `${notes.length}/500`}
              fullWidth
              multiline
              rows={3}
              inputProps={{ maxLength: 500 }}
              sx={{ mb: 3 }}
            />

            {/* Submit */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate(isEdit ? `/vehicles/${id}` : '/vehicles')}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={<SaveIcon />}
                sx={{ textTransform: 'none', px: 4 }}
              >
                {saving ? 'Saving...' : isEdit ? 'Update Vehicle' : 'Create Vehicle'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
