import React from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import type { EsgRecord } from '../../store/api'

interface EvidenceModalProps {
  open: boolean
  onClose: () => void
  record: EsgRecord | null
  previewUrl: string | null
  hashVerified: boolean | null
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({
  open,
  onClose,
  record,
  previewUrl,
  hashVerified,
}) => {
  if (!record) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, bgcolor: '#0f172a', color: '#ffffff', py: 2 }}>
        Evidence Document Verification & Preview
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2.5 }}>
        {hashVerified !== null && (
          <Alert
            severity={hashVerified ? 'success' : 'error'}
            icon={hashVerified ? <CheckCircleOutlineRoundedIcon /> : <ErrorOutlineRoundedIcon />}
            sx={{ mb: 2 }}
          >
            {hashVerified
              ? 'Cryptographic Verification Passed: Client SHA-256 byte digest matches database seal.'
              : 'Warning: Evidence digest mismatch detected!'}
          </Alert>
        )}

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            File Name: <strong>{record.evidenceName || record.evidence}</strong>
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            SHA-256 Digest: {record.evidenceHash || 'Computing...'}
          </Typography>
        </Stack>

        {previewUrl ? (
          <Box
            component="iframe"
            src={previewUrl}
            sx={{
              width: '100%',
              height: 480,
              border: '1px solid #cbd5e1',
              borderRadius: 1.5,
            }}
          />
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
            <CircularProgress size={36} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        {record.cloudinaryUrl && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<OpenInNewRoundedIcon fontSize="small" />}
            href={record.cloudinaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mr: 'auto', textTransform: 'none' }}
          >
            Open in CDN Mirror
          </Button>
        )}
        <Button onClick={onClose} sx={{ fontWeight: 600 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

