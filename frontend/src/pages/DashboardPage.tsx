import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Alert,
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
import BlockIcon from '@mui/icons-material/Block';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import { vehicleApi, type VehicleDto } from '../api/vehicleApi';
import { getImageUrl } from '../api/axiosInstance';
import LoadingSpinner from '../components/LoadingSpinner';

interface StatusSummary {
  total: number;
  Available: number;
  InUse: number;
  Maintenance: number;
  Retired: number;
}

const statusCards = [
  {
    key: 'total' as const,
    label: 'Total Vehicles',
    icon: <DirectionsCarIcon sx={{ fontSize: 40 }} />,
    color: '#1976D2',
    bgColor: '#E3F2FD',
  },
  {
    key: 'Available' as const,
    label: 'Available',
    icon: <CheckCircleIcon sx={{ fontSize: 40 }} />,
    color: '#2E7D32',
    bgColor: '#E8F5E9',
  },
  {
    key: 'InUse' as const,
    label: 'In Use',
    icon: <DriveEtaIcon sx={{ fontSize: 40 }} />,
    color: '#0288D1',
    bgColor: '#E1F5FE',
  },
  {
    key: 'Maintenance' as const,
    label: 'Maintenance',
    icon: <BuildIcon sx={{ fontSize: 40 }} />,
    color: '#ED6C02',
    bgColor: '#FFF3E0',
  },
  {
    key: 'Retired' as const,
    label: 'Retired',
    icon: <BlockIcon sx={{ fontSize: 40 }} />,
    color: '#757575',
    bgColor: '#F5F5F5',
  },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<StatusSummary>({
    total: 0,
    Available: 0,
    InUse: 0,
    Maintenance: 0,
    Retired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // Fetch all vehicles (large pageSize to get total count)
        const res = await vehicleApi.getAll({ pageSize: 1 });
        const totalCount = res.data.totalCount;

        // Fetch per-status counts
        const statuses = ['Available', 'InUse', 'Maintenance', 'Retired'];
        const counts = await Promise.all(
          statuses.map((s) => vehicleApi.getAll({ status: s, pageSize: 1 }))
        );

        setSummary({
          total: totalCount,
          Available: counts[0].data.totalCount,
          InUse: counts[1].data.totalCount,
          Maintenance: counts[2].data.totalCount,
          Retired: counts[3].data.totalCount,
        });
      } catch {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const handleCardClick = (key: string) => {
    if (key === 'total') {
      navigate('/vehicles');
    } else {
      navigate(`/vehicles?status=${key}`);
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} color="text.primary">
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Fleet overview and vehicle status summary
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 3,
        }}
      >
        {statusCards.map((card) => (
          <Card
            key={card.key}
            sx={{
              boxShadow: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 },
            }}
          >
            <CardActionArea onClick={() => handleCardClick(card.key)}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {card.label}
                    </Typography>
                    <Typography variant="h3" fontWeight={700} sx={{ color: card.color, mt: 1 }}>
                      {summary[card.key]}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: card.bgColor,
                      color: card.color,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>

      {/* Recent vehicles section */}
      <RecentVehicles />
    </Box>
  );
}

function RecentVehicles() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<VehicleDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await vehicleApi.getAll({ pageSize: 5, sortBy: 'CreatedAt', sortDirection: 'desc' });
        setVehicles(res.data.items);
      } catch {
        // silently fail - not critical
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  if (loading || vehicles.length === 0) return null;

  return (
    <Box sx={{ mt: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Recently Added
        </Typography>
        <Typography
          variant="body2"
          color="primary"
          sx={{ cursor: 'pointer', fontWeight: 500 }}
          onClick={() => navigate('/vehicles')}
        >
          View all →
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
        }}
      >
        {vehicles.map((v) => (
          <Card
            key={v.id}
            sx={{
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 4 },
            }}
            onClick={() => navigate(`/vehicles/${v.id}`)}
          >
            <Box
              sx={{
                height: 120,
                bgcolor: '#E3F2FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {v.imageUrl ? (
                <Box
                  component="img"
                  src={getImageUrl(v.imageUrl)}
                  alt={`${v.brand} ${v.model}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <DirectionsCarIcon sx={{ fontSize: 48, color: '#90CAF9' }} />
              )}
            </Box>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {v.brand} {v.model}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {v.licensePlate}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
