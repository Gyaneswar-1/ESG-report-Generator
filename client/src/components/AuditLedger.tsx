import React from 'react'
import {
  Card,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
} from '@mui/material'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import { AUDIT_RECORDS } from '../data/esgData'

export const AuditLedger: React.FC = () => {
  return (
    <Card sx={{ mb: 4 }}>
      <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <ShieldOutlinedIcon sx={{ color: '#0f172a', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
            External Assurance Digital Proof Ledger
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Immutable audit trails linking every reported disclosure directly to underlying ERP records, utility invoices, and standard emission factors.
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 120 }}>Record ID</TableCell>
              <TableCell sx={{ minWidth: 140 }}>Timestamp (UTC)</TableCell>
              <TableCell sx={{ minWidth: 220 }}>Statutory Metric</TableCell>
              <TableCell sx={{ minWidth: 220 }}>Source Voucher Document</TableCell>
              <TableCell sx={{ minWidth: 200 }}>Standard Emission Factor</TableCell>
              <TableCell sx={{ minWidth: 160 }}>Source System</TableCell>
              <TableCell sx={{ minWidth: 140 }}>Audit Opinion</TableCell>
              <TableCell sx={{ minWidth: 160 }}>Cryptographic Hash</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {AUDIT_RECORDS.map((rec) => (
              <TableRow key={rec.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>
                    {rec.id}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                    {rec.timestamp}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8125rem' }}>
                    {rec.metric}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      color: '#334155',
                      bgcolor: '#f8fafc',
                      px: 1,
                      py: 0.5,
                      borderRadius: 0.5,
                      border: '1px solid #e2e8f0',
                      display: 'inline-block',
                      fontSize: '0.7rem',
                    }}
                  >
                    {rec.sourceDocument}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.775rem' }}>
                    {rec.emissionFactor}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.775rem' }}>
                    {rec.sourceSystem}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    icon={<VerifiedUserOutlinedIcon sx={{ fontSize: '13px !important', color: '#0f172a !important' }} />}
                    label="Verified"
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 22,
                      fontSize: '0.675rem',
                      fontWeight: 600,
                      borderColor: '#cbd5e1',
                      color: '#0f172a',
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Tooltip title={rec.hash}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        color: '#64748b',
                        fontSize: '0.7rem',
                        cursor: 'help',
                      }}
                    >
                      {rec.hash.substring(0, 14)}...
                    </Typography>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}
