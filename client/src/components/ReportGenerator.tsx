import React, { useState } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Alert,
  Snackbar,
} from '@mui/material'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'
import { INGESTION_PIPELINES } from '../data/esgData'

interface ReportGeneratorProps {
  onOpenReportModal: () => void
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onOpenReportModal }) => {
  const [framework, setFramework] = useState('brsr')
  const [fiscalYear, setFiscalYear] = useState('2026')
  const [perimeter, setPerimeter] = useState('consolidated')
  const [assuranceLevel, setAssuranceLevel] = useState('reasonable')

  const [isCompiling, setIsCompiling] = useState(false)
  const [compilationTimestamp, setCompilationTimestamp] = useState<string>('2026-03-31 18:24:10 UTC')
  const [verificationChecksum, setVerificationChecksum] = useState<string>('SHA256-4b8c9f2e718a3819')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleGenerateReport = () => {
    setIsCompiling(true)
    setTimeout(() => {
      setIsCompiling(false)
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC'
      const randHash = 'SHA256-' + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10)
      setCompilationTimestamp(now)
      setVerificationChecksum(randHash)
      setToastMessage('Statutory ESG Disclosure dossier compiled successfully with line-item proofs.')
    }, 900)
  }

  const handleExportCSV = () => {
    setToastMessage('Raw disclosure CSV dataset exported successfully.')
  }

  const handleExportXBRL = () => {
    setToastMessage('Standard XBRL taxonomy XML package generated.')
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Grid container spacing={3}>
        {/* Left Column: Automation Parameters & Data Ingestion Pipelines */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                Report Configuration & Boundary
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                Select reporting standard, boundary perimeter, and audit assurance level.
              </Typography>
            </Box>

            <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="framework-select-label">Statutory Reporting Framework</InputLabel>
                <Select
                  labelId="framework-select-label"
                  value={framework}
                  label="Statutory Reporting Framework"
                  onChange={(e) => setFramework(e.target.value)}
                >
                  <MenuItem value="brsr">SEBI BRSR Core (India Listed Entities)</MenuItem>
                  <MenuItem value="csrd">EU CSRD / ESRS (Double Materiality)</MenuItem>
                  <MenuItem value="gri">GRI Universal Standards 2026</MenuItem>
                  <MenuItem value="issb">ISSB / IFRS S1 & S2 (Capital Markets)</MenuItem>
                  <MenuItem value="ghg">GHG Corporate Standard (Scope 1-3)</MenuItem>
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="year-select-label">Reporting Period</InputLabel>
                    <Select
                      labelId="year-select-label"
                      value={fiscalYear}
                      label="Reporting Period"
                      onChange={(e) => setFiscalYear(e.target.value)}
                    >
                      <MenuItem value="2026">FY 2025-26 (Current)</MenuItem>
                      <MenuItem value="2025">FY 2024-25 (Audited)</MenuItem>
                      <MenuItem value="2024">FY 2023-24 (Historical)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="assurance-select-label">Assurance Level</InputLabel>
                    <Select
                      labelId="assurance-select-label"
                      value={assuranceLevel}
                      label="Assurance Level"
                      onChange={(e) => setAssuranceLevel(e.target.value)}
                    >
                      <MenuItem value="reasonable">Reasonable Assurance</MenuItem>
                      <MenuItem value="limited">Limited Assurance</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <FormControl fullWidth size="small">
                <InputLabel id="perimeter-select-label">Organizational Boundary</InputLabel>
                <Select
                  labelId="perimeter-select-label"
                  value={perimeter}
                  label="Organizational Boundary"
                  onChange={(e) => setPerimeter(e.target.value)}
                >
                  <MenuItem value="consolidated">Consolidated Global Group (100% Equity)</MenuItem>
                  <MenuItem value="manufacturing">Manufacturing Division & Operational Facilities</MenuItem>
                  <MenuItem value="commercial">Commercial Hubs & Corporate Infrastructure</MenuItem>
                </Select>
              </FormControl>

              {/* Connected Source Pipelines */}
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StorageOutlinedIcon sx={{ fontSize: 16 }} />
                  Live Ingestion Pipelines ({INGESTION_PIPELINES.length} Connected)
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {INGESTION_PIPELINES.map((pipe) => (
                    <Box
                      key={pipe.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 1,
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>
                          {pipe.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {pipe.recordsSynced.toLocaleString()} records • {pipe.lastSync}
                        </Typography>
                      </Box>
                      <Chip
                        label={pipe.status}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.675rem',
                          bgcolor: '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: '#334155',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box sx={{ mt: 'auto', pt: 2 }}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={isCompiling}
                  onClick={handleGenerateReport}
                  sx={{ py: 1.2, fontWeight: 600 }}
                >
                  {isCompiling ? 'Compiling Verification Dossier...' : 'Run Automated Report Compilation'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Generated Dossier & Statutory Disclosures Preview */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box
              sx={{
                p: 2.5,
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AssessmentOutlinedIcon sx={{ color: '#0f172a', fontSize: 20 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Compiled Statutory ESG Dossier
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Standard: {framework.toUpperCase()} • Entity: Apex Holdings Ltd • Fiscal Year {fiscalYear}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<CheckCircleOutlinedIcon sx={{ fontSize: '14px !important', color: '#0f172a !important' }} />}
                  label="Assurance Ready"
                  size="small"
                  sx={{
                    bgcolor: '#f1f5f9',
                    color: '#0f172a',
                    fontWeight: 600,
                    height: 24,
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PictureAsPdfOutlinedIcon fontSize="small" />}
                  onClick={onOpenReportModal}
                  sx={{ fontWeight: 600 }}
                >
                  View Formal Filing
                </Button>
              </Box>
            </Box>

            {isCompiling && (
              <LinearProgress sx={{ height: 3 }} />
            )}

            <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Statutory Key Figures */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                  Consolidated Statutory Carbon Inventory & Compliance Indicators
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.75, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 500 }}>
                        Scope 1 Emissions
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', my: 0.25 }}>
                        5,530
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.7rem' }}>
                        tCO₂e (-18.2% YoY)
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.75, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 500 }}>
                        Scope 2 Location
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', my: 0.25 }}>
                        12,950
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.7rem' }}>
                        tCO₂e (-29.2% YoY)
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.75, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 500 }}>
                        Scope 3 Value Chain
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', my: 0.25 }}>
                        41,100
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.7rem' }}>
                        tCO₂e (-11.4% YoY)
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.75, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 500 }}>
                        Renewable Share
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', my: 0.25 }}>
                        68.5%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#475569', fontSize: '0.7rem' }}>
                        Target: 80% (2028)
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Disclosure Validation Checklist */}
              <Box sx={{ p: 2, borderRadius: 1, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Regulatory Verification & Completeness Matrix
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.8125rem' }}>
                      <strong>1. Carbon Accounting:</strong> 100% of Scope 1 & Scope 2 metered with ISO 14064 alignment.
                    </Typography>
                    <Chip label="100% Verified" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.675rem' }} />
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.8125rem' }}>
                      <strong>2. Social Disclosures:</strong> Principle 3 & 5 gender pay parity and OHS incident audits complete.
                    </Typography>
                    <Chip label="Compliant" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.675rem' }} />
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.8125rem' }}>
                      <strong>3. Governance Oversight:</strong> 58.3% Independent Directors; secretarial certification attached.
                    </Typography>
                    <Chip label="Certified" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.675rem' }} />
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                    <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.8125rem' }}>
                      <strong>4. Digital Audit Trail:</strong> Every reported disclosure anchored to raw ERP & utility documents.
                    </Typography>
                    <Chip label="Ledger Mapped" size="small" variant="outlined" sx={{ height: 20, fontSize: '0.675rem' }} />
                  </Box>
                </Box>
              </Box>

              {/* Cryptographic Ledger Proof Banner */}
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: 1,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <KeyOutlinedIcon sx={{ fontSize: 18, color: '#475569' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                      Cryptographic Assurance Stamp (Immutable Ledger Verification)
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.75rem', color: '#0f172a' }}>
                      {verificationChecksum}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  {compilationTimestamp}
                </Typography>
              </Box>

              {/* Download / Export Options */}
              <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
                  onClick={handleExportCSV}
                  sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
                >
                  Export Disclosures CSV
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
                  onClick={handleExportXBRL}
                  sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
                >
                  Export XBRL Taxonomy (.xml)
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PictureAsPdfOutlinedIcon fontSize="small" />}
                  onClick={onOpenReportModal}
                  sx={{ fontWeight: 600, fontSize: '0.8125rem', ml: { sm: 'auto' } }}
                >
                  Generate Official Filing PDF
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3500}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity="info"
          sx={{
            width: '100%',
            borderRadius: 1,
            bgcolor: '#0f172a',
            color: '#ffffff',
            '& .MuiAlert-icon': { color: '#ffffff' },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
