import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
	Box,
	Typography,
	Card,
	CardContent,
	Button,
	Divider,
	Alert,
	Chip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { vehicleApi, type VehicleDto } from '../api/vehicleApi';
import { getImageUrl } from '../api/axiosInstance';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import Swal from 'sweetalert2';

export default function VehicleDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	const [vehicle, setVehicle] = useState<VehicleDto | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchVehicle = async () => {
			try {
				const res = await vehicleApi.getById(Number(id));
				setVehicle(res.data);
			} catch {
				setError('Vehicle not found');
			} finally {
				setLoading(false);
			}
		};
		fetchVehicle();
	}, [id]);

	const handleDelete = async () => {
		if (!vehicle) return;
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
				navigate('/vehicles', { replace: true });
			} catch {
				Swal.fire('Error', 'Failed to delete vehicle.', 'error');
			}
		}
	};

	if (loading) return <LoadingSpinner message="Loading vehicle details..." />;

	if (error || !vehicle) {
		return (
			<Box>
				<Alert severity="error" sx={{ mb: 2 }}>{error || 'Vehicle not found'}</Alert>
				<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/vehicles')}>
					Back to Vehicles
				</Button>
			</Box>
		);
	}

	const infoItems = [
		{ icon: <DirectionsCarIcon />, label: 'Brand', value: vehicle.brand },
		{ icon: <DirectionsCarIcon />, label: 'Model', value: vehicle.model },
		{ icon: <CalendarTodayIcon />, label: 'Year', value: vehicle.year },
		{ icon: <ColorLensIcon />, label: 'Color', value: vehicle.color || '-' },
		{ icon: <FingerprintIcon />, label: 'VIN Number', value: vehicle.vinNumber || '-' },
		{ icon: <LocalGasStationIcon />, label: 'Engine Type', value: vehicle.engineType || '-' },
		{ icon: <LocalGasStationIcon />, label: 'Fuel Type', value: vehicle.fuelType || '-' },
		{ icon: <SpeedIcon />, label: 'Mileage', value: vehicle.mileage != null ? `${vehicle.mileage.toLocaleString()} km` : '-' },
	];

	return (
		<Box>
			{/* Back button */}
			<Button
				startIcon={<ArrowBackIcon />}
				onClick={() => navigate('/vehicles')}
				sx={{ mb: 2, textTransform: 'none' }}
			>
				Back to Vehicles
			</Button>

			<Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
				{/* Left: Image */}
				<Card sx={{ boxShadow: 2 }}>
					<Box
						sx={{
							height: "100%",
							bgcolor: '#E3F2FD',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							overflow: 'hidden',
						}}
					>
						{vehicle.imageUrl ? (
							<Box
								component="img"
								src={getImageUrl(vehicle.imageUrl)}
								alt={`${vehicle.brand} ${vehicle.model}`}
								sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
							/>
						) : (
							<DirectionsCarIcon sx={{ fontSize: 100, color: '#90CAF9' }} />
						)}
					</Box>
				</Card>

				{/* Right: Info */}
				<Card sx={{ boxShadow: 2 }}>
					<CardContent sx={{ p: 3 }}>
						{/* Title & Status */}
						<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
							<Box>
								<Typography variant="h5" fontWeight={700}>
									{vehicle.brand} {vehicle.model}
								</Typography>
								<Chip
									label={vehicle.licensePlate}
									variant="outlined"
									sx={{ mt: 1, fontWeight: 600, fontSize: '0.9rem' }}
								/>
							</Box>
							<StatusBadge status={vehicle.status} size="medium" />
						</Box>

						<Divider sx={{ my: 2 }} />

						{/* Info Grid */}
						<Box
							sx={{
								display: 'grid',
								gridTemplateColumns: 'repeat(2, 1fr)',
								gap: 2,
							}}
						>
							{infoItems.map((item) => (
								<Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
									<Box sx={{ color: 'text.secondary' }}>{item.icon}</Box>
									<Box>
										<Typography variant="caption" color="text.secondary" display="block">
											{item.label}
										</Typography>
										<Typography variant="body2" fontWeight={500}>
											{item.value}
										</Typography>
									</Box>
								</Box>
							))}
						</Box>

						{/* Notes */}
						{vehicle.notes && (
							<>
								<Divider sx={{ my: 2 }} />
								<Typography variant="caption" color="text.secondary" display="block" gutterBottom>
									Notes
								</Typography>
								<Typography variant="body2">{vehicle.notes}</Typography>
							</>
						)}

						{/* Timestamps */}
						<Divider sx={{ my: 2 }} />
						<Box sx={{ display: 'flex', gap: 3 }}>
							<Box>
								<Typography variant="caption" color="text.secondary">Created</Typography>
								<Typography variant="body2">
									{new Date(vehicle.createdAt).toLocaleString()}
								</Typography>
							</Box>
							{vehicle.updatedAt && (
								<Box>
									<Typography variant="caption" color="text.secondary">Updated</Typography>
									<Typography variant="body2">
										{new Date(vehicle.updatedAt).toLocaleString()}
									</Typography>
								</Box>
							)}
						</Box>

						{/* Action Buttons */}
						{isAuthenticated && (
							<>
								<Divider sx={{ my: 2 }} />
								<Box sx={{ display: 'flex', gap: 2 }}>
									<Button
										variant="contained"
										startIcon={<EditIcon />}
										onClick={() => navigate(`/vehicles/${vehicle.id}/edit`)}
										sx={{ textTransform: 'none' }}
									>
										Edit
									</Button>
									<Button
										variant="outlined"
										color="error"
										startIcon={<DeleteIcon />}
										onClick={handleDelete}
										sx={{ textTransform: 'none' }}
									>
										Delete
									</Button>
								</Box>
							</>
						)}
					</CardContent>
				</Card>
			</Box>
		</Box>
	);
}
