import React, { useState, useMemo } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded'
import DynamicFormOutlinedIcon from '@mui/icons-material/DynamicFormOutlined'
import Checkbox from '@mui/material/Checkbox'
import { validateDynamicFormData } from '@my-app/common'
import { useCreateRecordMutation, type PublishedForm, type Site } from '../../store/api'

interface MetricOption {
  code: string
  label: string
  unit: string
}

const categories: { name: string; metrics: MetricOption[] }[] = [
  {
    name: 'Energy',
    metrics: [
      { code: 'diesel', label: 'Diesel consumed (DG Sets / Fleet)', unit: 'Liters' },
      { code: 'electricity', label: 'Grid Electricity consumed', unit: 'kWh' },
      { code: 'petrol', label: 'Motor Spirit / Petrol consumed', unit: 'Liters' },
      { code: 'cng', label: 'Compressed Natural Gas (CNG)', unit: 'kg' },
      { code: 'png', label: 'Piped Natural Gas (PNG)', unit: 'SCM' },
      { code: 'lpg', label: 'Liquified Petroleum Gas (LPG)', unit: 'kg' },
    ],
  },
  {
    name: 'Water',
    metrics: [
      { code: 'water', label: 'Total Water withdrawn', unit: 'kL' },
      { code: 'water_surface', label: 'Surface Water intake', unit: 'kL' },
      { code: 'water_ground', label: 'Groundwater / Borewell intake', unit: 'kL' },
      { code: 'water_recycled', label: 'Water Recycled & Reused', unit: 'kL' },
    ],
  },
  {
    name: 'Waste',
    metrics: [
      { code: 'total_waste', label: 'Total Waste generated', unit: 'kg' },
      { code: 'recycled_waste', label: 'Waste Recycled / Reclaimed', unit: 'kg' },
      { code: 'hazardous_waste', label: 'Hazardous Waste generated', unit: 'kg' },
      { code: 'plastic_waste', label: 'Plastic Packaging Waste', unit: 'kg' },
    ],
  },
  {
    name: 'People & Safety',
    metrics: [
      { code: 'working_hours', label: 'Total Site Working Hours', unit: 'hours' },
      { code: 'lost_time_injuries', label: 'Lost Time Injury Incidents', unit: 'incidents' },
      { code: 'training_hours', label: 'Safety & Skill Training Hours', unit: 'hours' },
    ],
  },
]

interface RecordSubmissionFormProps {
  sites: Site[]
  publishedForms: PublishedForm[]
  currentRole?: string
  onSubmissionSuccess?: () => void
}

