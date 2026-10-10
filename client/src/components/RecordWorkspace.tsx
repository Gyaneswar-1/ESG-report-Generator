import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined'
import DynamicFormOutlinedIcon from '@mui/icons-material/DynamicFormOutlined'
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import InputAdornment from '@mui/material/InputAdornment'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import { validateDynamicFormData } from '@my-app/common'
import {
  useCreateRecordMutation,
  useCreateSiteMutation,
  useGetFormsQuery,
  useGetMetricsQuery,
  useGetRecordAuditQuery,
  useGetRecordsQuery,
  useGetSitesQuery,
  useReviewRecordMutation,
  type EsgRecord,
} from '../store/api'
import type { RootState, AppDispatch } from '../store'
import { setRegion } from '../store/authSlice'
import { updateRecordStatus } from '../store/dataSlice'
import { PendingApprovalsManager } from './PendingApprovalsManager'
import { PublishedFormsManager } from './PublishedFormsManager'
import { BrsrReportStudio } from './BrsrReportStudio'

const currentPeriod = new Date().toISOString().slice(0, 7)
type MetricCode =
  | 'diesel'
  | 'electricity'
  | 'water'
  | 'total_waste'
  | 'recycled_waste'
  | 'lost_time_injuries'
  | 'working_hours'
  | 'other'

interface MetricOption {
  code: MetricCode
  label: string
  unit: string
}

const categories: { name: string; metrics: MetricOption[] }[] = [
  {
    name: 'Energy',
    metrics: [
      { code: 'diesel', label: 'Diesel consumed', unit: 'Liters' },
      { code: 'electricity', label: 'Electricity consumed', unit: 'kWh' },
    ],
  },
  {
    name: 'Water',
    metrics: [{ code: 'water', label: 'Water withdrawn', unit: 'kL' }],
  },
  {
    name: 'Waste',
    metrics: [
      { code: 'total_waste', label: 'Total waste generated', unit: 'kg' },
      { code: 'recycled_waste', label: 'Waste recycled', unit: 'kg' },
    ],
  },
  {
    name: 'People & safety',
    metrics: [
      { code: 'lost_time_injuries', label: 'Lost time injuries', unit: 'incidents' },
      { code: 'working_hours', label: 'Total working hours', unit: 'hours' },
    ],
  },
  {
    name: 'Custom / Other',
    metrics: [{ code: 'other', label: 'Other ESG measurement', unit: '' }],
  },
]

