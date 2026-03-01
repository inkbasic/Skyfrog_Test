import { Chip } from '@mui/material';

type VehicleStatus = 'Available' | 'InUse' | 'Maintenance' | 'Retired';

const statusConfig: Record<VehicleStatus, { color: 'success' | 'info' | 'warning' | 'default'; label: string }> = {
  Available: { color: 'success', label: 'Available' },
  InUse: { color: 'info', label: 'In Use' },
  Maintenance: { color: 'warning', label: 'Maintenance' },
  Retired: { color: 'default', label: 'Retired' },
};

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium';
}

export default function StatusBadge({ status, size = 'small' }: StatusBadgeProps) {
  const config = statusConfig[status as VehicleStatus] || { color: 'default' as const, label: status };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="filled"
    />
  );
}
