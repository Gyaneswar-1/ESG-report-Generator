import React from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
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
import DownloadIcon from '@mui/icons-material/Download'
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

  const fileName = record.evidenceName || record.evidence || 'evidence.pdf'
  const isImage = /\.(png|jpe?g|webp|gif)$/i.test(fileName)

  const handleDownload = () => {
    if (!previewUrl) return
    const a = document.createElement('a')
    a.href = previewUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              File Name: <strong>{fileName}</strong>
            </Typography>
            {record.site && (
              <Chip size="small" variant="outlined" label={`Site: ${record.site}`} sx={{ height: 22, fontSize: '0.7rem' }} />
            )}
            {record.metric && (
              <Chip size="small" variant="outlined" label={`Metric: ${record.metric}`} sx={{ height: 22, fontSize: '0.7rem' }} />
            )}
            {record.value !== undefined && (
              <Chip size="small" color="primary" variant="outlined" label={`${record.value} ${record.unit || ''}`} sx={{ height: 22, fontSize: '0.7rem' }} />
            )}
          </Box>
          <Typography variant="caption" sx={{ color: '#64748b', fontFamily: 'monospace', wordBreak: 'break-all' }}>
            SHA-256 Digest: {record.evidenceHash || 'Computing...'}
          </Typography>
        </Stack>

        {previewUrl ? (
          isImage ? (
            <Box
              sx={{
                width: '100%',
                maxHeight: 520,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: 1.5,
                p: 2,
                bgcolor: '#f8fafc',
                overflow: 'auto',
              }}
            >
              <Box
                component="img"
                src={previewUrl}
                alt={fileName}
                sx={{ maxWidth: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 1 }}
              />
            </Box>
          ) : (
            <Box
              component="iframe"
              src={`${previewUrl}#toolbar=1`}
              title={fileName}
              sx={{
                width: '100%',
                height: 520,
                border: '1px solid #cbd5e1',
                borderRadius: 1.5,
                bgcolor: '#ffffff',
              }}
            />
          )
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
            <CircularProgress size={36} />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        {previewUrl && (
          <>
            <Button
              size="small"
              variant="outlined"
              startIcon={<OpenInNewRoundedIcon fontSize="small" />}
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ textTransform: 'none' }}
            >
              Open in New Tab
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="primary"
              startIcon={<DownloadIcon fontSize="small" />}
              onClick={handleDownload}
              sx={{ textTransform: 'none' }}
            >
              Download PDF
            </Button>
          </>
        )}
        {record.cloudinaryUrl && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<OpenInNewRoundedIcon fontSize="small" />}
            href={record.cloudinaryUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ textTransform: 'none' }}
          >
            Open in CDN Mirror
          </Button>
        )}
        <Button onClick={onClose} sx={{ fontWeight: 600, ml: 'auto' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