export function RecordWorkspace() {
  const { role, region, token } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  // Navigation tab for subsidiary_head and executive
  // 0: Submissions/Data, 1: Approvals, 2: Forms Studio, 3: Facilities
  const [workspaceTab, setWorkspaceTab] = useState(0)

  const [createRecord, { isLoading, isSuccess, error }] = useCreateRecordMutation()
  const [reviewRecord, { isLoading: reviewing, error: reviewError }] = useReviewRecordMutation()
  const [createSite, { isLoading: creatingSite, error: siteError }] = useCreateSiteMutation()

  // Redux Cached Data (instant zero-delay rendering)
  const cachedSites = useSelector((state: RootState) => state.data.sites)
  const cachedRecords = useSelector((state: RootState) => state.data.records)
  const cachedForms = useSelector((state: RootState) => state.data.forms)
  const cachedMetrics = useSelector((state: RootState) => state.data.metrics[region || 'all'])

  const { data: siteData, isLoading: loadingSitesQuery, isError: sitesError } = useGetSitesQuery()
  const { data: recordsData, isLoading: loadingRecordsQuery } = useGetRecordsQuery()
  const { data: formsData } = useGetFormsQuery()
  const { data: metricData } = useGetMetricsQuery(region || undefined, { skip: role !== 'executive' })

  const [selectedRecord, setSelectedRecord] = useState<EsgRecord | null>(null)
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null)
  const [hashVerified, setHashVerified] = useState<boolean | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const { data: auditData, isLoading: loadingAudit } = useGetRecordAuditQuery(
    selectedRecord?.id ?? '',
    { skip: !selectedRecord }
  )

  const sites = useMemo(
    () => (cachedSites.length > 0 ? cachedSites : siteData?.data ?? []),
    [cachedSites, siteData?.data]
  )
  const records = useMemo(
    () => (cachedRecords.length > 0 ? cachedRecords : recordsData?.data ?? []),
    [cachedRecords, recordsData?.data]
  )
  const publishedForms = useMemo(
    () => (cachedForms.length > 0 ? cachedForms : formsData?.data ?? []),
    [cachedForms, formsData?.data]
  )
  const regions = useMemo(() => [...new Set(sites.map((site) => site.region))].sort(), [sites])
  const activeMetrics = useMemo(
    () => (cachedMetrics && cachedMetrics.length > 0 ? cachedMetrics : metricData?.data ?? []),
    [cachedMetrics, metricData?.data]
  )

  const loadingSites = sites.length === 0 && loadingSitesQuery
  const loadingRecords = records.length === 0 && loadingRecordsQuery

  // Data Entry State for Engineer
  const [category, setCategory] = useState(0)
  const [selectedFormId, setSelectedFormId] = useState<string>('')
  const [form, setForm] = useState({
    siteId: '',
    period: currentPeriod,
    metricCode: 'diesel' as MetricCode,
    metric: 'Diesel consumed',
    rawValue: '',
    rawUnit: 'Liters',
    notes: '',
  })
  const [proof, setProof] = useState<File | null>(null)

  // Dialogs
  const [createSiteOpen, setCreateSiteOpen] = useState(false)
  const [siteForm, setSiteForm] = useState({ group: '', subsidiary: '', site: '', region: '' })

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((current) => ({ ...current, [field]: event.target.value }))

  const setMetric = (code: string) => {
    const item = categories.flatMap((cat) => cat.metrics).find((metric) => metric.code === code)
    if (!item) return
    setForm((current) => ({
      ...current,
      metricCode: code as MetricCode,
      metric: item.label,
      rawUnit: item.unit,
    }))
  }

  // Dynamic custom fields state for engineer data entry
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({})

  // Record review list filters for Subsidiary Head & CSO
  const [recordStatusFilter, setRecordStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [recordSearchQuery, setRecordSearchQuery] = useState('')
  const [recordSiteFilter, setRecordSiteFilter] = useState('')

  const selectedForm = useMemo(() => {
    if (!selectedFormId) return null
    return publishedForms.find((f) => String(f.id) === String(selectedFormId)) || null
  }, [selectedFormId, publishedForms])

  // When Site Engineer picks a published project form
  const handleSelectPublishedForm = (formIdStr: string) => {
    setSelectedFormId(formIdStr)
    setCustomFieldValues({})
    setCustomFieldErrors({})
    if (!formIdStr) return
    const pForm = publishedForms.find((f) => String(f.id) === String(formIdStr))
    if (pForm) {
      setForm((prev) => ({
        ...prev,
        metricCode: pForm.metricCode as MetricCode,
        metric: pForm.title,
        rawUnit: pForm.defaultUnit,
        siteId: pForm.siteId ? String(pForm.siteId) : prev.siteId,
      }))
    }
  }

  const recordCounts = useMemo(() => {
    return {
      all: records.length,
      pending: records.filter((r) => r.reviewStatus === 'pending').length,
      approved: records.filter((r) => r.reviewStatus === 'approved').length,
      rejected: records.filter((r) => r.reviewStatus === 'rejected').length,
    }
  }, [records])

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (recordStatusFilter !== 'all' && r.reviewStatus !== recordStatusFilter) {
        return false
      }
      if (recordSiteFilter && String(r.siteId) !== recordSiteFilter) {
        return false
      }
      if (recordSearchQuery.trim()) {
        const q = recordSearchQuery.toLowerCase().trim()
        const matchMetric = r.metric?.toLowerCase().includes(q)
        const matchSite = r.site?.toLowerCase().includes(q)
        const matchUser = r.enteredBy?.toLowerCase().includes(q)
        const matchPeriod = r.period?.toLowerCase().includes(q)
        if (!matchMetric && !matchSite && !matchUser && !matchPeriod) return false
      }
      return true
    })
  }, [records, recordStatusFilter, recordSiteFilter, recordSearchQuery])

  const recentRecords = useMemo(() => filteredRecords.slice(0, 100), [filteredRecords])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!role || !proof || !form.siteId || !form.rawValue) return

    // Validate dynamic custom fields with Zod simultaneously
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
    if (Object.keys(customFieldValues).length > 0) {
      payload.set('customData', JSON.stringify(customFieldValues))
    }

    try {
      await createRecord(payload).unwrap()
      setForm((current) => ({ ...current, rawValue: '', notes: '' }))
      setProof(null)
      setSelectedFormId('')
      setCustomFieldValues({})
      setCustomFieldErrors({})
    } catch {
      // error handled in UI
    }
  }

  const saveSite = async () => {
    try {
      const created = await createSite(siteForm).unwrap()
      setForm((current) => ({ ...current, siteId: String(created.data.id) }))
      setCreateSiteOpen(false)
      setSiteForm({ group: '', subsidiary: '', site: '', region: '' })
    } catch {
      // handled in dialog
    }
  }

  const errorMessage = (value: unknown, fallback: string) => {
    if (
      typeof value === 'object' &&
      value &&
      'data' in value &&
      typeof value.data === 'object' &&
      value.data &&
      'message' in value.data
    ) {
      return String(value.data.message)
    }
    return fallback
  }

  const canEnter = role === 'engineer'

  const decideReview = async (status: 'approved' | 'rejected') => {
    if (!selectedRecord) return
    const recId = selectedRecord.id
    const note = reviewNote
    try {
      // Optimistic Redux state update for instant UI feedback
      dispatch(updateRecordStatus({ id: recId, reviewStatus: status, reviewNote: note }))
      setSelectedRecord(null)
      setReviewNote('')
      await reviewRecord({ id: recId, status, note }).unwrap()
    } catch {
      // error handled
    }
  }

  const openEvidence = async (evidenceId: number) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1/'}evidence/${evidenceId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!response.ok) return
    const blob = await response.blob()
    const bytes = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
    const actualHash = [...new Uint8Array(bytes)]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('')
    setHashVerified(actualHash === response.headers.get('X-Content-SHA256'))
    setEvidencePreview(URL.createObjectURL(blob))
  }

  useEffect(() => {
    return () => {
      if (evidencePreview) URL.revokeObjectURL(evidencePreview)
    }
  }, [evidencePreview])

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
      {/* Executive Multi-Site / Region Toggle & Dynamic Roll-Up Dashboard */}
      {role === 'executive' && (
        <Box sx={{ mb: 4 }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Executive Roll-Up & Statutory Disclosures
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dynamically aggregated SUM() across all reporting leaf nodes (250+ MEIL projects).
              </Typography>
            </Box>

            {/* Component 3: The Multi-Site / Regional Toggle */}
            <TextField
              select
              size="small"
              label="Jurisdiction / Region"
              value={region}
              onChange={(event) => dispatch(setRegion(event.target.value))}
              sx={{ minWidth: 230, bgcolor: '#ffffff' }}
            >
              <MenuItem value="">All MEIL Corporate Projects</MenuItem>
              {regions.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Clickable Metric Cards opening Slide-Over Audit Drawer */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {activeMetrics.slice(0, 4).map((metric) => (
              <Card
                key={`${metric.metricCode}-${metric.period}`}
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => {
                    const match = records.find((r) => r.metricCode === metric.metricCode)
                    if (match) setSelectedRecord(match)
                  }}
                  sx={{ p: 2 }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {metric.metric} · {metric.period}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', my: 0.5 }}>
                    {metric.total.toLocaleString()}{' '}
                    <Typography component="span" variant="body2" color="text.secondary">
                      {metric.unit}
                    </Typography>
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      From {metric.siteCount} sites
                    </Typography>
                    <Chip label="Audit Vault" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                  </Box>
                </CardActionArea>
              </Card>
            ))}
            {activeMetrics.length === 0 && (
              <Alert severity="info" sx={{ gridColumn: '1 / -1' }}>
                No records found for this regional scope. Switch region or wait for Site Engineer submissions.
              </Alert>
            )}
          </Box>
        </Box>
      )}

      {/* Role-Specific Workspace Navigation Tabs */}
      {(role === 'subsidiary_head' || role === 'executive') && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={workspaceTab} onChange={(_e, v) => setWorkspaceTab(v)}>
            <Tab
              icon={<ListAltRoundedIcon fontSize="small" />}
              iconPosition="start"
              label={role === 'subsidiary_head' ? 'Submissions Review' : 'ESG Records Ledger'}
            />
            <Tab
              icon={<SupervisorAccountOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label={role === 'subsidiary_head' ? 'Engineer Approvals' : 'Subsidiary Head Approvals'}
            />
            {role === 'subsidiary_head' && (
              <Tab
                icon={<DynamicFormOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label="Published Project Forms"
              />
            )}
            {role === 'executive' && (
              <Tab
                icon={<AssessmentOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label="Organization & Facilities"
              />
            )}
            {role === 'executive' && (
              <Tab
                icon={<PictureAsPdfOutlinedIcon fontSize="small" />}
                iconPosition="start"
                label="SEBI BRSR Annexure-I Report"
              />
            )}
          </Tabs>
        </Box>
      )}

      {/* Tab View 1: Approvals Manager */}
      {(role === 'subsidiary_head' || role === 'executive') && workspaceTab === 1 && (
        <PendingApprovalsManager currentRole={role} />
      )}

      {/* Tab View 2: Published Forms Studio for Subsidiary Head */}
      {role === 'subsidiary_head' && workspaceTab === 2 && (
        <PublishedFormsManager currentRole={role} />
      )}

      {/* Tab View 3: Organization & Facility Setup for Executive */}
      {role === 'executive' && workspaceTab === 2 && (
        <Box sx={{ py: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Enterprise Hierarchy & Facilities
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tree structure: Group → Subsidiary → Site. Measurements are only recorded at the leaf site level.
              </Typography>
            </Box>
            <Button variant="contained" onClick={() => setCreateSiteOpen(true)}>
              Add New Facility
            </Button>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
            {sites.map((s) => (
              <Card key={s.id} variant="outlined" sx={{ borderRadius: 2.5 }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {s.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Region: {s.region}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Subsidiary: <strong>{s.subsidiary}</strong>
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Group: {s.group}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Tab View 4: SEBI BRSR Annexure-I Studio for Executive */}
      {role === 'executive' && workspaceTab === 3 && (
        <Box sx={{ py: 1 }}>
          <BrsrReportStudio isEmbedded={true} />
        </Box>
      )}

      {/* Main Records / Data Entry Tab (Default tab 0 for everyone, or for engineer/auditor) */}
      {((role !== 'subsidiary_head' && role !== 'executive') || workspaceTab === 0) && (
        <>
          <Stack
            direction="row"
            sx={{ mb: 3, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 0.5 }}>
                {canEnter
                  ? 'Site ESG Data Entry'
                  : role === 'subsidiary_head'
                  ? 'Project Submissions Review'
                  : role === 'auditor'
                  ? 'Assurance Vault & Audit Ledger'
                  : 'Enterprise Disclosures Ledger'}
              </Typography>
              <Typography color="text.secondary">
                {canEnter
                  ? 'Input site measurements with required PDF/image proof. Stored in SEBI units.'
                  : role === 'subsidiary_head'
                  ? 'Review site submissions, check attached utility bills, and approve or reject data rows.'
                  : role === 'auditor'
                  ? 'Inspect immutable cryptographic SHA-256 hashes, conversion formulas, and receipt documents.'
                  : 'Browse verified records across facilities and inspect cryptographic hashes.'}
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: canEnter ? 'minmax(0, 1.25fr) minmax(320px, 0.75fr)' : '1fr',
              },
              gap: 3,
              alignItems: 'start',
            }}
          >
            {/* Component 1: The 'Smart' Data Entry Form for Site Engineer */}
            {canEnter && (
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}>
                <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
                    <AddCircleOutlineRoundedIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 750 }}>
                      New ESG Measurement Entry
                    </Typography>
                  </Stack>

                  {/* Published Forms Selector from Subsidiary Head */}
                  {publishedForms.length > 0 && (
                    <Box sx={{ mb: 2.5, p: 2, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #ccfbf1' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#0f766e', display: 'block', mb: 1 }}>
                        Dynamic Forms Published by Your Subsidiary Head:
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Select Form Template (Optional)"
                        value={selectedFormId}
                        onChange={(e) => handleSelectPublishedForm(e.target.value)}
                        sx={{ bgcolor: '#ffffff' }}
                      >
                        <MenuItem value="">Use Standard SEBI Principles Form</MenuItem>
                        {publishedForms.map((pf) => (
                          <MenuItem key={pf.id} value={pf.id}>
                            {pf.title} ({pf.siteName}) · {pf.pillar}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  )}

                  {sitesError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Could not load facility assignments. Check backend connectivity.
                    </Alert>
                  )}

                  {sites.length === 0 && !loadingSites && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      No facility is assigned to your account yet. Complete your profile or contact your Subsidiary Head.
                    </Alert>
                  )}

                  <Box component="form" onSubmit={submit} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                    <TextField
                      select
                      required
                      label="Site Facility"
                      value={form.siteId}
                      onChange={update('siteId')}
                      disabled={loadingSites}
                    >
                      {sites.map((site) => (
                        <MenuItem key={site.id} value={site.id}>
                          {site.name} · {site.region}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      required
                      label="Reporting Month"
                      type="month"
                      value={form.period}
                      onChange={update('period')}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />

                    {/* SEBI Principles Category Tabs */}
                    <Box sx={{ gridColumn: { sm: '1 / -1' }, borderBottom: 1, borderColor: 'divider' }}>
                      <Tabs
                        value={category}
                        onChange={(_event, next) => {
                          setCategory(next)
                          setMetric(categories[next].metrics[0].code)
                        }}
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        {categories.map((item) => (
                          <Tab key={item.name} label={item.name} sx={{ fontSize: '0.8125rem', fontWeight: 600 }} />
                        ))}
                      </Tabs>
                    </Box>

                    <TextField
                      select
                      required
                      label="Metric"
                      value={form.metricCode}
                      onChange={(event) => setMetric(event.target.value)}
                    >
                      {categories[category].metrics.map((metric) => (
                        <MenuItem key={metric.code} value={metric.code}>
                          {metric.label}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      required
                      label="Raw Quantity Entered"
                      type="number"
                      placeholder="e.g. 5000"
                      value={form.rawValue}
                      onChange={update('rawValue')}
                      slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                    />

                    <TextField
                      required
                      label="Raw Unit"
                      placeholder="e.g. Liters, kWh, kg"
                      value={form.rawUnit}
                      onChange={update('rawUnit')}
                    />

                    <TextField
                      label="Operational Notes / Equipment Reference"
                      placeholder="e.g. Generator DG-04 diesel consumption"
                      value={form.notes}
                      onChange={update('notes')}
                      sx={{ gridColumn: { sm: '1 / -1' } }}
                    />

                    {/* Dynamic Custom Parameters Defined by Subsidiary Head */}
                    {selectedForm?.fields && selectedForm.fields.length > 0 && (
                      <Box
                        sx={{
                          gridColumn: { sm: '1 / -1' },
                          p: 2,
                          bgcolor: '#f0fdfa',
                          borderRadius: 2,
                          border: '1px solid #ccfbf1',
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 750,
                            color: '#0f766e',
                            mb: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                          }}
                        >
                          <TuneRoundedIcon fontSize="small" /> Required Parameters Configured by Subsidiary Head ({selectedForm.fields.length}):
                        </Typography>

                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                          {selectedForm.fields.map((field) => {
                            const err = customFieldErrors[field.name]

                            if (field.type === 'select') {
                              return (
                                <TextField
                                  key={field.id}
                                  select
                                  fullWidth
                                  size="small"
                                  required={field.required}
                                  label={`${field.label}${field.required ? ' *' : ''}`}
                                  value={customFieldValues[field.name] || ''}
                                  onChange={(e) => {
                                    setCustomFieldValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                                    if (customFieldErrors[field.name]) {
                                      setCustomFieldErrors((prev) => {
                                        const c = { ...prev }
                                        delete c[field.name]
                                        return c
                                      })
                                    }
                                  }}
                                  error={Boolean(err)}
                                  helperText={err || field.description}
                                >
                                  <MenuItem value="">Choose option</MenuItem>
                                  {(field.options || []).map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                      {opt}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              )
                            }

                            if (field.type === 'date') {
                              return (
                                <TextField
                                  key={field.id}
                                  fullWidth
                                  size="small"
                                  type="date"
                                  required={field.required}
                                  label={`${field.label}${field.required ? ' *' : ''}`}
                                  value={customFieldValues[field.name] || ''}
                                  onChange={(e) => {
                                    setCustomFieldValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                                    if (customFieldErrors[field.name]) {
                                      setCustomFieldErrors((prev) => {
                                        const c = { ...prev }
                                        delete c[field.name]
                                        return c
                                      })
                                    }
                                  }}
                                  slotProps={{ inputLabel: { shrink: true } }}
                                  error={Boolean(err)}
                                  helperText={err || field.description}
                                />
                              )
                            }

                            if (field.type === 'checkbox') {
                              return (
                                <Box key={field.id} sx={{ display: 'flex', alignItems: 'center' }}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={Boolean(customFieldValues[field.name])}
                                        onChange={(e) =>
                                          setCustomFieldValues((prev) => ({ ...prev, [field.name]: e.target.checked }))
                                        }
                                      />
                                    }
                                    label={<Typography variant="body2" sx={{ fontWeight: 600 }}>{field.label}</Typography>}
                                  />
                                </Box>
                              )
                            }

                            return (
                              <TextField
                                key={field.id}
                                fullWidth
                                size="small"
                                multiline={field.type === 'textarea'}
                                rows={field.type === 'textarea' ? 2 : 1}
                                type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
                                required={field.required}
                                label={`${field.label}${field.required ? ' *' : ''}`}
                                placeholder={field.placeholder || (field.type === 'email' ? 'e.g. name@domain.com' : '')}
                                value={customFieldValues[field.name] ?? ''}
                                onChange={(e) => {
                                  setCustomFieldValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                                  if (customFieldErrors[field.name]) {
                                    setCustomFieldErrors((prev) => {
                                      const c = { ...prev }
                                      delete c[field.name]
                                      return c
                                    })
                                  }
                                }}
                                error={Boolean(err)}
                                helperText={err || (field.unit ? `Unit: ${field.unit}` : field.description)}
                                slotProps={
                                  field.type === 'email'
                                    ? {
                                        input: {
                                          startAdornment: (
                                            <InputAdornment position="start">
                                              <EmailOutlinedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                                            </InputAdornment>
                                          ),
                                        },
                                      }
                                    : undefined
                                }
                              />
                            )
                          })}
                        </Box>
                      </Box>
                    )}

                    {/* Unit Normalization Interceptor Notice */}
                    {form.rawValue !== '' && (
                      <Alert severity="info" sx={{ gridColumn: { sm: '1 / -1' } }}>
                        {form.metricCode === 'diesel' && ['liters', 'liter', 'l'].includes(form.rawUnit.toLowerCase())
                          ? `SEBI Normalization Interceptor: ${((Number(form.rawValue) * 2.68) / 1000).toFixed(4)} MT CO2e (Formula: liters × 2.68 ÷ 1,000)`
                          : form.metricCode === 'electricity' && ['mwh', 'megawatt-hours'].includes(form.rawUnit.toLowerCase())
                          ? `SEBI Normalization Interceptor: ${(Number(form.rawValue) * 1000).toLocaleString()} kWh (Formula: MWh × 1,000)`
                          : form.metricCode === 'water' && ['liters', 'liter', 'l'].includes(form.rawUnit.toLowerCase())
                          ? `SEBI Normalization Interceptor: ${(Number(form.rawValue) / 1000).toLocaleString()} kL (Formula: liters ÷ 1,000)`
                          : ['total_waste', 'recycled_waste'].includes(form.metricCode) && ['kg', 'kilograms'].includes(form.rawUnit.toLowerCase())
                          ? `SEBI Normalization Interceptor: ${(Number(form.rawValue) / 1000).toLocaleString()} t (Formula: kg ÷ 1,000)`
                          : `Stored as: ${form.rawValue} ${form.rawUnit}`}
                      </Alert>
                    )}

                    {/* File Upload Requirement */}
                    <Box sx={{ gridColumn: { sm: '1 / -1' }, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                      <Button
                        component="label"
                        variant={proof ? 'outlined' : 'contained'}
                        color={proof ? 'success' : 'primary'}
                        startIcon={proof ? <CloudDoneOutlinedIcon /> : <AttachFileRoundedIcon />}
                      >
                        {proof ? `Attached: ${proof.name}` : 'Attach Proof Bill (PDF / Image)'}
                        <input
                          type="file"
                          hidden
                          accept="application/pdf,image/png,image/jpeg,image/webp"
                          onChange={(e) => setProof(e.target.files?.[0] ?? null)}
                        />
                      </Button>
                      <Typography variant="caption" color="text.secondary">
                        {proof
                          ? `${(proof.size / 1024).toFixed(1)} KB · Ready to hash & upload`
                          : 'Mandatory: Upload utility invoice, calibration sheet, or receipt (PDF/PNG/JPG)'}
                      </Typography>
                    </Box>

                    {error && (
                      <Alert severity="error" icon={<LockOutlinedIcon />} sx={{ gridColumn: { sm: '1 / -1' } }}>
                        {errorMessage(error, 'Submission rejected by IIM-A Guardrail or validation system.')}
                      </Alert>
                    )}

                    {isSuccess && (
                      <Alert severity="success" sx={{ gridColumn: { sm: '1 / -1' } }}>
                        Measurement record and proof hash stored successfully in the vault!
                      </Alert>
                    )}

                    {/* Submit Button locked if proof is missing when value > 0 */}
                    <Box sx={{ gridColumn: { sm: '1 / -1' }, mt: 1 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={isLoading || !form.siteId || !form.rawValue || !proof}
                        sx={{ minHeight: 46, fontWeight: 700 }}
                      >
                        {isLoading ? <CircularProgress size={20} color="inherit" /> : 'Record Measurement & Vault Proof'}
                      </Button>
                      {!proof && Number(form.rawValue) > 0 && (
                        <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                          * Attach proof file to unlock submission.
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Submissions / Records Table or Cards */}
            {(role === 'subsidiary_head' || role === 'executive') && (
              <Box
                sx={{
                  gridColumn: '1 / -1',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                  gap: 2,
                  mb: 1,
                }}
              >
                <Card
                  variant="outlined"
                  onClick={() => setRecordStatusFilter('all')}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2.5,
                    border: recordStatusFilter === 'all' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                    bgcolor: recordStatusFilter === 'all' ? '#eff6ff' : '#ffffff',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: '#93c5fd' },
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                      All Submissions
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                      {recordCounts.all}
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  variant="outlined"
                  onClick={() => setRecordStatusFilter('pending')}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2.5,
                    border: recordStatusFilter === 'pending' ? '2px solid #d97706' : '1px solid #e2e8f0',
                    bgcolor: recordStatusFilter === 'pending' ? '#fffbeb' : '#ffffff',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: '#fcd34d' },
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ fontWeight: 650, color: '#d97706', textTransform: 'uppercase' }}>
                      Pending Review
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#b45309', mt: 0.5 }}>
                      {recordCounts.pending}
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  variant="outlined"
                  onClick={() => setRecordStatusFilter('approved')}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2.5,
                    border: recordStatusFilter === 'approved' ? '2px solid #16a34a' : '1px solid #e2e8f0',
                    bgcolor: recordStatusFilter === 'approved' ? '#f0fdf4' : '#ffffff',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: '#86efac' },
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ fontWeight: 650, color: '#16a34a', textTransform: 'uppercase' }}>
                      Approved Entries
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
                      {recordCounts.approved}
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  variant="outlined"
                  onClick={() => setRecordStatusFilter('rejected')}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 2.5,
                    border: recordStatusFilter === 'rejected' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                    bgcolor: recordStatusFilter === 'rejected' ? '#fef2f2' : '#ffffff',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: '#fca5a5' },
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="caption" sx={{ fontWeight: 650, color: '#dc2626', textTransform: 'uppercase' }}>
                      Rejected Submissions
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#b91c1c', mt: 0.5 }}>
                      {recordCounts.rejected}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(15,23,42,0.04)', gridColumn: canEnter ? undefined : '1 / -1' }}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 750 }}>
                    {canEnter
                      ? 'My Recent Site Submissions'
                      : role === 'subsidiary_head'
                      ? 'Subsidiary Project Submissions Directory'
                      : 'Disclosures & Evidence Vault'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {filteredRecords.length} records shown ({records.length} total in scope)
                  </Typography>
                </Box>

                {/* Status Filter Tabs & Search Controls for Subsidiary Head & CSO */}
                {(role === 'subsidiary_head' || role === 'executive') && (
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                    <Tabs
                      value={recordStatusFilter}
                      onChange={(_e, v) => setRecordStatusFilter(v)}
                      sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 650 } }}
                    >
                      <Tab value="all" label={`All (${recordCounts.all})`} />
                      <Tab value="pending" label={`Pending (${recordCounts.pending})`} />
                      <Tab value="approved" label={`Approved (${recordCounts.approved})`} />
                      <Tab value="rejected" label={`Rejected (${recordCounts.rejected})`} />
                    </Tabs>

                    <Stack direction="row" spacing={1.5} sx={{ py: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                      <TextField
                        select
                        size="small"
                        label="Facility Filter"
                        value={recordSiteFilter}
                        onChange={(e) => setRecordSiteFilter(e.target.value)}
                        sx={{ minWidth: 150 }}
                      >
                        <MenuItem value="">All Assigned Sites</MenuItem>
                        {sites.map((s) => (
                          <MenuItem key={s.id} value={String(s.id)}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        size="small"
                        placeholder="Search metric, site, user..."
                        value={recordSearchQuery}
                        onChange={(e) => setRecordSearchQuery(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchRoundedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                        sx={{ minWidth: 180 }}
                      />
                    </Stack>
                  </Box>
                )}

                {canEnter && (
                  <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
                    <strong>Note:</strong> Records below are displayed with your original entered units (
                    <code>Liters, kg, kWh</code>) alongside the normalized SEBI compliance equivalent.
                  </Alert>
                )}

                {loadingRecords ? (
                  <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : recentRecords.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                    {recordStatusFilter === 'all'
                      ? 'No recorded ESG measurements found in this scope.'
                      : `No submissions with status "${recordStatusFilter}".`}
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {recentRecords.map((record) => (
                      <Button
                        key={record.id}
                        variant="outlined"
                        onClick={() => setSelectedRecord(record)}
                        sx={{
                          p: 1.75,
                          borderRadius: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          textAlign: 'left',
                          borderColor:
                            record.reviewStatus === 'pending'
                              ? '#fde68a'
                              : record.reviewStatus === 'rejected'
                              ? '#fecaca'
                              : '#e2e8f0',
                          bgcolor: record.reviewStatus === 'pending' ? '#fffdf5' : '#ffffff',
                          color: 'text.primary',
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                        }}
                      >
                        <Box sx={{ minWidth: 0, mr: 1.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.9rem' }}>
                              {record.metric}
                            </Typography>
                            <Chip
                              label={record.pillar}
                              size="small"
                              variant="outlined"
                              sx={{ height: 18, fontSize: '0.625rem' }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {record.site} · {record.period} · Entered by {record.enteredBy}
                            {record.reviewedBy && <> · Reviewed by {record.reviewedBy}</>}
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                            {record.rawValue} {record.rawUnit}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#0284c7', display: 'block', fontWeight: 600 }}>
                            SEBI: {record.value} {record.unit}
                          </Typography>
                          <Chip
                            icon={
                              record.reviewStatus === 'approved'
                                ? <CheckCircleOutlineRoundedIcon sx={{ fontSize: '12px !important' }} />
                                : record.reviewStatus === 'rejected'
                                ? <HighlightOffRoundedIcon sx={{ fontSize: '12px !important' }} />
                                : <HourglassEmptyRoundedIcon sx={{ fontSize: '12px !important' }} />
                            }
                            label={
                              record.reviewStatus === 'approved'
                                ? 'Approved'
                                : record.reviewStatus === 'rejected'
                                ? 'Rejected'
                                : 'Pending Review'
                            }
                            size="small"
                            color={
                              record.reviewStatus === 'approved'
                                ? 'success'
                                : record.reviewStatus === 'rejected'
                                ? 'error'
                                : 'warning'
                            }
                            sx={{ height: 20, fontSize: '0.675rem', fontWeight: 650, mt: 0.25 }}
                          />
                        </Box>
                      </Button>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Box>
        </>
      )}

      {/* Component 2: The Slide-Over Audit Drawer */}
      <Drawer
        anchor="right"
        open={Boolean(selectedRecord)}
        onClose={() => {
          setSelectedRecord(null)
          setEvidencePreview(null)
          setHashVerified(null)
        }}
      >
        {selectedRecord && (
          <Box sx={{ width: { xs: '100vw', sm: 480 }, p: 3, display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
              <FactCheckOutlinedIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Audit Trail & Evidence Vault
              </Typography>
            </Stack>

            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
              {selectedRecord.metric}
            </Typography>

            <Stack divider={<Divider flexItem />} spacing={0.5}>
              <Detail label="Facility Site & Period" value={`${selectedRecord.site} · ${selectedRecord.period}`} />
              <Detail
                label="Raw Inputted Value (Site Unit)"
                value={`${selectedRecord.rawValue} ${selectedRecord.rawUnit}`}
              />
              <Detail
                label="Normalized SEBI Value (Database Stored)"
                value={`${selectedRecord.value} ${selectedRecord.unit}`}
              />
              <Detail
                label="Mathematical Normalization Formula"
                value={selectedRecord.formula ?? 'Direct SEBI 1:1 reporting unit'}
              />
              <Detail
                label="Entered By & Timestamp"
                value={`${selectedRecord.enteredBy} (${selectedRecord.role}) · ${new Date(
                  selectedRecord.createdAt
                ).toLocaleString()}`}
              />
              <Detail
                label="Cryptographic SHA-256 Hash"
                value={selectedRecord.evidenceHash || 'No hash recorded'}
              />
              <Detail
                label="Review & Authorization Status"
                value={`${selectedRecord.reviewStatus.toUpperCase()}${
                  selectedRecord.reviewedBy ? ` by ${selectedRecord.reviewedBy}` : ''
                }`}
              />
              {selectedRecord.reviewNote && (
                <Detail label="Reviewer Notes" value={selectedRecord.reviewNote} />
              )}
            </Stack>

            {/* Custom Dynamic Form Inputs (if present) */}
            {selectedRecord.customData && Object.keys(selectedRecord.customData).length > 0 && (
              <Box sx={{ mt: 2.5, p: 2, bgcolor: '#f0fdfa', borderRadius: 2, border: '1px solid #ccfbf1' }}>
                <Typography variant="caption" sx={{ fontWeight: 750, color: '#0f766e', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                  <TuneRoundedIcon sx={{ fontSize: 14 }} /> Dynamic Form Parameters Submitted:
                </Typography>
                <Stack spacing={0.75}>
                  {Object.entries(selectedRecord.customData).map(([key, val]) => (
                    <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5, borderBottom: '1px dashed #e2e8f0' }}>
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

            {hashVerified !== null && (
              <Alert
                severity={hashVerified ? 'success' : 'error'}
                icon={<VerifiedUserOutlinedIcon />}
                sx={{ mt: 2 }}
              >
                {hashVerified
                  ? 'Cryptographic SHA-256 hash verified against document contents.'
                  : 'Hash mismatch detected! Document may have been modified.'}
              </Alert>
            )}

            {/* Subsidiary Head / Executive Action on Record */}
            {(role === 'subsidiary_head' || role === 'executive') && (
              <Box sx={{ mt: 2.5, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 750, mb: 1, color: '#0f172a' }}>
                  Reviewer Verification Decision
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Review Note (Optional)"
                  placeholder="e.g. Invoiced quantity matches meter calibration certificate."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  sx={{ bgcolor: '#ffffff', mb: 1.5 }}
                />
                {reviewError && (
                  <Alert severity="error" sx={{ mb: 1.5 }}>
                    {errorMessage(reviewError, 'Could not save review decision.')}
                  </Alert>
                )}
                <Stack direction="row" spacing={1}>
                  {selectedRecord.reviewStatus === 'pending' && (
                    <>
                      <Button
                        fullWidth
                        color="error"
                        variant="outlined"
                        disabled={reviewing}
                        onClick={() => decideReview('rejected')}
                      >
                        Reject Entry
                      </Button>
                      <Button
                        fullWidth
                        color="success"
                        variant="contained"
                        disabled={reviewing}
                        onClick={() => decideReview('approved')}
                        sx={{ fontWeight: 700 }}
                      >
                        Approve Entry
                      </Button>
                    </>
                  )}

                  {selectedRecord.reviewStatus === 'approved' && (
                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      disabled={reviewing}
                      onClick={() => decideReview('rejected')}
                    >
                      Revoke Approval / Reject Entry
                    </Button>
                  )}

                  {selectedRecord.reviewStatus === 'rejected' && (
                    <Button
                      fullWidth
                      color="success"
                      variant="contained"
                      disabled={reviewing}
                      onClick={() => decideReview('approved')}
                      sx={{ fontWeight: 700 }}
                    >
                      Re-Approve Entry
                    </Button>
                  )}
                </Stack>
              </Box>
            )}

            {/* Attached Proof Document Preview & Cloudinary Link */}
            {selectedRecord.evidenceId && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Physical Proof Document
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => openEvidence(selectedRecord.evidenceId)}
                    startIcon={<AttachFileRoundedIcon />}
                  >
                    Verify & Preview Receipt
                  </Button>
                  {selectedRecord.cloudinaryUrl && (
                    <Button
                      variant="outlined"
                      size="small"
                      href={selectedRecord.cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<OpenInNewRoundedIcon />}
                    >
                      Cloudinary Asset
                    </Button>
                  )}
                </Stack>

                {evidencePreview && (
                  <Box
                    component="iframe"
                    title="Evidence Document Preview"
                    src={evidencePreview}
                    sx={{
                      width: '100%',
                      height: 400,
                      border: '1px solid #e2e8f0',
                      borderRadius: 2,
                    }}
                  />
                )}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Audit Log Trail */}
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Immutable Audit Events
            </Typography>
            {loadingAudit ? (
              <CircularProgress size={20} />
            ) : (
              (auditData?.data ?? []).map((event) => (
                <Box
                  key={event.id}
                  sx={{ py: 1.5, borderBottom: '1px solid #f1f5f9' }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {event.action.toUpperCase()} · {event.enteredBy} ({event.role})
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(event.createdAt).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontFamily: 'monospace' }}>
                    {event.rawValue} {event.rawUnit} → {event.normalizedValue} {event.normalizedUnit}
                  </Typography>
                </Box>
              ))
            )}
          </Box>
        )}
      </Drawer>

      {/* Add Site Dialog */}
      <Dialog open={createSiteOpen} onClose={() => setCreateSiteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 750 }}>Add Facility Site to Hierarchy</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Measurements can only be entered at the leaf site level. Link the site to its parent subsidiary.
          </Typography>
          {siteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage(siteError, 'Could not save facility.')}
            </Alert>
          )}
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            <TextField
              required
              label="Group / Corporate Parent"
              value={siteForm.group}
              onChange={(e) => setSiteForm({ ...siteForm, group: e.target.value })}
            />
            <TextField
              required
              label="Subsidiary Operating Company"
              value={siteForm.subsidiary}
              onChange={(e) => setSiteForm({ ...siteForm, subsidiary: e.target.value })}
            />
            <TextField
              required
              label="Site Facility Name"
              value={siteForm.site}
              onChange={(e) => setSiteForm({ ...siteForm, site: e.target.value })}
            />
            <TextField
              required
              label="Jurisdiction / Region"
              value={siteForm.region}
              onChange={(e) => setSiteForm({ ...siteForm, region: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateSiteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveSite}
            disabled={
              creatingSite ||
              !siteForm.group.trim() ||
              !siteForm.subsidiary.trim() ||
              !siteForm.site.trim() ||
              !siteForm.region.trim()
            }
          >
            {creatingSite ? 'Saving…' : 'Save Facility'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ py: 1.25 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ overflowWrap: 'anywhere', mt: 0.25, fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  )
}
