import React, { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import DynamicFormOutlinedIcon from '@mui/icons-material/DynamicFormOutlined'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import NumbersRoundedIcon from '@mui/icons-material/NumbersRounded'
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import ListRoundedIcon from '@mui/icons-material/ListRounded'
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded'
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined'
import {
  useCreateFormMutation,
  useGetFormsQuery,
  useGetSitesQuery,
  useToggleFormStatusMutation,
  type PublishedForm,
  type Site,
} from '../store/api'
import type { UserRole } from '../store/authSlice'
import { publishFormSchema, type FormField, type FormFieldType } from '@my-app/common'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '../store'
import { toggleFormStatusLocal } from '../store/dataSlice'

interface PublishedFormsManagerProps {
  currentRole: UserRole
}

const defaultTemplates: Array<{
  title: string
  pillar: 'environmental' | 'social' | 'governance'
  metricCode: string
  defaultUnit: string
  allowedUnits: string
  description: string
  fileInstruction: string
  fields: FormField[]
}> = [
  {
    title: 'Diesel Fuel Consumption & Generator Log',
    pillar: 'environmental',
    metricCode: 'diesel',
    defaultUnit: 'Liters',
    allowedUnits: 'Liters, Gallons, kL',
    description: 'Log diesel consumed by generators and heavy machinery with supplier invoice proof.',
    fileInstruction: 'Attach oil supplier invoice or fuel depot dispensation voucher (PDF/Image)',
    fields: [
      {
        id: 'field_1',
        name: 'vendor_email',
        label: 'Fuel Supplier / Vendor Email',
        type: 'email',
        required: true,
        placeholder: 'e.g. accounts@fuel-supplier.com',
        description: 'Authorized supplier email from invoice header',
      },
      {
        id: 'field_2',
        name: 'generator_id',
        label: 'Generator Machine ID / DG Set Tag',
        type: 'text',
        required: true,
        placeholder: 'e.g. DG-SET-04-NORTH',
        description: 'Physical equipment asset tag',
      },
      {
        id: 'field_3',
        name: 'operating_hours',
        label: 'Generator Run Hours This Month',
        type: 'number',
        required: true,
        min: 0,
        unit: 'hours',
        placeholder: 'e.g. 180',
        description: 'Hour meter delta reading',
      },
      {
        id: 'field_4',
        name: 'delivery_date',
        label: 'Fuel Delivery Date',
        type: 'date',
        required: true,
        placeholder: 'YYYY-MM-DD',
        description: 'Date voucher was signed',
      },
    ],
  },
  {
    title: 'Industrial Water Withdrawal & Discharge Log',
    pillar: 'environmental',
    metricCode: 'water',
    defaultUnit: 'kL',
    allowedUnits: 'kL, Liters, m3',
    description: 'Track municipal and borewell water withdrawal and treatment metrics.',
    fileInstruction: 'Attach water meter calibration certificate or municipal water bill (PDF/Image)',
    fields: [
      {
        id: 'field_1',
        name: 'meter_serial',
        label: 'Water Flow Meter Serial Number',
        type: 'text',
        required: true,
        placeholder: 'e.g. WFM-98442-B',
        description: 'Calibrated digital meter serial number',
      },
      {
        id: 'field_2',
        name: 'source_type',
        label: 'Primary Water Source',
        type: 'select',
        required: true,
        options: ['Groundwater Borewell', 'Municipal Water Grid', 'External Tanker Supply', 'Recycled Effluent'],
        placeholder: 'Select source',
        description: 'Origin category for SEBI ESG disclosure',
      },
      {
        id: 'field_3',
        name: 'authority_email',
        label: 'Local Pollution Board / Municipal Contact Email',
        type: 'email',
        required: false,
        placeholder: 'e.g. water.board@odisha.gov.in',
        description: 'Regulatory contact email for verification',
      },
    ],
  },
  {
    title: 'Workplace Safety & Incident Reporting Log',
    pillar: 'social',
    metricCode: 'lost_time_injuries',
    defaultUnit: 'incidents',
    allowedUnits: 'incidents, count',
    description: 'Statutory statutory safety incident log for site personnel with officer sign-off.',
    fileInstruction: 'Attach incident investigation report or safety officer sign-off sheet (PDF/Image)',
    fields: [
      {
        id: 'field_1',
        name: 'safety_officer_email',
        label: 'EHS Safety Officer Email',
        type: 'email',
        required: true,
        placeholder: 'e.g. safety.officer@meil.in',
        description: 'Certified site safety inspector work email',
      },
      {
        id: 'field_2',
        name: 'incident_location',
        label: 'Site Location / Work Zone',
        type: 'text',
        required: true,
        placeholder: 'e.g. Zone 3 Tunnel Section B',
        description: 'Physical work location of occurrence',
      },
      {
        id: 'field_3',
        name: 'incident_date',
        label: 'Date of Occurrence',
        type: 'date',
        required: true,
        placeholder: 'YYYY-MM-DD',
        description: 'Calendar date incident occurred',
      },
    ],
  },
]

const fieldTypeLabels: Record<FormFieldType, { label: string; icon: React.ReactNode }> = {
  text: { label: 'Single-line Text', icon: <TextFieldsRoundedIcon fontSize="small" /> },
  number: { label: 'Number / Quantity', icon: <NumbersRoundedIcon fontSize="small" /> },
  email: { label: 'Email Address', icon: <EmailOutlinedIcon fontSize="small" /> },
  date: { label: 'Date (YYYY-MM-DD)', icon: <CalendarTodayOutlinedIcon fontSize="small" /> },
  select: { label: 'Dropdown Selection', icon: <ListRoundedIcon fontSize="small" /> },
  textarea: { label: 'Multi-line Notes', icon: <TextFieldsRoundedIcon fontSize="small" /> },
  file: { label: 'Document / File Upload', icon: <AttachFileRoundedIcon fontSize="small" /> },
  checkbox: { label: 'Checkbox Toggle', icon: <CheckBoxOutlinedIcon fontSize="small" /> },
}

export const PublishedFormsManager: React.FC<PublishedFormsManagerProps> = ({ currentRole }) => {
  const dispatch = useDispatch<AppDispatch>()
  const cachedForms = useSelector((state: RootState) => state.data.forms)
  const cachedSites = useSelector((state: RootState) => state.data.sites)
  const { data: formsData, isLoading: formsLoading, refetch } = useGetFormsQuery()
  const { data: sitesData } = useGetSitesQuery()
  const [createForm, { isLoading: isCreating }] = useCreateFormMutation()
  const [toggleStatus] = useToggleFormStatusMutation()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  const [formState, setFormState] = useState<{
    title: string
    description: string
    pillar: 'environmental' | 'social' | 'governance'
    metricCode: string
    defaultUnit: string
    allowedUnitsStr: string
    requiresFileUpload: boolean
    fileInstruction: string
    siteId: number | ''
    fields: FormField[]
  }>({
    title: '',
    description: '',
    pillar: 'environmental',
    metricCode: 'diesel',
    defaultUnit: 'Liters',
    allowedUnitsStr: 'Liters, Gallons, kL',
    requiresFileUpload: true,
    fileInstruction: 'Attach supplier bill or calibration certificate (PDF/Image)',
    siteId: '',
    fields: [],
  })

  const forms: PublishedForm[] = useMemo(
    () => (cachedForms.length > 0 ? cachedForms : formsData?.data ?? []),
    [cachedForms, formsData?.data]
  )
  const sites: Site[] = useMemo(
    () => (cachedSites.length > 0 ? cachedSites : sitesData?.data ?? []),
    [cachedSites, sitesData?.data]
  )
  const isLoading = forms.length === 0 && formsLoading

  const handleApplyTemplate = (tmpl: (typeof defaultTemplates)[0]) => {
    setFormState({
      title: tmpl.title,
      pillar: tmpl.pillar,
      metricCode: tmpl.metricCode,
      defaultUnit: tmpl.defaultUnit,
      allowedUnitsStr: tmpl.allowedUnits,
      description: tmpl.description,
      fileInstruction: tmpl.fileInstruction,
      siteId: '',
      requiresFileUpload: true,
      fields: JSON.parse(JSON.stringify(tmpl.fields)),
    })
    setValidationErrors({})
  }

  const handleAddField = () => {
    const newId = `field_${Date.now()}`
    const newField: FormField = {
      id: newId,
      name: `custom_${formState.fields.length + 1}`,
      label: `Custom Field ${formState.fields.length + 1}`,
      type: 'text',
      required: false,
      description: '',
      placeholder: '',
      unit: '',
      options: [],
    }
    setFormState((prev) => ({
      ...prev,
      fields: [...prev.fields, newField],
    }))
  }

  const handleUpdateField = (index: number, updates: Partial<FormField>) => {
    setFormState((prev) => {
      const nextFields = [...prev.fields]
      const current = nextFields[index]
      if (!current) return prev
      nextFields[index] = { ...current, ...updates }
      return { ...prev, fields: nextFields }
    })
  }

  const handleRemoveField = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }))
  }

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})

    const allowedUnits = formState.allowedUnitsStr
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean)

    const payload = {
      title: formState.title,
      description: formState.description,
      pillar: formState.pillar,
      metricCode: formState.metricCode,
      defaultUnit: formState.defaultUnit,
      allowedUnits: allowedUnits.length > 0 ? allowedUnits : [formState.defaultUnit],
      requiresFileUpload: formState.requiresFileUpload,
      fileInstruction: formState.fileInstruction,
      siteId: formState.siteId ? Number(formState.siteId) : null,
      fields: formState.fields,
    }

    // Client-side Zod validation against shared schema
    const zodResult = publishFormSchema.safeParse(payload)
    if (!zodResult.success) {
      const flattened = zodResult.error.flatten()
      setValidationErrors(flattened.fieldErrors as Record<string, string[]>)
      setFeedback('Please fix the validation errors before publishing.')
      return
    }

    try {
      const res = await createForm(payload).unwrap()
      setFeedback(res.message)
      setDialogOpen(false)
      refetch()
    } catch (err: unknown) {
      setFeedback(
        typeof err === 'object' && err && 'data' in err && typeof err.data === 'object' && err.data && 'message' in err.data
          ? String(err.data.message)
          : 'Could not publish form.'
      )
    }
  }

  const handleToggle = async (form: PublishedForm) => {
    // Optimistic Redux state update for instant UI feedback
    dispatch(toggleFormStatusLocal({ id: form.id, isActive: !form.isActive }))
    try {
      await toggleStatus({ id: String(form.id), isActive: !form.isActive }).unwrap()
    } catch {
      // Rollback on failure
      dispatch(toggleFormStatusLocal({ id: form.id, isActive: form.isActive }))
      setFeedback('Could not update form status.')
    }
  }

  return (
    <Box sx={{ py: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {currentRole === 'subsidiary_head' ? 'Subsidiary Project Forms Studio' : 'Enterprise Forms Studio'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Publish customized data collection forms with any number of input fields (emails, numbers, dates, documents). Site Engineers submit according to these rules.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddCircleOutlineRoundedIcon />}
          onClick={() => {
            setFormState({
              title: '',
              description: '',
              pillar: 'environmental',
              metricCode: 'diesel',
              defaultUnit: 'Liters',
              allowedUnitsStr: 'Liters, Gallons, kL',
              requiresFileUpload: true,
              fileInstruction: 'Attach supplier bill or calibration certificate (PDF/Image)',
              siteId: '',
              fields: [],
            })
            setValidationErrors({})
            setDialogOpen(true)
          }}
          sx={{ fontWeight: 700 }}
        >
          Publish New Form Template
        </Button>
      </Box>

      {feedback && (
        <Alert severity="info" onClose={() => setFeedback(null)} sx={{ mb: 2.5 }}>
          {feedback}
        </Alert>
      )}

      {/* Forms List */}
      {isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <CircularProgress size={32} />
        </Box>
      ) : forms.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <DynamicFormOutlinedIcon sx={{ fontSize: 44, color: '#94a3b8', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
              No Custom Forms Published
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Publish your first form template so Site Engineers in your jurisdiction can submit structured records with custom parameters.
            </Typography>
            <Button variant="outlined" size="small" onClick={() => setDialogOpen(true)}>
              Create First Form
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2.5 }}>
          {forms.map((f) => {
            const customFields = f.fields || []
            return (
              <Card
                key={f.id}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  opacity: f.isActive ? 1 : 0.65,
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#cbd5e1' },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ pr: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 750, color: '#0f172a' }}>
                          {f.title}
                        </Typography>
                        <Chip
                          label={f.pillar}
                          size="small"
                          color={f.pillar === 'environmental' ? 'success' : f.pillar === 'social' ? 'info' : 'warning'}
                          sx={{ textTransform: 'capitalize', fontWeight: 600, height: 20, fontSize: '0.65rem' }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Scope: <strong>{f.siteName}</strong> · Metric: <code>{f.metricCode}</code> ({f.defaultUnit})
                      </Typography>
                    </Box>

                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={f.isActive}
                          onChange={() => handleToggle(f)}
                          color="success"
                        />
                      }
                      label={<Typography variant="caption" sx={{ fontWeight: 600 }}>{f.isActive ? 'Active' : 'Inactive'}</Typography>}
                      sx={{ m: 0 }}
                    />
                  </Box>

                  {f.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.825rem' }}>
                      {f.description}
                    </Typography>
                  )}

                  {/* Custom Fields Summary */}
                  <Box sx={{ mt: 1.5, p: 1.25, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <TuneRoundedIcon sx={{ fontSize: 13 }} /> Dynamic Inputs ({customFields.length}):
                    </Typography>
                    {customFields.length === 0 ? (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Standard measurements (Quantity & Evidence upload)
                      </Typography>
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {customFields.map((cf) => (
                          <Chip
                            key={cf.id}
                            label={`${cf.label} (${cf.type}${cf.required ? ' *' : ''})`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#ffffff' }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="caption" color="text.secondary">
                    Created on {new Date(f.createdAt).toLocaleDateString()}
                    {f.createdByName && <> by {f.createdByName}</>}
                  </Typography>
                </CardContent>
              </Card>
            )
          })}
        </Box>
      )}

      {/* Form Publishing Dialog with Dynamic Field Builder */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handlePublish}>
          <DialogTitle sx={{ fontWeight: 800 }}>
            Publish Dynamic Project Form Template
          </DialogTitle>

          <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Template Presets */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', mb: 1 }}>
                Pre-configured Industry Templates:
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {defaultTemplates.map((t) => (
                  <Button
                    key={t.metricCode}
                    size="small"
                    variant="outlined"
                    onClick={() => handleApplyTemplate(t)}
                    sx={{ textTransform: 'none', borderRadius: 2, fontSize: '0.75rem' }}
                  >
                    {t.title.split(' ')[0]} {t.title.split(' ')[1]} ({t.fields.length} inputs)
                  </Button>
                ))}
              </Stack>
            </Box>

            {/* General Settings */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a', mb: 1.5 }}>
              1. General Form Information
            </Typography>

            <Stack spacing={2} sx={{ mb: 3 }}>
              <TextField
                required
                fullWidth
                size="small"
                label="Form Title"
                placeholder="e.g. DG Set Generator Fuel Consumption Log"
                value={formState.title}
                onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                error={Boolean(validationErrors.title)}
                helperText={validationErrors.title?.[0]}
              />

              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Form Description / Purpose"
                placeholder="e.g. Record monthly fuel usage for stationary diesel generator sets."
                value={formState.description}
                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2 }}>
                <TextField
                  select
                  size="small"
                  label="ESG Pillar"
                  value={formState.pillar}
                  onChange={(e) =>
                    setFormState({ ...formState, pillar: e.target.value as 'environmental' | 'social' | 'governance' })
                  }
                >
                  <MenuItem value="environmental">Environmental</MenuItem>
                  <MenuItem value="social">Social</MenuItem>
                  <MenuItem value="governance">Governance</MenuItem>
                </TextField>

                <TextField
                  required
                  size="small"
                  label="Metric Code"
                  placeholder="e.g. diesel, water, waste"
                  value={formState.metricCode}
                  onChange={(e) => setFormState({ ...formState, metricCode: e.target.value })}
                />

                <TextField
                  required
                  size="small"
                  label="Default Unit"
                  placeholder="e.g. Liters, kL, kg"
                  value={formState.defaultUnit}
                  onChange={(e) => setFormState({ ...formState, defaultUnit: e.target.value })}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  size="small"
                  label="Allowed Unit Options (Comma-separated)"
                  value={formState.allowedUnitsStr}
                  onChange={(e) => setFormState({ ...formState, allowedUnitsStr: e.target.value })}
                />

                <TextField
                  select
                  size="small"
                  label="Assign to Specific Facility Site"
                  value={formState.siteId}
                  onChange={(e) => setFormState({ ...formState, siteId: e.target.value === '' ? '' : Number(e.target.value) })}
                >
                  <MenuItem value="">All Sites Under My Subsidiary</MenuItem>
                  {sites.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} ({s.region})
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            {/* Dynamic Custom Fields Builder */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  2. Dynamic Form Inputs & Validation Rules ({formState.fields.length})
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Add any custom input fields (emails, equipment tags, run hours, dates). All fields are validated simultaneously with Zod upon submission.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<AddCircleOutlineRoundedIcon />}
                onClick={handleAddField}
                sx={{ fontWeight: 650 }}
              >
                + Add Input Field
              </Button>
            </Box>

            {formState.fields.length === 0 ? (
              <Box sx={{ p: 3, border: '1px dashed #cbd5e1', borderRadius: 2, textAlign: 'center', bgcolor: '#f8fafc', mb: 3 }}>
                <TuneRoundedIcon sx={{ fontSize: 32, color: '#94a3b8', mb: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  No custom inputs added yet. Click <strong>"+ Add Input Field"</strong> above or apply a template to customize fields.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2} sx={{ mb: 3 }}>
                {formState.fields.map((field, idx) => (
                  <Card key={field.id} variant="outlined" sx={{ borderRadius: 2, bgcolor: '#fbfcfd', border: '1px solid #e2e8f0' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 750, color: '#0369a1', textTransform: 'uppercase' }}>
                          Field #{idx + 1}
                        </Typography>
                        <IconButton size="small" color="error" onClick={() => handleRemoveField(idx)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1.5fr 1fr' }, gap: 1.5, mb: 1.5 }}>
                        <TextField
                          required
                          size="small"
                          label="Field Label / Title"
                          placeholder="e.g. Fuel Supplier Email"
                          value={field.label}
                          onChange={(e) => {
                            const newLabel = e.target.value
                            const autoName = newLabel.toLowerCase().replace(/[^a-z0-9_]+/g, '_').slice(0, 40)
                            handleUpdateField(idx, { label: newLabel, name: field.name.startsWith('custom_') ? autoName || field.name : field.name })
                          }}
                        />

                        <TextField
                          select
                          size="small"
                          label="Input Type"
                          value={field.type}
                          onChange={(e) => handleUpdateField(idx, { type: e.target.value as FormFieldType })}
                        >
                          {(Object.keys(fieldTypeLabels) as FormFieldType[]).map((t) => (
                            <MenuItem key={t} value={t}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {fieldTypeLabels[t].icon}
                                {fieldTypeLabels[t].label}
                              </Box>
                            </MenuItem>
                          ))}
                        </TextField>

                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={field.required}
                              onChange={(e) => handleUpdateField(idx, { required: e.target.checked })}
                              color="primary"
                            />
                          }
                          label={<Typography variant="caption" sx={{ fontWeight: 600 }}>Required</Typography>}
                        />
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.5fr 1.5fr 1fr' }, gap: 1.5 }}>
                        <TextField
                          size="small"
                          label="Field Key (Internal ID)"
                          placeholder="e.g. vendor_email"
                          value={field.name}
                          onChange={(e) => handleUpdateField(idx, { name: e.target.value.replace(/[^a-zA-Z0-9_]/g, '') })}
                        />

                        <TextField
                          size="small"
                          label="Helper Description / Hint"
                          placeholder="e.g. Must match delivery challan"
                          value={field.description || ''}
                          onChange={(e) => handleUpdateField(idx, { description: e.target.value })}
                        />

                        {field.type === 'number' && (
                          <TextField
                            size="small"
                            label="Unit (Optional)"
                            placeholder="e.g. hours"
                            value={field.unit || ''}
                            onChange={(e) => handleUpdateField(idx, { unit: e.target.value })}
                          />
                        )}

                        {field.type === 'select' && (
                          <TextField
                            size="small"
                            label="Options (Comma-separated)"
                            placeholder="Option 1, Option 2, Option 3"
                            value={(field.options || []).join(', ')}
                            onChange={(e) =>
                              handleUpdateField(idx, {
                                options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                              })
                            }
                          />
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            {/* Live Form Preview Section */}
            {formState.fields.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px solid #bbf7d0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <PreviewOutlinedIcon sx={{ fontSize: 18, color: '#16a34a' }} />
                  <Typography variant="caption" sx={{ fontWeight: 750, color: '#15803d', textTransform: 'uppercase' }}>
                    Live Preview (How Site Engineers will view this form):
                  </Typography>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                  {formState.fields.map((f) => (
                    <Box key={f.id} sx={{ p: 1.5, bgcolor: '#ffffff', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                      <Typography variant="caption" sx={{ fontWeight: 650, color: '#0f172a', display: 'block' }}>
                        {f.label} {f.required && <span style={{ color: '#dc2626' }}>*</span>}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Type: {fieldTypeLabels[f.type]?.label || f.type} {f.unit ? `(${f.unit})` : ''}
                      </Typography>
                      {f.description && (
                        <Typography variant="caption" sx={{ color: '#64748b', fontStyle: 'italic', display: 'block' }}>
                          Hint: {f.description}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isCreating} sx={{ fontWeight: 700 }}>
              {isCreating ? <CircularProgress size={18} color="inherit" /> : 'Publish Form Template'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
