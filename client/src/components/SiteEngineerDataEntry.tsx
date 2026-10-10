import React, { useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material'
import NatureIcon from '@mui/icons-material/Nature'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined'
import CloseIcon from '@mui/icons-material/Close'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'

import type {
  DataEntryTab,
  EvidenceFile,
  SubmissionItem,
} from '../types/dataEntry'

interface SiteEngineerDataEntryProps {
  onNewSubmission?: (submission: SubmissionItem) => void
  onViewEvidenceDrawer?: (evidence: EvidenceFile, metricName: string, siteName: string) => void
}

export const SiteEngineerDataEntry: React.FC<SiteEngineerDataEntryProps> = ({
  onNewSubmission,
  onViewEvidenceDrawer,
}) => {
  const [activeTab, setActiveTab] = useState<DataEntryTab>('energy')
  const [reportingPeriod, setReportingPeriod] = useState('Apr 2025')

  // --- Energy Tab State (Screen 2) ---
  const [energyMetric, setEnergyMetric] = useState('Diesel')
  const [energyQuantity, setEnergyQuantity] = useState<number | string>(1250)
  const [energyUnit, setEnergyUnit] = useState('Liters')
  const [energyEvidence, setEnergyEvidence] = useState<EvidenceFile | null>({
    name: 'diesel_bill_apr25.pdf',
    size: '2.4 MB',
    type: 'application/pdf',
    uploadedAt: '12 Apr 2025, 10:24 AM',
    hash: 'a2f5e2b1c9d40e4d2f7a8c1b3d6e9f0...7f8a2e1d5c6b9',
  })

  // --- Water Tab State (Screen 6) ---
  const [waterMetric, setWaterMetric] = useState('Total Water Generated')
  const [totalWaterGenerated, setTotalWaterGenerated] = useState<number | string>(1000)
  const [recycledWaste, setRecycledWaste] = useState<number | string>(1200) // Default 1200 to illustrate the exact warning from Screen 6!
  const [waterEvidence, setWaterEvidence] = useState<EvidenceFile | null>({
    name: 'water_flow_log_apr25.pdf',
    size: '1.8 MB',
    type: 'application/pdf',
    uploadedAt: '12 Apr 2025, 11:15 AM',
    hash: 'c8d4e1a2f5b6...9e0a1b2c3d4e5f6',
  })

  // --- Waste Tab State ---
  const [wasteMetric, setWasteMetric] = useState('Hazardous Waste')
  const [totalWasteGenerated, setTotalWasteGenerated] = useState<number | string>(45)
  const [divertedWaste, setDivertedWaste] = useState<number | string>(30)
  const [wasteEvidence, setWasteEvidence] = useState<EvidenceFile | null>({
    name: 'waste_manifest_apr25.pdf',
    size: '3.1 MB',
    type: 'application/pdf',
    uploadedAt: '12 Apr 2025, 01:40 PM',
    hash: 'e5f6a1b2c3d4...8a9b0c1d2e3f4a5',
  })

  // --- Social Tab State ---
  const [socialMetric, setSocialMetric] = useState('Safety Training Hours')
  const [socialValue, setSocialValue] = useState<number | string>(340)
  const [socialUnit, setSocialUnit] = useState('Hours')
  const [socialEvidence, setSocialEvidence] = useState<EvidenceFile | null>(null)

  // --- Notification & Feedback State ---
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [submittedItem, setSubmittedItem] = useState<SubmissionItem | null>(null)

  // Emission factor calculation for Energy
  const getEmissionFactor = (metric: string): { factor: number; name: string } => {
    switch (metric) {
      case 'Diesel':
        return { factor: 2.68, name: '2.68 kg CO₂e per liter (Diesel)' }
      case 'Electricity':
      case 'Grid Electricity':
        return { factor: 0.82, name: '0.82 kg CO₂e per kWh (Regional Grid)' }
      case 'Natural Gas':
        return { factor: 2.03, name: '2.03 kg CO₂e per m³ (Natural Gas)' }
      case 'LPG':
        return { factor: 1.61, name: '1.61 kg CO₂e per liter (LPG)' }
      default:
        return { factor: 2.68, name: '2.68 kg CO₂e per liter' }
    }
  }

  const { factor: emissionFactor, name: factorDescription } = getEmissionFactor(energyMetric)
  const numericEnergyQty = typeof energyQuantity === 'number' ? energyQuantity : parseFloat(energyQuantity) || 0
  const normalizedEnergyValue = ((numericEnergyQty * emissionFactor) / 1000).toFixed(2)

  // Water validation logic (Screen 6)
  const numTotalWater = typeof totalWaterGenerated === 'number' ? totalWaterGenerated : parseFloat(totalWaterGenerated) || 0
  const numRecycled = typeof recycledWaste === 'number' ? recycledWaste : parseFloat(recycledWaste) || 0
  const isWaterRecycledInvalid = numRecycled > numTotalWater && numTotalWater > 0

  // Waste validation logic
  const numTotalWaste = typeof totalWasteGenerated === 'number' ? totalWasteGenerated : parseFloat(totalWasteGenerated) || 0
  const numDivertedWaste = typeof divertedWaste === 'number' ? divertedWaste : parseFloat(divertedWaste) || 0
  const isWasteInvalid = numDivertedWaste > numTotalWaste && numTotalWaste > 0

  // Energy validation checks
  const isEnergyQtyValid = numericEnergyQty > 0
  const isEnergyEvidenceAttached = energyEvidence !== null
  const isEnergyFormValid = isEnergyQtyValid && isEnergyEvidenceAttached

  // Water validation checks
  const isWaterFormValid = numTotalWater > 0 && !isWaterRecycledInvalid && waterEvidence !== null

  // File upload simulator
  const handleFileUpload = (tab: DataEntryTab) => {
    const fakeFile: EvidenceFile = {
      name: `${tab}_bill_${reportingPeriod.replace(/\s+/g, '_').toLowerCase()}.pdf`,
      size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
      type: 'application/pdf',
      uploadedAt: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      hash: Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    }

    if (tab === 'energy') setEnergyEvidence(fakeFile)
    if (tab === 'water') setWaterEvidence(fakeFile)
    if (tab === 'waste') setWasteEvidence(fakeFile)
    if (tab === 'social') setSocialEvidence(fakeFile)

    setToastMessage(`Attached: ${fakeFile.name}`)
  }

  // Submission handler
  const handleSubmit = () => {
    let newSub: SubmissionItem | null = null

    if (activeTab === 'energy' && isEnergyFormValid && energyEvidence) {
      newSub = {
        id: `SUB-${Date.now().toString().slice(-4)}`,
        site: 'Bhubaneswar Water Grid',
        category: 'Energy',
        metric: energyMetric,
        period: reportingPeriod,
        valueDisplay: `${normalizedEnergyValue} MT CO₂e`,
        rawQuantity: numericEnergyQty,
        unit: energyUnit,
        normalizedValue: `${normalizedEnergyValue} MT CO₂e`,
        evidence: energyEvidence,
        status: 'Pending',
        submittedAt: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        submittedBy: 'Site Engineer (Bhubaneswar)',
      }
    } else if (activeTab === 'water' && isWaterFormValid && waterEvidence) {
      newSub = {
        id: `SUB-${Date.now().toString().slice(-4)}`,
        site: 'Bhubaneswar Water Grid',
        category: 'Water',
        metric: waterMetric,
        period: reportingPeriod,
        valueDisplay: `${numTotalWater.toLocaleString()} KL (Recycled: ${numRecycled.toLocaleString()} KL)`,
        rawQuantity: numTotalWater,
        unit: 'KL',
        evidence: waterEvidence,
        status: 'Pending',
        submittedAt: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        submittedBy: 'Site Engineer (Bhubaneswar)',
      }
    }

    if (newSub) {
      setSubmittedItem(newSub)
      if (onNewSubmission) onNewSubmission(newSub)
      setToastMessage(`✓ ${newSub.category} submission created and dispatched to Subsidiary Head for approval!`)
    }
  }

  // Presets to jump directly to Screen 2 or Screen 6 mock states
  const applyScreen2Preset = () => {
    setActiveTab('energy')
    setEnergyMetric('Diesel')
    setEnergyQuantity(1250)
    setEnergyUnit('Liters')
    setEnergyEvidence({
      name: 'diesel_bill_apr25.pdf',
      size: '2.4 MB',
      type: 'application/pdf',
      uploadedAt: '12 Apr 2025, 10:24 AM',
      hash: 'a2f5e2b1c9d40e4d2f7a8c1b3d6e9f0...7f8a2e1d5c6b9',
    })
    setToastMessage('Loaded Screen 2 state: Energy Consumption (Diesel, 1250 L, 3.35 MT CO₂e)')
  }

  const applyScreen6Preset = () => {
    setActiveTab('water')
    setWaterMetric('Total Water Generated')
    setTotalWaterGenerated(1000)
    setRecycledWaste(1200)
    setToastMessage('Loaded Screen 6 state: Water Tab with Validation Warning (1200 KL > 1000 KL)')
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', mx: 'auto', pb: 6 }}>
      {/* Top Breadcrumb & Screen Preset Toggles */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2.5,
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            size="small"
            label="SITE ENGINEER PORTAL"
            sx={{
              bgcolor: '#064e3b',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.7rem',
              letterSpacing: '0.04em',
            }}
          />
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem' }}>
            MEIL Infrastructure / Water Grid Division
          </Typography>
        </Box>

        {/* Quick Mockup State Switchers */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant={activeTab === 'energy' ? 'contained' : 'outlined'}
            onClick={applyScreen2Preset}
            startIcon={<AutoFixHighIcon fontSize="small" />}
            sx={{
              fontSize: '0.75rem',
              py: 0.5,
              px: 1.5,
              borderColor: '#065f46',
              bgcolor: activeTab === 'energy' ? '#065f46' : 'transparent',
              color: activeTab === 'energy' ? '#ffffff' : '#065f46',
              '&:hover': {
                bgcolor: activeTab === 'energy' ? '#044e39' : '#ecfdf5',
                borderColor: '#065f46',
              },
            }}
          >
            Mockup 2: Energy Tab State
          </Button>
          <Button
            size="small"
            variant={activeTab === 'water' && isWaterRecycledInvalid ? 'contained' : 'outlined'}
            onClick={applyScreen6Preset}
            startIcon={<WarningAmberIcon fontSize="small" />}
            sx={{
              fontSize: '0.75rem',
              py: 0.5,
              px: 1.5,
              borderColor: '#dc2626',
              bgcolor: activeTab === 'water' && isWaterRecycledInvalid ? '#dc2626' : 'transparent',
              color: activeTab === 'water' && isWaterRecycledInvalid ? '#ffffff' : '#dc2626',
              '&:hover': {
                bgcolor: activeTab === 'water' && isWaterRecycledInvalid ? '#b91c1c' : '#fef2f2',
                borderColor: '#dc2626',
              },
            }}
          >
            Mockup 6: Water Warning State
          </Button>
        </Box>
      </Box>

      {/* Screen Title & Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            Data Entry – Bhubaneswar Water Grid
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5, fontSize: '0.875rem' }}>
            Enter utility consumption data with supporting evidence
          </Typography>
        </Box>

        {/* Reporting Period Badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.85rem' }}>
            Reporting Period
          </Typography>
          <Paper
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: '20px',
              px: 2,
              py: 0.5,
              bgcolor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              select
              variant="standard"
              value={reportingPeriod}
              onChange={(e) => setReportingPeriod(e.target.value)}
              slotProps={{ input: { disableUnderline: true } }}
              sx={{
                '& .MuiSelect-select': {
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#0f172a',
                  py: 0,
                },
              }}
            >
              <MenuItem value="Apr 2025">Apr 2025</MenuItem>
              <MenuItem value="May 2025">May 2025</MenuItem>
              <MenuItem value="Jun 2025">Jun 2025</MenuItem>
              <MenuItem value="Q1 2025-26">Q1 2025-26</MenuItem>
            </TextField>
          </Paper>
        </Box>
      </Box>

      {/* Navigation Pill Tabs: Energy | Water | Waste | Social | Other */}
      <Box sx={{ display: 'flex', gap: 1.25, mb: 3, flexWrap: 'wrap' }}>
        {[
          { id: 'energy', label: 'Energy' },
          { id: 'water', label: 'Water' },
          { id: 'waste', label: 'Waste' },
          { id: 'social', label: 'Social' },
          { id: 'other', label: 'Other' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id
          return (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DataEntryTab)}
              sx={{
                borderRadius: '24px',
                px: 3,
                py: 0.75,
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                minWidth: '84px',
                bgcolor: isSelected ? '#064e3b' : 'transparent',
                color: isSelected ? '#ffffff' : '#475569',
                boxShadow: isSelected ? '0 1px 3px rgba(6, 78, 59, 0.25)' : 'none',
                '&:hover': {
                  bgcolor: isSelected ? '#064e3b' : '#f1f5f9',
                },
              }}
            >
              {tab.label}
            </Button>
          )
        })}
      </Box>

      {/* ========================================================================= */}
      {/* TAB 1: ENERGY CONSUMPTION (Screen 2) */}
      {/* ========================================================================= */}
      {activeTab === 'energy' && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            bgcolor: '#ffffff',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
            Energy Consumption
          </Typography>

          {/* Input Grid: Metric | Quantity | Unit | Normalized Value */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1.2fr 1.2fr 1fr 1.6fr',
              },
              gap: 2.5,
              alignItems: 'flex-start',
              mb: 3.5,
            }}
          >
            {/* Metric Dropdown */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Metric <Box component="span" sx={{ color: '#ef4444' }}>*</Box>
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={energyMetric}
                onChange={(e) => setEnergyMetric(e.target.value)}
                sx={{
                  bgcolor: '#ffffff',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              >
                <MenuItem value="Diesel">Diesel</MenuItem>
                <MenuItem value="Grid Electricity">Grid Electricity</MenuItem>
                <MenuItem value="Natural Gas">Natural Gas</MenuItem>
                <MenuItem value="LPG">LPG</MenuItem>
              </TextField>
            </Box>

            {/* Quantity Input */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Quantity <Box component="span" sx={{ color: '#ef4444' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={energyQuantity}
                onChange={(e) => setEnergyQuantity(e.target.value)}
                placeholder="Enter quantity"
                sx={{
                  bgcolor: '#ffffff',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              />
            </Box>

            {/* Unit Dropdown */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Unit <Box component="span" sx={{ color: '#ef4444' }}>*</Box>
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={energyUnit}
                onChange={(e) => setEnergyUnit(e.target.value)}
                sx={{
                  bgcolor: '#ffffff',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                  },
                }}
              >
                <MenuItem value="Liters">Liters</MenuItem>
                <MenuItem value="Gallons">Gallons</MenuItem>
                <MenuItem value="kWh">kWh</MenuItem>
                <MenuItem value="MWh">MWh</MenuItem>
              </TextField>
            </Box>

            {/* Normalized Value (Auto Calculated Card) */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', display: 'block', mb: 0.8 }}>
                Normalized Value (Auto Calculated)
              </Typography>
              <Box
                sx={{
                  p: 1.75,
                  bgcolor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  minHeight: '62px',
                }}
              >
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '50%',
                    bgcolor: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#15803d',
                  }}
                >
                  <NatureIcon fontSize="small" />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#15803d',
                        lineHeight: 1,
                        fontSize: '1.25rem',
                      }}
                    >
                      {numericEnergyQty > 0 ? normalizedEnergyValue : '0.00'}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: '#166534' }}>
                      MT CO₂e
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#15803d',
                      fontSize: '0.72rem',
                      display: 'block',
                      fontFamily: 'monospace',
                      mt: 0.3,
                    }}
                  >
                    [{energyUnit} × {emissionFactor}] / 1000
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Section: Upload Utility Bill / Evidence (PDF) */}
          <Box sx={{ mb: 3.5 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.25,
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                Upload Utility Bill / Evidence (PDF) <Box component="span" sx={{ color: '#ef4444' }}>*</Box>
              </Typography>

              <Button
                size="small"
                variant="outlined"
                startIcon={<UploadFileIcon fontSize="small" />}
                onClick={() => handleFileUpload('energy')}
                sx={{
                  borderRadius: 1.5,
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  py: 0.5,
                  px: 1.5,
                  '&:hover': {
                    borderColor: '#94a3b8',
                    bgcolor: '#f8fafc',
                  },
                }}
              >
                Upload PDF
              </Button>
            </Box>

            {/* Evidence File Attached Box */}
            {energyEvidence ? (
              <Box
                sx={{
                  p: 2,
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  bgcolor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: '#f8fafc',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: '#fee2e2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#dc2626',
                    }}
                  >
                    <PictureAsPdfIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                      }}
                    >
                      {energyEvidence.name}
                      <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                      {energyEvidence.size} • Uploaded {energyEvidence.uploadedAt}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {onViewEvidenceDrawer && (
                    <Tooltip title="View Cryptographic Proof & Ledger Details">
                      <Button
                        size="small"
                        variant="text"
                        onClick={() =>
                          onViewEvidenceDrawer(energyEvidence, energyMetric, 'Bhubaneswar Water Grid')
                        }
                        sx={{ fontSize: '0.75rem', color: '#065f46', textTransform: 'none' }}
                      >
                        Inspect Hash
                      </Button>
                    </Tooltip>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => setEnergyEvidence(null)}
                    sx={{ color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ) : (
              <Box
                onClick={() => handleFileUpload('energy')}
                sx={{
                  p: 3,
                  border: '2px dashed #cbd5e1',
                  borderRadius: 2,
                  bgcolor: '#f8fafc',
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#065f46',
                    bgcolor: '#f0fdf4',
                  },
                }}
              >
                <UploadFileIcon sx={{ fontSize: 32, color: '#64748b', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                  Click to attach Utility Bill / Diesel Delivery Receipt (PDF)
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Supported format: PDF up to 10MB
                </Typography>
              </Box>
            )}

            {/* Status indicator note */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
              {isEnergyEvidenceAttached ? (
                <>
                  <CheckCircleIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                  <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>
                    File attached. You can submit this metric.
                  </Typography>
                </>
              ) : (
                <>
                  <ErrorOutlinedIcon sx={{ fontSize: 16, color: '#ea580c' }} />
                  <Typography variant="caption" sx={{ color: '#ea580c', fontWeight: 600 }}>
                    Evidence file missing. PDF document required for third-party statutory assurance.
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* Validation Rules Checklist Card */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mb: 3.5,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <WarningAmberIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Validation Rules
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Rule 1 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                {isEnergyQtyValid ? (
                  <CheckCircleOutlinedIcon sx={{ fontSize: 17, color: '#16a34a' }} />
                ) : (
                  <CancelOutlinedIcon sx={{ fontSize: 17, color: '#dc2626' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.825rem',
                    color: isEnergyQtyValid ? '#15803d' : '#dc2626',
                    fontWeight: 500,
                  }}
                >
                  Quantity is greater than 0
                </Typography>
              </Box>

              {/* Rule 2 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                {isEnergyEvidenceAttached ? (
                  <CheckCircleOutlinedIcon sx={{ fontSize: 17, color: '#16a34a' }} />
                ) : (
                  <CancelOutlinedIcon sx={{ fontSize: 17, color: '#dc2626' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.825rem',
                    color: isEnergyEvidenceAttached ? '#15803d' : '#dc2626',
                    fontWeight: 500,
                  }}
                >
                  Evidence file is attached
                </Typography>
              </Box>

              {/* Emission Factor Note */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mt: 0.5 }}>
                <WarningAmberIcon sx={{ fontSize: 17, color: '#b45309' }} />
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.775rem',
                    color: '#78350f',
                    fontWeight: 500,
                  }}
                >
                  Normalized using standard emission factor: {factorDescription}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Action Row */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
            <Button
              variant="contained"
              disabled={!isEnergyFormValid}
              onClick={handleSubmit}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#064e3b',
                color: '#ffffff',
                px: 3.5,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                boxShadow: isEnergyFormValid ? '0 2px 6px rgba(6, 78, 59, 0.3)' : 'none',
                '&:hover': {
                  bgcolor: '#043e2e',
                },
                '&.Mui-disabled': {
                  bgcolor: '#e2e8f0',
                  color: '#94a3b8',
                },
              }}
            >
              Save & Submit
            </Button>
          </Box>
        </Paper>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: WATER CONSUMPTION (Screen 6 with Validation Warning) */}
      {/* ========================================================================= */}
      {activeTab === 'water' && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            bgcolor: '#ffffff',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
            Water Consumption
          </Typography>

          {/* Input Grid: Metric | Total Water Generated | Recycled Waste | Upload Evidence */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1fr 1fr',
                md: '1.2fr 1.3fr 1.3fr 1fr',
              },
              gap: 2.5,
              alignItems: 'flex-start',
              mb: 3,
            }}
          >
            {/* Metric Dropdown */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Metric <Box component="span" sx={{ color: '#ef4444' }}>*</Box>
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={waterMetric}
                onChange={(e) => setWaterMetric(e.target.value)}
                sx={{
                  bgcolor: '#ffffff',
                  '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                }}
              >
                <MenuItem value="Total Water Generated">Total Water Generated</MenuItem>
                <MenuItem value="Groundwater Extraction">Groundwater Extraction</MenuItem>
                <MenuItem value="Municipal Water Intake">Municipal Water Intake</MenuItem>
                <MenuItem value="Rainwater Harvested">Rainwater Harvested</MenuItem>
              </TextField>
            </Box>

            {/* Total Water Generated (KL) */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Total Water Generated (KL) <Box component="span" sx={{ color: '#ef4444' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={totalWaterGenerated}
                onChange={(e) => setTotalWaterGenerated(e.target.value)}
                placeholder="e.g. 1000"
                sx={{
                  bgcolor: '#ffffff',
                  '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                }}
              />
            </Box>

            {/* Recycled Waste (KL) - Demonstrates Validation Error border and warning */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Recycled Waste (KL) <Box component="span" sx={{ color: '#ef4444' }}>*</Box>
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={recycledWaste}
                onChange={(e) => setRecycledWaste(e.target.value)}
                placeholder="e.g. 450"
                error={isWaterRecycledInvalid}
                helperText={
                  isWaterRecycledInvalid
                    ? '⚠️ Recycled waste cannot be greater than total water generated.'
                    : 'Water reclaimed and reused within site processes.'
                }
                sx={{
                  bgcolor: '#ffffff',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    ...(isWaterRecycledInvalid && {
                      borderColor: '#ef4444',
                      bgcolor: '#fff5f5',
                      '& fieldset': {
                        borderColor: '#ef4444 !important',
                        borderWidth: '1.5px',
                      },
                    }),
                  },
                  '& .MuiFormHelperText-root': {
                    color: isWaterRecycledInvalid ? '#dc2626' : '#64748b',
                    fontWeight: isWaterRecycledInvalid ? 600 : 400,
                    fontSize: '0.75rem',
                    mt: 0.75,
                  },
                }}
              />
            </Box>

            {/* Upload Evidence (PDF) Button / Preview */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Upload Evidence (PDF) <Box component="span" sx={{ color: '#ef4444' }}>*</Box>
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<UploadFileIcon fontSize="small" />}
                onClick={() => handleFileUpload('water')}
                sx={{
                  height: '40px',
                  borderRadius: 1.5,
                  borderColor: waterEvidence ? '#16a34a' : '#cbd5e1',
                  color: waterEvidence ? '#15803d' : '#334155',
                  bgcolor: waterEvidence ? '#f0fdf4' : '#ffffff',
                  fontSize: '0.8rem',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#065f46',
                    bgcolor: '#ecfdf5',
                  },
                }}
              >
                {waterEvidence ? 'Change PDF' : 'Upload PDF'}
              </Button>
            </Box>
          </Box>

          {/* Attached Evidence Preview if any */}
          {waterEvidence && (
            <Box
              sx={{
                mb: 3,
                p: 1.5,
                bgcolor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PictureAsPdfIcon sx={{ color: '#dc2626', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                  {waterEvidence.name} ({waterEvidence.size})
                </Typography>
                <Chip
                  size="small"
                  label="Evidence Attached"
                  color="success"
                  sx={{ height: 20, fontSize: '0.675rem', fontWeight: 600 }}
                />
              </Box>
              <IconButton size="small" onClick={() => setWaterEvidence(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* SCREEN 6 SPECIFIC: Validation Error Warning Alert Card */}
          {isWaterRecycledInvalid ? (
            <Box
              sx={{
                mb: 3.5,
                p: 2,
                bgcolor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <ErrorOutlinedIcon sx={{ color: '#dc2626', fontSize: 22, flexShrink: 0 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ color: '#991b1b', fontWeight: 600, fontSize: '0.875rem' }}>
                  Validation Error: Recycled waste ({numRecycled} KL) cannot be greater than total water generated ({numTotalWater} KL).
                </Typography>
                <Typography variant="caption" sx={{ color: '#b91c1c', display: 'block', mt: 0.3 }}>
                  Mass balance conservation rule violated. Please adjust recycled quantity or check metering flow logs.
                </Typography>
              </Box>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setRecycledWaste(Math.min(numTotalWater, 450))}
                sx={{
                  color: '#b91c1c',
                  borderColor: '#fca5a5',
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    bgcolor: '#fee2e2',
                    borderColor: '#ef4444',
                  },
                }}
              >
                Auto-Fix to 450 KL
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                mb: 3.5,
                p: 2,
                bgcolor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                <Box>
                  <Typography variant="body2" sx={{ color: '#166534', fontWeight: 600 }}>
                    Water Mass Balance Validated
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#15803d' }}>
                    Net Consumption: {(numTotalWater - numRecycled).toLocaleString()} KL • Recycling Efficiency:{' '}
                    {numTotalWater > 0 ? ((numRecycled / numTotalWater) * 100).toFixed(1) : 0}%
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {/* Action Row */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
            <Button
              variant="contained"
              disabled={!isWaterFormValid}
              onClick={handleSubmit}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#064e3b',
                color: '#ffffff',
                px: 3.5,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                boxShadow: isWaterFormValid ? '0 2px 6px rgba(6, 78, 59, 0.3)' : 'none',
                '&:hover': {
                  bgcolor: '#043e2e',
                },
                '&.Mui-disabled': {
                  bgcolor: '#e2e8f0',
                  color: '#94a3b8',
                },
              }}
            >
              Save & Submit
            </Button>
          </Box>
        </Paper>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: WASTE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'waste' && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            bgcolor: '#ffffff',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
            Solid & Hazardous Waste
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.2fr 1.3fr 1.3fr 1fr' },
              gap: 2.5,
              alignItems: 'flex-start',
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Waste Category *
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={wasteMetric}
                onChange={(e) => setWasteMetric(e.target.value)}
                sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              >
                <MenuItem value="Hazardous Waste">Hazardous Waste (Chemical/Sludge)</MenuItem>
                <MenuItem value="Non-Hazardous Solid Waste">Non-Hazardous Solid Waste</MenuItem>
                <MenuItem value="E-Waste">E-Waste</MenuItem>
                <MenuItem value="Construction Debris">Construction & Demolition Debris</MenuItem>
              </TextField>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Total Generated (MT) *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={totalWasteGenerated}
                onChange={(e) => setTotalWasteGenerated(e.target.value)}
                sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Diverted from Landfill (MT) *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={divertedWaste}
                onChange={(e) => setDivertedWaste(e.target.value)}
                error={isWasteInvalid}
                helperText={
                  isWasteInvalid ? '⚠️ Diverted waste cannot exceed total generated.' : 'Recycled or co-processed.'
                }
                sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Manifest PDF *
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<UploadFileIcon fontSize="small" />}
                onClick={() => handleFileUpload('waste')}
                sx={{
                  height: '40px',
                  borderRadius: 1.5,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                }}
              >
                {wasteEvidence ? 'Attached' : 'Upload Manifest'}
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
            <Button
              variant="contained"
              disabled={isWasteInvalid || !wasteEvidence}
              onClick={handleSubmit}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: '#064e3b',
                color: '#ffffff',
                px: 3.5,
                py: 1.2,
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              Save & Submit
            </Button>
          </Box>
        </Paper>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SOCIAL METRICS */}
      {/* ========================================================================= */}
      {activeTab === 'social' && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            bgcolor: '#ffffff',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
            Social & Safety Metrics
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.5fr 1fr 1fr 1fr' },
              gap: 2.5,
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Indicator *
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={socialMetric}
                onChange={(e) => setSocialMetric(e.target.value)}
                sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              >
                <MenuItem value="Safety Training Hours">Safety Training Hours</MenuItem>
                <MenuItem value="Lost Time Injury Frequency Rate">Lost Time Injury Frequency Rate (LTIFR)</MenuItem>
                <MenuItem value="Female Worker Participation">Female Worker Participation (%)</MenuItem>
                <MenuItem value="Health Checkup Coverage">Health Checkup Coverage (%)</MenuItem>
              </TextField>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Value *
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={socialValue}
                onChange={(e) => setSocialValue(e.target.value)}
                sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Unit
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={socialUnit}
                onChange={(e) => setSocialUnit(e.target.value)}
                sx={{ bgcolor: '#ffffff', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', mb: 1 }}>
                Attendance/Log PDF
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<UploadFileIcon fontSize="small" />}
                onClick={() => handleFileUpload('social')}
                sx={{ height: '40px', borderRadius: 1.5, textTransform: 'none' }}
              >
                {socialEvidence ? 'Attached' : 'Upload Log'}
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: '#064e3b', color: '#ffffff', px: 3.5, py: 1.2, borderRadius: 2, textTransform: 'none' }}
            >
              Save & Submit
            </Button>
          </Box>
        </Paper>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: OTHER METRICS */}
      {/* ========================================================================= */}
      {activeTab === 'other' && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            border: '1px solid #e2e8f0',
            borderRadius: 2.5,
            bgcolor: '#ffffff',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
            Custom / Supplementary Metric
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5, mb: 3 }}>
            <TextField fullWidth size="small" label="Metric Name" defaultValue="Renewable Energy In-house Generation" />
            <TextField fullWidth size="small" label="Category / Pillar" defaultValue="Environmental - Pillar 1" />
            <TextField fullWidth size="small" label="Quantity / Value" defaultValue="420" type="number" />
            <TextField fullWidth size="small" label="Unit of Measurement" defaultValue="MWh" />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              onClick={() => setToastMessage('Supplementary metric submitted.')}
              endIcon={<ArrowForwardIcon />}
              sx={{ bgcolor: '#064e3b', color: '#ffffff', px: 3.5, py: 1.2, borderRadius: 2, textTransform: 'none' }}
            >
              Save & Submit
            </Button>
          </Box>
        </Paper>
      )}

      {/* Success Confirmation Toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4500}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity="success"
          sx={{
            width: '100%',
            bgcolor: '#064e3b',
            color: '#ffffff',
            fontWeight: 600,
            '& .MuiAlert-icon': { color: '#86efac' },
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>

      {/* Submitted Item Summary Card (if freshly submitted) */}
      {submittedItem && (
        <Box sx={{ mt: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: '1px solid #86efac',
              bgcolor: '#f0fdf4',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleIcon sx={{ color: '#16a34a', fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#166534' }}>
                  Submission Confirmed: #{submittedItem.id}
                </Typography>
              </Box>
              <Chip label="Pending Subsidiary Approval" size="small" color="warning" sx={{ fontWeight: 600 }} />
            </Box>

            <Typography variant="body2" sx={{ color: '#15803d', mb: 1.5 }}>
              Metric: <strong>{submittedItem.metric}</strong> ({submittedItem.valueDisplay}) • Evidence:{' '}
              {submittedItem.evidence.name}
            </Typography>

            <Box
              sx={{
                p: 1.25,
                bgcolor: '#ffffff',
                border: '1px solid #bbf7d0',
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUserIcon sx={{ color: '#15803d', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: '#334155', fontFamily: 'monospace' }}>
                  SHA-256 Hash: {submittedItem.evidence.hash}
                </Typography>
              </Box>
              <Chip
                size="small"
                label="Cryptographically Signed"
                sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 600, height: 20, fontSize: '0.65rem' }}
              />
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  )
}
export default SiteEngineerDataEntry