export const RecordSubmissionForm: React.FC<RecordSubmissionFormProps> = ({
  sites,
  publishedForms,
  currentRole: _currentRole,
  onSubmissionSuccess,
}) => {
  const currentPeriod = new Date().toISOString().slice(0, 7)
  const [createRecord, { isLoading, error }] = useCreateRecordMutation()

  const [category, setCategory] = useState(0)
  const [selectedFormId, setSelectedFormId] = useState<string>('')
  const [form, setForm] = useState({
    siteId: sites[0] ? String(sites[0].id) : '',
    period: currentPeriod,
    metricCode: 'diesel',
    metric: 'Diesel consumed (DG Sets / Fleet)',
    rawValue: '',
    rawUnit: 'Liters',
    notes: '',
  })
  const [proof, setProof] = useState<File | null>(null)
  const [clientHash, setClientHash] = useState<string>('')
  const [isHashing, setIsHashing] = useState<boolean>(false)
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({})
  const [successToast, setSuccessToast] = useState<string | null>(null)

  const handleFileChange = async (file: File | null) => {
    setProof(file)
    setClientHash('')
    if (!file) return

    setIsHashing(true)
    try {
      const buffer = await file.arrayBuffer()
      const digest = await crypto.subtle.digest('SHA-256', buffer)
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      setClientHash(hex)
    } catch (err) {
      console.error('Failed to compute client SHA-256 hash:', err)
    } finally {
      setIsHashing(false)
    }
  }

  const selectedForm = useMemo(() => {
    if (!selectedFormId) return null
    return publishedForms.find((f) => String(f.id) === String(selectedFormId)) || null
  }, [selectedFormId, publishedForms])

  const handleSelectPublishedForm = (formIdStr: string) => {
    setSelectedFormId(formIdStr)
    setCustomFieldValues({})
    setCustomFieldErrors({})
    if (!formIdStr) return

    const pForm = publishedForms.find((f) => String(f.id) === String(formIdStr))
    if (pForm) {
      setForm((prev) => ({
        ...prev,
        metricCode: pForm.metricCode,
        metric: pForm.title,
        rawUnit: pForm.defaultUnit,
        siteId: pForm.siteId ? String(pForm.siteId) : prev.siteId,
      }))
    }
  }

  const handleSelectMetric = (metric: MetricOption) => {
    setSelectedFormId('')
    setCustomFieldValues({})
    setCustomFieldErrors({})
    setForm((prev) => ({
      ...prev,
      metricCode: metric.code,
      metric: metric.label,
      rawUnit: metric.unit,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.siteId || !form.rawValue || !proof) return

    // Dynamic custom field validation via shared Zod schema
    if (selectedForm?.fields && selectedForm.fields.length > 0) {
      const valResult = validateDynamicFormData(selectedForm.fields, customFieldValues)
      if (!valResult.isValid) {
        setCustomFieldErrors(valResult.errors)
        return
      }
    }

    const payload = new FormData()
    payload.set('siteId', form.siteId)
    if (selectedFormId) payload.set('formId', selectedFormId)
    payload.set('period', form.period)
    payload.set('metricCode', form.metricCode)
    payload.set('metric', form.metric)
    payload.set('rawValue', form.rawValue)
    payload.set('rawUnit', form.rawUnit)
    payload.set('notes', form.notes)
    payload.set('evidence', proof)
    if (clientHash) {
      payload.set('clientHash', clientHash)
    }
    if (Object.keys(customFieldValues).length > 0) {
      payload.set('customData', JSON.stringify(customFieldValues))
    }

    try {
      await createRecord(payload).unwrap()
      setSuccessToast(`Measurement successfully recorded and submitted for supervisory review!`)
      setForm((prev) => ({ ...prev, rawValue: '', notes: '' }))
      setProof(null)
      setClientHash('')
      setSelectedFormId('')
      setCustomFieldValues({})
      setCustomFieldErrors({})
      if (onSubmissionSuccess) onSubmissionSuccess()
    } catch {
      // Error handled below via RTK mutation state
    }
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 2.5, mb: 4, borderColor: '#cbd5e1' }}>
      <Box sx={{ p: 3, bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
          Record Field Telemetry & Proof Voucher
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Statutory measurements require dual-stored cryptographic proof (PDF/image) and are automatically normalized using official SEBI & CEA emission factors.
        </Typography>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {successToast && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessToast(null)}>
            {successToast}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {'data' in (error as any) && typeof (error as any).data === 'object'
              ? (error as any).data.message
              : 'Failed to record measurement. Please check all fields.'}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Published Project Forms Bar */}
          {publishedForms.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f1f5f9', borderRadius: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DynamicFormOutlinedIcon sx={{ color: '#0d9488' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    Published Subsidiary Template:
                  </Typography>
                </Box>
                <TextField
                  select
                  size="small"
                  value={selectedFormId}
                  onChange={(e) => handleSelectPublishedForm(e.target.value)}
                  sx={{ minWidth: 260, bgcolor: '#ffffff' }}
                >
                  <MenuItem value="">-- Standard Telemetry Entry --</MenuItem>
                  {publishedForms.map((pf) => (
                    <MenuItem key={pf.id} value={String(pf.id)}>
                      {pf.title} ({pf.metricCode})
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Paper>
          )}

          {/* Metric Category Selector (if not using published form) */}
          {!selectedFormId && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1.5 }}>
                Select Measurement Metric:
              </Typography>
              <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {categories.map((cat, idx) => (
                  <Grid size={{ xs: 6, sm: 3 }} key={cat.name}>
                    <Button
                      fullWidth
                      variant={category === idx ? 'contained' : 'outlined'}
                      onClick={() => setCategory(idx)}
                      sx={{
                        fontWeight: 700,
                        textTransform: 'none',
                        bgcolor: category === idx ? '#0f172a' : 'transparent',
                        borderColor: '#cbd5e1',
                        color: category === idx ? '#ffffff' : '#475569',
                      }}
                    >
                      {cat.name}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              <Grid container spacing={1.5}>
                {categories[category].metrics.map((m) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={m.code}>
                    <CardActionArea
                      onClick={() => handleSelectMetric(m)}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        border: '1.5px solid',
                        borderColor: form.metricCode === m.code ? '#0d9488' : '#e2e8f0',
                        bgcolor: form.metricCode === m.code ? '#f0fdfa' : '#ffffff',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {m.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Statutory Unit: <strong>{m.unit}</strong>
                      </Typography>
                    </CardActionArea>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Operational Scope & Measurement Fields */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                label="Operational Leaf Site"
                fullWidth
                size="small"
                value={form.siteId}
                onChange={(e) => setForm({ ...form, siteId: e.target.value })}
                required
              >
                {sites.map((s) => (
                  <MenuItem key={s.id} value={String(s.id)}>
                    {s.name} ({s.region})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Reporting Period (YYYY-MM)"
                fullWidth
                size="small"
                value={form.period}
                onChange={(e) => setForm({ ...form, period: e.target.value })}
                required
                helperText="Statutory reporting month (e.g. 2026-03)"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Field Measurement Value"
                type="number"
                fullWidth
                size="small"
                value={form.rawValue}
                onChange={(e) => setForm({ ...form, rawValue: e.target.value })}
                required
                slotProps={{ htmlInput: { step: 'any', min: '0' } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Unit of Measurement"
                fullWidth
                size="small"
                value={form.rawUnit}
                onChange={(e) => setForm({ ...form, rawUnit: e.target.value })}
                required
                helperText="Normalized automatically on submission"
              />
            </Grid>

            {/* Dynamic Custom Form Fields (if published form selected) */}
            {selectedForm?.fields && selectedForm.fields.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 2 }}>
                    Project Specific Data Inputs ({selectedForm.title})
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedForm.fields.map((fld) => (
                      <Grid size={{ xs: 12, sm: 6 }} key={fld.id}>
                        {fld.type === 'checkbox' ? (
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={Boolean(customFieldValues[fld.name])}
                                onChange={(e) =>
                                  setCustomFieldValues({
                                    ...customFieldValues,
                                    [fld.name]: e.target.checked,
                                  })
                                }
                              />
                            }
                            label={fld.label}
                          />
                        ) : (
                          <TextField
                            fullWidth
                            size="small"
                            type={fld.type === 'number' ? 'number' : fld.type === 'date' ? 'date' : 'text'}
                            label={fld.label}
                            placeholder={fld.placeholder}
                            required={fld.required}
                            value={customFieldValues[fld.name] || ''}
                            onChange={(e) =>
                              setCustomFieldValues({
                                ...customFieldValues,
                                [fld.name]: e.target.value,
                              })
                            }
                            error={Boolean(customFieldErrors[fld.name])}
                            helperText={customFieldErrors[fld.name] || fld.description}
                            slotProps={{ inputLabel: fld.type === 'date' ? { shrink: true } : undefined }}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}

            {/* Mandatory Proof Attachment */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 3,
                  border: '2px dashed #cbd5e1',
                  borderRadius: 2,
                  bgcolor: '#ffffff',
                  textAlign: 'center',
                }}
              >
                <AttachFileRoundedIcon sx={{ fontSize: 32, color: '#0d9488', mb: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Mandatory Evidence Document (PDF or Image)
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  Supports utility invoices, weighbridge slips, meter calibration certificates (PDF, JPG, PNG, WEBP &le; 15MB)
                </Typography>
                <Button variant="outlined" component="label" sx={{ textTransform: 'none', fontWeight: 600 }}>
                  {proof ? proof.name : 'Select PDF / Image Proof File'}
                  <input
                    type="file"
                    hidden
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />
                </Button>

                {isHashing && (
                  <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: '#0d9488' }} />
                    <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 600 }}>
                      Computing cryptographic SHA-256 digest...
                    </Typography>
                  </Box>
                )}

                {clientHash && proof && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #99f6e4', textAlign: 'left' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                      <Chip
                        label="SHA-256 Pre-Upload Checksum"
                        size="small"
                        color="success"
                        sx={{ height: 22, fontSize: '0.675rem', fontWeight: 700 }}
                      />
                      <Typography variant="caption" sx={{ color: '#0f766e', fontWeight: 700 }}>
                        {proof.name} ({(proof.size / 1024).toFixed(1)} KB)
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        color: '#0f766e',
                        wordBreak: 'break-all',
                        display: 'block',
                        bgcolor: '#ffffff',
                        p: 1,
                        borderRadius: 1,
                        border: '1px solid #ccfbf1',
                        mt: 0.5,
                      }}
                    >
                      {clientHash}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.725rem', display: 'block', mt: 0.75 }}>
                      &bull; Digitally sealed in browser prior to transmission. Will be immutably stored in the database for independent auditor verification.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Site Notes & Operational Explanations"
                fullWidth
                multiline
                rows={2}
                size="small"
                placeholder="Include equipment operational notes or reason for spikes if applicable"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !proof || !form.rawValue}
              sx={{ bgcolor: '#0f172a', fontWeight: 700, px: 4, py: 1 }}
            >
              {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Submit Telemetry'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  )
}
