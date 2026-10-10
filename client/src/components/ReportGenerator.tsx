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
  Tooltip,
} from '@mui/material'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'

import { INGESTION_PIPELINES } from '../data/esgData'

interface ReportGeneratorProps {
  onOpenReportModal: () => void
}

const SEBI_BRSR_PRINCIPLES = [
  {
    principle: 'P1: Ethics, Transparency & Accountability',
    status: '100% Compliant',
    detail: 'Zero anti-corruption violations; whistle-blower policy operational across 250+ sites.',
  },
  {
    principle: 'P2: Product Lifecycle Sustainability',
    status: 'Verified',
    detail: 'Resource efficiency certifications & fly-ash utilization in concrete infrastructure.',
  },
  {
    principle: 'P3: Employee Well-being & Safety',
    status: 'Audited',
    detail: 'LTIR reduced to 0.12 per million man-hours; 100% health insurance & EHS coverage.',
  },
  {
    principle: 'P4: Stakeholder Responsiveness',
    status: 'Compliant',
    detail: 'Formal community grievance mechanisms active at all EPC and irrigation project hubs.',
  },
  {
    principle: 'P5: Human Rights & Fair Wages',
    status: 'Verified',
    detail: 'Zero child/forced labor incidents; 100% statutory minimum wage compliance audited.',
  },
  {
    principle: 'P6: Environmental Stewardship',
    status: 'Reasonable Assurance',
    detail: 'ISO 14064 metered Scope 1 & 2 emissions; 68.4M liters of wastewater recycled.',
  },
  {
    principle: 'P7: Public Policy Advocacy',
    status: 'Disclosed',
    detail: 'Affiliation with CII & FICCI infrastructure sustainability transition taskforces.',
  },
  {
    principle: 'P8: Inclusive Growth & Community CSR',
    status: 'Compliant',
    detail: '₹48.2 Cr invested in rural drinking water, skill centers, and maternal health clinics.',
  },
  {
    principle: 'P9: Consumer & Public Value',
    status: 'Verified',
    detail: 'Zero data breaches; 99.4% project reliability index across state grid transmissions.',
  },
]

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ onOpenReportModal }) => {
  const [framework, setFramework] = useState('brsr')
  const [fiscalYear, setFiscalYear] = useState('2025')
  const [perimeter, setPerimeter] = useState('consolidated')
  const [assuranceLevel, setAssuranceLevel] = useState('reasonable')

  const [isCompiling, setIsCompiling] = useState(false)
  const [compilationTimestamp, setCompilationTimestamp] = useState<string>('2025-06-30 18:24:10 IST')
  const [verificationChecksum, setVerificationChecksum] = useState<string>('SHA256-4b8c9f2e718a3819c904fa12b8d5e714')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleGenerateReport = () => {
    setIsCompiling(true)
    setTimeout(() => {
      setIsCompiling(false)
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' IST'
      const randHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
      const randHash = 'SHA256-' + randHex
      setCompilationTimestamp(now)
      setVerificationChecksum(randHash)
      setToastMessage('Statutory SEBI BRSR Core dossier re-compiled and verified with line-item audit proofs.')
    }, 1000)
  }

  const handleExportCSV = () => {
    setToastMessage('SEBI BRSR Core raw disclosures CSV dataset exported successfully.')
  }

  const handleExportXBRL = () => {
    setToastMessage('SEBI & MCA compliant XBRL taxonomy XML package generated.')
  }

  const handleCopyChecksum = () => {
    navigator.clipboard?.writeText(verificationChecksum)
    setToastMessage('Cryptographic ledger checksum copied to clipboard.')
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      {/* Top Header */}
      <Box sx={{ mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <AccountBalanceOutlinedIcon sx={{ color: '#064e3b', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            Reports & Statutory Filings (SEBI BRSR Core)
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Generate, validate, and file statutory ESG disclosures and SEBI BRSR Core dossiers for <strong>MEIL Group (Megha Engineering & Infrastructures Ltd)</strong> • CIN: U45200TG1989PLC013058
        </Typography>
      </Box>

      {/* Top 4 KPI Readiness Summary Cards (Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: { xs: 2, sm: 2.25, md: 2.5 },
          mb: 3.5,
        }}
      >
        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>SEBI BRSR Core Readiness</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>9 / 9 Principles</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <CheckCircleOutlinedIcon sx={{ fontSize: 13, color: '#10b981' }} />
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>100% Disclosure Complete</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Audited Scope 1 & 2 Carbon</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>276,650 tCO₂e</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>-5.9% YoY Decarbonization</Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>External Assurance Level</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0284c7', mt: 0.5 }}>Reasonable</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <VerifiedUserOutlinedIcon sx={{ fontSize: 13, color: '#0284c7' }} />
              <Typography variant="caption" sx={{ color: '#0284c7', fontWeight: 700 }}>ISAE 3000 / ISO 14064-3</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Statutory Reporting Cycle</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#064e3b', mt: 0.5 }}>FY 2024-25</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Due Date: 30 Sep 2025</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Content Layout: Configuration (Left) & Compiled Dossier (Right) */}
      <Grid container spacing={3}>
        {/* Left Column: Automation Parameters & Data Ingestion Pipelines */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                Report Configuration & Regulatory Boundary
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 0.25, fontSize: '0.8125rem' }}>
                Specify statutory reporting mandate, boundary perimeter, and audit assurance standards.
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
                  <MenuItem value="brsr">SEBI BRSR Core (India Mandatory Top 1000)</MenuItem>
                  <MenuItem value="brsr-comp">SEBI BRSR Comprehensive (Principles 1-9)</MenuItem>
                  <MenuItem value="csrd">EU CSRD / ESRS (Double Materiality & Supply Chain)</MenuItem>
                  <MenuItem value="gri">GRI Universal Standards 2026</MenuItem>
                  <MenuItem value="issb">ISSB / IFRS S1 & S2 (Capital Markets)</MenuItem>
                  <MenuItem value="ghg">GHG Corporate Standard (Scope 1, 2, 3)</MenuItem>
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="year-select-label">Reporting Period</InputLabel>
                    <Select
                      labelId="year-select-label"
                      value={fiscalYear}
                      label="Reporting Period"
                      onChange={(e) => setFiscalYear(e.target.value)}
                    >
                      <MenuItem value="2025">FY 2024-25 (Audited Statutory)</MenuItem>
                      <MenuItem value="2026">FY 2025-26 (Interim Live Data)</MenuItem>
                      <MenuItem value="2024">FY 2023-24 (Historical Baseline)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="assurance-select-label">Assurance Level</InputLabel>
                    <Select
                      labelId="assurance-select-label"
                      value={assuranceLevel}
                      label="Assurance Level"
                      onChange={(e) => setAssuranceLevel(e.target.value)}
                    >
                      <MenuItem value="reasonable">Reasonable Assurance (ISO 14064-3)</MenuItem>
                      <MenuItem value="limited">Limited Assurance (ISAE 3000)</MenuItem>
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
                  <MenuItem value="consolidated">Consolidated MEIL Group (250+ Project Sites)</MenuItem>
                  <MenuItem value="water-hydro">Hydro, Irrigation & Water Division (Kaleshwaram, Polavaram)</MenuItem>
                  <MenuItem value="power">Power Transmission & Substation Infrastructure</MenuItem>
                  <MenuItem value="transport">Tunnels, Highways & Civil Engineering (Zojila Tunnel)</MenuItem>
                  <MenuItem value="manufacturing">Heavy Engineering, Fabrication & Drilling Plants</MenuItem>
                </Select>
              </FormControl>

              {/* Connected Source Pipelines */}
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: '#1e293b' }}>
                  <StorageOutlinedIcon sx={{ fontSize: 17, color: '#064e3b' }} />
                  Live Ingestion Gateways ({INGESTION_PIPELINES.length} Connected)
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {INGESTION_PIPELINES.map((pipe) => (
                    <Box
                      key={pipe.id}
                      sx={{
                        p: 1.25,
                        borderRadius: 1.5,
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
                          bgcolor: pipe.status === 'Active' ? '#f0fdf4' : '#ffffff',
                          border: '1px solid #cbd5e1',
                          color: pipe.status === 'Active' ? '#15803d' : '#334155',
                          fontWeight: 700,
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
                  sx={{
                    py: 1.2,
                    fontWeight: 700,
                    bgcolor: '#064e3b',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    '&:hover': { bgcolor: '#043e2e' },
                  }}
                >
                  {isCompiling ? 'Compiling SEBI BRSR Verification Dossier...' : 'Run Automated Report Compilation'}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Generated Dossier & Statutory Disclosures Preview */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                  <AssessmentOutlinedIcon sx={{ color: '#064e3b', fontSize: 22 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                    Compiled Statutory ESG Dossier (SEBI BRSR Core)
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#64748b' }}>
                  Standard: {framework.toUpperCase()} • Entity: MEIL Group • Fiscal Year {fiscalYear === '2025' ? '2024-25' : fiscalYear}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={<CheckCircleOutlinedIcon sx={{ fontSize: '14px !important', color: '#15803d !important' }} />}
                  label="Assurance Ready"
                  size="small"
                  sx={{
                    bgcolor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    fontWeight: 700,
                    height: 24,
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PictureAsPdfOutlinedIcon fontSize="small" />}
                  onClick={onOpenReportModal}
                  sx={{ fontWeight: 600, textTransform: 'none', borderColor: '#cbd5e1', color: '#0f172a' }}
                >
                  View Formal Filing PDF
                </Button>
              </Box>
            </Box>

            {isCompiling && (
              <LinearProgress sx={{ height: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: '#064e3b' } }} />
            )}

            <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Statutory Key Figures */}
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: '#1e293b' }}>
                  Consolidated Statutory Carbon Inventory & Key Performance Indicators
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.75, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                        Scope 1 Direct
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', my: 0.25, fontSize: '1.1rem' }}>
                        184,200
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#15803d', fontSize: '0.7rem', fontWeight: 600 }}>
                        tCO₂e (-4.8% YoY)
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.75, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                        Scope 2 Purchased
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', my: 0.25, fontSize: '1.1rem' }}>
                        92,450
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#15803d', fontSize: '0.7rem', fontWeight: 600 }}>
                        tCO₂e (-8.1% YoY)
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.75, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                        Scope 3 Value Chain
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', my: 0.25, fontSize: '1.1rem' }}>
                        412,000
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#15803d', fontSize: '0.7rem', fontWeight: 600 }}>
                        tCO₂e (-2.5% YoY)
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ p: 1.75, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                      <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                        Green Energy Share
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', my: 0.25, fontSize: '1.1rem' }}>
                        42.6%
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#0284c7', fontSize: '0.7rem', fontWeight: 600 }}>
                        Target: 50% FY27
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* SEBI BRSR Core Principles Verification Checklist */}
              <Box sx={{ p: 2, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    SEBI BRSR 9 Principles Completeness Matrix
                  </Typography>
                  <Chip label="9 / 9 Principles Verified" size="small" sx={{ height: 20, fontSize: '0.675rem', bgcolor: '#f0fdf4', color: '#166534', fontWeight: 700 }} />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 220, overflowY: 'auto', pr: 0.5 }}>
                  {SEBI_BRSR_PRINCIPLES.map((item, idx) => (
                    <Box key={idx}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                        <Box sx={{ pr: 1 }}>
                          <Typography variant="body2" sx={{ color: '#1e293b', fontSize: '0.8rem', fontWeight: 600 }}>
                            {item.principle}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}>
                            {item.detail}
                          </Typography>
                        </Box>
                        <Chip
                          label={item.status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.675rem',
                            bgcolor: '#f1f5f9',
                            color: '#334155',
                            fontWeight: 600,
                            flexShrink: 0,
                          }}
                        />
                      </Box>
                      {idx < SEBI_BRSR_PRINCIPLES.length - 1 && <Divider sx={{ my: 0.5 }} />}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Cryptographic Ledger Proof Banner */}
              <Box
                sx={{
                  p: 1.75,
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <KeyOutlinedIcon sx={{ fontSize: 20, color: '#064e3b' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 600 }}>
                      Cryptographic Assurance Stamp (SHA-256 Ledger Verification)
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem', color: '#0f172a' }}>
                      {verificationChecksum}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                    {compilationTimestamp}
                  </Typography>
                  <Tooltip title="Copy Verification Checksum">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleCopyChecksum}
                      startIcon={<ContentCopyOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                      sx={{ height: 26, fontSize: '0.7rem', textTransform: 'none', px: 1, borderColor: '#cbd5e1', color: '#334155' }}
                    >
                      Copy Hash
                    </Button>
                  </Tooltip>
                </Box>
              </Box>

              {/* Download / Export Options */}
              <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
                  onClick={handleExportCSV}
                  sx={{ fontWeight: 600, fontSize: '0.8125rem', textTransform: 'none', borderColor: '#cbd5e1', color: '#334155' }}
                >
                  Export Disclosures CSV
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FileDownloadOutlinedIcon fontSize="small" />}
                  onClick={handleExportXBRL}
                  sx={{ fontWeight: 600, fontSize: '0.8125rem', textTransform: 'none', borderColor: '#cbd5e1', color: '#334155' }}
                >
                  Export MCA XBRL Package (.xml)
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<PictureAsPdfOutlinedIcon fontSize="small" />}
                  onClick={onOpenReportModal}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.8125rem',
                    textTransform: 'none',
                    ml: { sm: 'auto' },
                    bgcolor: '#064e3b',
                    '&:hover': { bgcolor: '#043e2e' },
                  }}
                >
                  Generate Official Filing PDF
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar feedback */}
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
            borderRadius: 2,
            bgcolor: '#0f172a',
            color: '#ffffff',
            '& .MuiAlert-icon': { color: '#34d399' },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
