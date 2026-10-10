import React from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Tooltip,
} from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import type { SubmissionItem, EvidenceFile } from '../types/dataEntry'

interface MySubmissionsViewProps {
  submissions: SubmissionItem[]
  onViewEvidence: (evidence: EvidenceFile, metric: string, site: string) => void
  onNavigateToDataEntry: () => void
}

export const MySubmissionsView: React.FC<MySubmissionsViewProps> = ({
  submissions,
  onViewEvidence,
  onNavigateToDataEntry,
}) => {
  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
            My Submissions – Bhubaneswar Water Grid
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Track progress of utility metric submissions through approval and statutory audit stages
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={onNavigateToDataEntry}
          sx={{
            bgcolor: '#064e3b',
            color: '#ffffff',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { bgcolor: '#043e2e' },
          }}
        >
          + New Metric Entry
        </Button>
      </Box>

      {/* Submissions Table */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>SUBMISSION ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>METRIC</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>REPORTING PERIOD</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>VALUE</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>EVIDENCE</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>STATUS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {submissions.map((sub) => {
              const statusColor =
                sub.status === 'Approved'
                  ? { bg: '#dcfce7', text: '#15803d' }
                  : sub.status === 'Rejected'
                  ? { bg: '#fee2e2', text: '#b91c1c' }
                  : { bg: '#fef3c7', text: '#b45309' }

              return (
                <TableRow key={sub.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell sx={{ fontWeight: 600, color: '#0f172a', fontFamily: 'monospace' }}>
                    {sub.id}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                      {sub.metric}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {sub.category}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#475569', fontSize: '0.85rem' }}>{sub.period}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a' }}>{sub.valueDisplay}</TableCell>
                  <TableCell>
                    <Tooltip title={`Inspect ${sub.evidence.name}`}>
                      <Box
                        onClick={() => onViewEvidence(sub.evidence, sub.metric, sub.site)}
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.75,
                          cursor: 'pointer',
                          color: '#dc2626',
                          p: 0.5,
                          borderRadius: 1,
                          '&:hover': { bgcolor: '#fee2e2' },
                        }}
                      >
                        <PictureAsPdfIcon fontSize="small" />
                        <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 500 }}>
                          {sub.evidence.name}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={sub.status}
                      sx={{
                        bgcolor: statusColor.bg,
                        color: statusColor.text,
                        fontWeight: 700,
                        fontSize: '0.725rem',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                      onClick={() => onViewEvidence(sub.evidence, sub.metric, sub.site)}
                      sx={{
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        borderColor: '#cbd5e1',
                        color: '#334155',
                      }}
                    >
                      Audit Proof
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}
export default MySubmissionsView
