import { useState, useRef } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

interface ImageUploadProps {
  currentImageUrl?: string;
  onFileSelect: (file: File | null) => void;
}

export default function ImageUpload({ currentImageUrl, onFileSelect }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box>
      <input
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {preview ? (
        <Box position="relative" display="inline-block">
          <Box
            component="img"
            src={preview}
            alt="Vehicle preview"
            sx={{
              width: '100%',
              maxHeight: 250,
              objectFit: 'cover',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          />
          <IconButton
            onClick={handleRemove}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0,0,0,0.6)',
              color: 'white',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
            transition: 'all 0.2s',
          }}
        >
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Click to upload vehicle image
          </Typography>
          <Typography variant="caption" color="text.secondary">
            JPG, PNG, GIF, WebP (max 5MB)
          </Typography>
        </Box>
      )}

      {preview && (
        <Button
          variant="outlined"
          size="small"
          startIcon={<CloudUploadIcon />}
          onClick={() => fileInputRef.current?.click()}
          sx={{ mt: 1 }}
        >
          Change Image
        </Button>
      )}
    </Box>
  );
}
