import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import type { AuditEvent, EsgRecord } from '../../store/api'

interface AuditHistoryDrawerProps {
  open: boolean
  onClose: () => void
  record: EsgRecord | null
  auditData: { data: AuditEvent[] } | undefined
  loadingAudit: boolean
  onInspectEvidence: (evidenceId: number) => void
  currentRole?: string | null
  onDecideReview?: (status: 'approved' | 'rejected', note: string) => Promise<void>
  isReviewing?: boolean
  reviewError?: unknown
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ overflowWrap: 'anywhere', mt: 0.25, fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  )
}

export const AuditHistoryDrawer: React.FC<AuditHistoryDrawerProps> = ({
  open,
  onClose,
  record,
  auditData,
  loadingAudit,
  onInspectEvidence,
  currentRole,
  onDecideReview,
  isReviewing = false,
  reviewError,
}) => {
  const [reviewNote, setReviewNote] = useState('')

  if (!record) return null

  const handleReviewAction = async (status: 'approved' | 'rejected') => {
    if (onDecideReview) {
      await onDecideReview(status, reviewNote)
      setReviewNote('')
    }
  }

  const canReview =
    (currentRole === 'subsidiary_head' || currentRole === 'executive') && Boolean(onDecideReview)

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: '100%', sm: 500 } } } }}
    >
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#0f172a',
          color: '#ffffff',
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <FactCheckOutlinedIcon sx={{ color: '#2dd4bf' }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Statutory Audit Trail & Evidence Vault
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              Immutable record integrity verified with SHA-256
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} sx={{ color: '#94a3b8', '&:hover': { color: '#ffffff' } }}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 3, flex: 1, overflowY: 'auto' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
          {record.metric}
        </Typography>

        <Stack divider={<Divider flexItem />} spacing={0.25} sx={{ mb: 2 }}>
          <Detail label="Facility Site & Period" value={`${record.site} · ${record.period}`} />
          <Detail
            label="Raw Telemetry (Field Entered)"
            value={`${record.rawValue} ${record.rawUnit}`}
          />
          <Detail
            label="Normalized Statutory SEBI Value"
            value={`${record.value} ${record.unit}`}
          />
          <Detail
            label="Normalization Formula"
            value={record.formula || 'Statutory KPI Direct'}
          />
          <Detail
            label="Entered By & Timestamp"
            value={`${record.enteredBy} (${record.role}) · ${new Date(record.createdAt).toLocaleString()}`}
          />
          <Detail
            label="Cryptographic SHA-256 Evidence Seal"
            value={record.evidenceHash || 'No cryptographic hash recorded'}
          />
          <Detail
            label="Review & Authorization Status"
            value={`${record.reviewStatus?.toUpperCase()}${
              record.reviewedBy ? ` by ${record.reviewedBy}` : ''
            }`}
          />
          {record.reviewNote && <Detail label="Reviewer Notes" value={record.reviewNote} />}
        </Stack>

        {/* Custom Dynamic Form Parameters (if present) */}
        {record.customData && Object.keys(record.customData).length > 0 && (
          <Box sx={{ mb: 2.5, p: 2, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #ccfbf1' }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 750,
                color: '#0f766e',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mb: 1.5,
              }}
            >
              <TuneRoundedIcon sx={{ fontSize: 14 }} /> Dynamic Form Parameters Submitted:
            </Typography>
            <Stack spacing={0.75}>
              {Object.entries(record.customData).map(([key, val]) => (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 0.5,
                    borderBottom: '1px dashed #e2e8f0',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 650, color: '#0f172a' }}>
                    {String(val)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {/* Physical Evidence Attachment Actions */}
        {record.evidenceId && (
          <Paper variant="outlined" sx={{ p: 2, mb: 2.5, borderRadius: 2, bgcolor: '#f8fafc' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
              Supporting Evidence Document
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => onInspectEvidence(record.evidenceId!)}
                startIcon={<AttachFileRoundedIcon />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Inspect & Verify Digest
              </Button>
              {record.cloudinaryUrl && (
                <Button
                  variant="outlined"
                  size="small"
                  href={record.cloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<OpenInNewRoundedIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  Cloudinary Mirror
                </Button>
              )}
            </Stack>
          </Paper>
        )}

        {/* Reviewer Decision Actions */}
        {canReview && (
          <Box sx={{ mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 750, mb: 1, color: '#0f172a' }}>
              Statutory Verification Decision
            </Typography>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={2}
              label="Audit Note (Optional)"
              placeholder="e.g. Invoiced quantity matches meter calibration certificate."
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              sx={{ bgcolor: '#ffffff', mb: 1.5 }}
            />
            {Boolean(reviewError) && (
              <Alert severity="error" sx={{ mb: 1.5 }}>
                Could not update review status. Please try again.
              </Alert>
            )}
            <Stack direction="row" spacing={1}>
              {record.reviewStatus === 'pending' && (
                <>
                  <Button
                    fullWidth
                    color="error"
                    variant="outlined"
                    disabled={isReviewing}
                    onClick={() => handleReviewAction('rejected')}
                  >
                    Reject Entry
                  </Button>
                  <Button
                    fullWidth
                    color="success"
                    variant="contained"
                    disabled={isReviewing}
                    onClick={() => handleReviewAction('approved')}
                    sx={{ fontWeight: 700 }}
                  >
                    Approve Entry
                  </Button>
                </>
              )}

              {record.reviewStatus === 'approved' && (
                <Button
                  fullWidth
                  color="error"
                  variant="outlined"
                  disabled={isReviewing}
                  onClick={() => handleReviewAction('rejected')}
                >
                  Revoke Approval / Reject Entry
                </Button>
              )}

              {record.reviewStatus === 'rejected' && (
                <Button
                  fullWidth
                  color="success"
                  variant="contained"
                  disabled={isReviewing}
                  onClick={() => handleReviewAction('approved')}
                  sx={{ fontWeight: 700 }}
                >
                  Re-Approve Entry
                </Button>
              )}
            </Stack>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Chronological Audit Events */}
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
          Immutable Audit Revision Log
        </Typography>

        {loadingAudit ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : !auditData?.data || auditData.data.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No audit log entries recorded for this measurement.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {auditData.data.map((event) => (
              <Box
                key={event.id}
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid #f1f5f9',
                  bgcolor: '#ffffff',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {event.action.toUpperCase()} · {event.enteredBy} ({event.role})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(event.createdAt).toLocaleTimeString()}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {new Date(event.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace', color: '#0369a1' }}>
                  {event.rawValue} {event.rawUnit} → {event.normalizedValue} {event.normalizedUnit}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </Box>
    </Drawer>
  )
}
