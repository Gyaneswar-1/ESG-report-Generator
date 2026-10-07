import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Box,
  Typography,
  Grid,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'

interface ReportModalProps {
  open: boolean
  onClose: () => void
}

export const ReportModal: React.FC<ReportModalProps> = ({ open, onClose }) => {
  const emissionRows = [
    { category: 'Scope 1: Stationary Combustion (Boilers, DG Sets)', fy25: '4,820 tCO₂e', fy26: '4,110 tCO₂e', variance: '-14.7%', proof: 'Fuel Vouchers #8421' },
    { category: 'Scope 1: Mobile Fleet Combustion (Corporate Vehicles)', fy25: '1,940 tCO₂e', fy26: '1,420 tCO₂e', variance: '-26.8%', proof: 'Fleet Telematics Log' },
    { category: 'Scope 2: Purchased Electricity (Location-based)', fy25: '18,300 tCO₂e', fy26: '12,950 tCO₂e', variance: '-29.2%', proof: 'Grid Utility Smart Bills' },
    { category: 'Scope 2: Purchased Electricity (Market-based with REC)', fy25: '9,200 tCO₂e', fy26: '4,100 tCO₂e', variance: '-55.4%', proof: 'I-REC Certificates' },
    { category: 'Scope 3: Cat 1 - Purchased Goods & Raw Materials', fy25: '42,600 tCO₂e', fy26: '38,200 tCO₂e', variance: '-10.3%', proof: 'Tier-1 Supplier ERP Data' },
    { category: 'Scope 3: Cat 6 - Business Air Travel & Stays', fy25: '3,800 tCO₂e', fy26: '2,900 tCO₂e', variance: '-23.7%', proof: 'Corporate Travel Portal' },
  ]

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    alert('Statutory ESG Disclosure Filing (PDF) downloaded successfully.')
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 1.5,
            maxHeight: '92vh',
            border: '1px solid #cbd5e1',
          },
        },
      }}
    >
      {/* Formal Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          bgcolor: '#0f172a',
          color: '#ffffff',
          borderBottom: '1px solid #334155',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AssessmentOutlinedIcon sx={{ color: '#ffffff', fontSize: 22 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#ffffff', fontSize: '1.05rem', lineHeight: 1.2 }}>
                Statutory ESG Disclosure Report & Assurance Dossier
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                SEBI BRSR Core & EU CSRD Compliant • Automated Engine v2.4
              </Typography>
            </Box>
          </Box>

          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: '#94a3b8',
              '&:hover': { color: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.1)' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Formal Document Body */}
      <DialogContent dividers sx={{ p: { xs: 2.5, sm: 3.5 }, bgcolor: '#ffffff' }}>
        {/* Document Header Metadata */}
        <Box
          sx={{
            p: 2.5,
            borderRadius: 1,
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            mb: 3,
          }}
        >
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Reporting Entity
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Apex Holdings Ltd
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                CIN: L24100MH2001PLC132904
              </Typography>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Reporting Period
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                FY 2025-2026 (Annual)
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                1 Apr 2025 – 31 Mar 2026
              </Typography>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Primary Mandate
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                SEBI BRSR Core & GRI 300
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                Reasonable Assurance
              </Typography>
            </Grid>

            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                Assurance Opinion
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <VerifiedUserOutlinedIcon sx={{ fontSize: 15, color: '#0f172a' }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  Clean / Unqualified
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                Ernst & Young LLP
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Section A: Carbon Inventory */}
        <Box sx={{ mb: 3.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '0.04em',
              mb: 1.5,
            }}
          >
            Section A: Environmental Performance & Greenhouse Gas Accounting (ISO 14064 Aligned)
          </Typography>

          <TableContainer component={Paper} sx={{ border: '1px solid #e2e8f0', borderRadius: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Emissions Scope & Source Category</TableCell>
                  <TableCell align="right">FY 2024-25</TableCell>
                  <TableCell align="right">FY 2025-26</TableCell>
                  <TableCell align="right">YoY Variance</TableCell>
                  <TableCell>Digital Source Voucher</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {emissionRows.map((row) => (
                  <TableRow key={row.category} hover>
                    <TableCell sx={{ fontWeight: 500, color: '#0f172a', fontSize: '0.8rem' }}>
                      {row.category}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {row.fy25}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                      {row.fy26}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>
                      {row.variance}
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          bgcolor: '#f1f5f9',
                          px: 1,
                          py: 0.25,
                          borderRadius: 0.5,
                          border: '1px solid #e2e8f0',
                          fontSize: '0.7rem',
                          color: '#334155',
                        }}
                      >
                        {row.proof}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Section B: Social & Governance */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '0.04em',
              mb: 1.5,
            }}
          >
            Section B: Workforce Equity, Social Impact & Corporate Governance Matrix
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                  Social Capital & Human Rights Disclosures
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0, fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <li>Female Workforce Ratio: <strong>38.6%</strong> (Senior Management: 42.0%)</li>
                  <li>Gender Pay Remuneration Ratio: <strong>1.00 : 0.98</strong> (Audited parity)</li>
                  <li>Lost Time Incident Rate (LTIR): <strong>0.12 per 200,000 hrs</strong> worked</li>
                  <li>Statutory CSR Deployment: <strong>₹14.8 Cr</strong> (Sec 135 100% compliant)</li>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ p: 2, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
                  Leadership, Independence & Risk Disclosures
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0, fontSize: '0.8rem', color: '#475569', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  <li>Independent Directors: <strong>58.3%</strong> (Statutory mandate: min 50%)</li>
                  <li>ESG Milestones in Executive Variable Compensation: <strong>35.0% weight</strong></li>
                  <li>Tier-1 Supplier ESG Code of Conduct Sign-off: <strong>96.4% audited spend</strong></li>
                  <li>Information Security Audit: <strong>ISO 27001 & SOC 2 Type II Certified</strong></li>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Cryptographic Ledger Proof Footer */}
        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VerifiedUserOutlinedIcon sx={{ fontSize: 18, color: '#cbd5e1' }} />
            <Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block' }}>
                Immutable Assurance Hash
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#f8fafc' }}>
                SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
              </Typography>
            </Box>
          </Box>

          <Chip
            label="Audit Certified"
            size="small"
            sx={{
              bgcolor: '#1e293b',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.7rem',
              border: '1px solid #475569',
            }}
          />
        </Box>
      </DialogContent>

      {/* Modal Actions */}
      <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={onClose}
          sx={{ fontWeight: 600 }}
        >
          Close
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PrintOutlinedIcon fontSize="small" />}
            onClick={handlePrint}
            sx={{ fontWeight: 600 }}
          >
            Print Filing
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
            onClick={handleDownload}
            sx={{ fontWeight: 600 }}
          >
            Download Certified PDF
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  )
}
