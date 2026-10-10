import React, { useState } from 'react'
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Divider,
  Tooltip,
  Snackbar,
  Paper,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import type { EvidenceFile } from '../types/dataEntry'

interface EvidenceDetailsDrawerProps {
  open: boolean
  onClose: () => void
  evidence: EvidenceFile | null
  metricName?: string
  siteName?: string
}

export const EvidenceDetailsDrawer: React.FC<EvidenceDetailsDrawerProps> = ({
  open,
  onClose,
  evidence,
  metricName = 'Diesel',
  siteName = 'Bhubaneswar Water Grid',
}) => {
  const [copied, setCopied] = useState(false)

  if (!evidence) return null

  const handleCopyHash = () => {
    navigator.clipboard.writeText(evidence.hash || 'a2f5e2b1c9d40e4d2f7a8c1b3d6e9f0...7f8a2e1d5c6b9')
    setCopied(true)
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 640, md: 720 },
            p: { xs: 2.5, sm: 3.5 },
            bgcolor: '#ffffff',
          },
        },
      }}
    >
      {/* Drawer Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          pb: 2,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
          Evidence Details
        </Typography>
        <IconButton size="small" onClick={onClose} sx={{ color: '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main Drawer Grid: Left (PDF Preview) | Right (Metadata & Hash & Audit Trail) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
        }}
      >
        {/* Left Column: Visual Document Preview */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
              minHeight: 380,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* Simulated Utility Bill Document Header */}
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px dashed #cbd5e1',
                  pb: 1.5,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    INDIAN OIL CORPORATION
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontSize: '0.65rem' }}>
                    Commercial Fuel Supply Division
                  </Typography>
                </Box>
                <PictureAsPdfIcon sx={{ color: '#dc2626', fontSize: 24 }} />
              </Box>

              {/* Bill Details */}
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', display: 'block', mb: 0.5 }}>
                TAX INVOICE / DISPATCH SLIP
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block' }}>
                Invoice No: IOCL-BBSR-2025-0489
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem', display: 'block', mb: 1.5 }}>
                Date: 11 Apr 2025
              </Typography>

              <Box sx={{ p: 1.25, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 1, mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                  Customer Name:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                  MEIL Water Grid – Bhubaneswar Site
                </Typography>
              </Box>

              <Box sx={{ p: 1.25, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Item:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a' }}>High Speed Diesel (HSD)</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Quantity:</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#16a34a' }}>1,250 Liters</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>Meter Slip:</Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#0f172a' }}>SLIP# 98231</Typography>
                </Box>
              </Box>
            </Box>

            {/* Verification Stamp on invoice */}
            <Box
              sx={{
                p: 1,
                bgcolor: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 16 }} />
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600, fontSize: '0.7rem' }}>
                DIGITALLY VERIFIED BY SITE ENGINEER
              </Typography>
            </Box>
          </Paper>

          {/* Download Button */}
          <Button
            fullWidth
            variant="outlined"
            startIcon={<DownloadIcon />}
            sx={{
              borderRadius: 2,
              borderColor: '#cbd5e1',
              color: '#0f172a',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              py: 1,
              '&:hover': {
                borderColor: '#94a3b8',
                bgcolor: '#f8fafc',
              },
            }}
            onClick={() => setCopied(true)}
          >
            Download PDF
          </Button>
        </Box>

        {/* Right Column: Metadata, Cryptographic SHA-256 Hash & Audit Trail */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Metadata Block */}
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1.05rem' }}>
              {evidence.name}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Site</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a' }}>{siteName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Metric</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a' }}>{metricName}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Period</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a' }}>Apr 2025</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>File Size</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a' }}>{evidence.size}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#64748b' }}>Uploaded On</Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: '#0f172a' }}>{evidence.uploadedAt}</Typography>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ borderColor: '#f1f5f9' }} />

          {/* Cryptographic SHA-256 Hash Card (Screen 5) */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                SHA-256 Hash
              </Typography>
              <Chip
                size="small"
                icon={<CheckCircleIcon sx={{ fontSize: '14px !important', color: '#166534 !important' }} />}
                label="Verified ✓"
                sx={{
                  bgcolor: '#dcfce7',
                  color: '#166534',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>

            <Box
              sx={{
                p: 1.25,
                bgcolor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontFamily: 'monospace',
                  color: '#0f172a',
                  wordBreak: 'break-all',
                  fontSize: '0.725rem',
                }}
              >
                {evidence.hash}
              </Typography>
              <Tooltip title="Copy SHA-256 Hash">
                <IconButton size="small" onClick={handleCopyHash} sx={{ color: '#64748b' }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Audit Trail Timeline */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
              Audit Trail
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {/* Event 1 */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: 10,
                    mt: 0.2,
                  }}
                >
                  ✓
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>
                    Uploaded by Site Engineer
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                    12 Apr 2025, 10:24 AM
                  </Typography>
                </Box>
              </Box>

              {/* Event 2 */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: 10,
                    mt: 0.2,
                  }}
                >
                  ✓
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>
                    Approved by Subsidiary Head
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                    13 Apr 2025, 02:15 PM
                  </Typography>
                </Box>
              </Box>

              {/* Event 3 */}
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    bgcolor: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: 10,
                    mt: 0.2,
                  }}
                >
                  ✓
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>
                    Verified by Independent Auditor
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                    15 Apr 2025, 11:06 AM
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Copy notification */}
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Cryptographic SHA-256 hash copied to clipboard!"
      />
    </Drawer>
  )
}
export default EvidenceDetailsDrawer
