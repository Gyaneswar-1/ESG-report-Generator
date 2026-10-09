import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Box, Button, Card, CardContent, Checkbox, CircularProgress, Container, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Drawer, FormControlLabel, MenuItem, Stack, Tab, Tabs, TextField, Typography } from '@mui/material'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import { useCreateRecordMutation, useCreateSiteMutation, useCreateUserMutation, useGetMetricsQuery, useGetRecordAuditQuery, useGetRecordsQuery, useGetSitesQuery, useReviewRecordMutation, type EsgRecord } from '../store/api'
import type { RootState, AppDispatch } from '../store'
import { setRegion, type UserRole } from '../store/authSlice'

const currentPeriod = new Date().toISOString().slice(0, 7)
type MetricCode = 'diesel' | 'electricity' | 'water' | 'total_waste' | 'recycled_waste' | 'lost_time_injuries' | 'working_hours' | 'other'
interface MetricOption { code: MetricCode; label: string; unit: string }
const categories: { name: string; metrics: MetricOption[] }[] = [
  { name: 'Energy', metrics: [{ code: 'diesel', label: 'Diesel consumed', unit: 'Liters' }, { code: 'electricity', label: 'Electricity consumed', unit: 'kWh' }] },
  { name: 'Water', metrics: [{ code: 'water', label: 'Water withdrawn', unit: 'kL' }] },
  { name: 'Waste', metrics: [{ code: 'total_waste', label: 'Total waste generated', unit: 'kg' }, { code: 'recycled_waste', label: 'Waste recycled', unit: 'kg' }] },
  { name: 'People & safety', metrics: [{ code: 'lost_time_injuries', label: 'Lost time injuries', unit: 'incidents' }, { code: 'working_hours', label: 'Total working hours', unit: 'hours' }] },
  { name: 'Other', metrics: [{ code: 'other', label: 'Other ESG measurement', unit: '' }] },
]

export function RecordWorkspace() {
  const { role, region, token } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const [createRecord, { isLoading, isSuccess, error }] = useCreateRecordMutation()
  const [reviewRecord, { isLoading: reviewing, error: reviewError }] = useReviewRecordMutation()
  const [createUser, { isLoading: creatingUser, error: userError }] = useCreateUserMutation()
  const [createSite, { isLoading: creatingSite, error: siteError }] = useCreateSiteMutation()
  const { data: siteData, isLoading: loadingSites, isError: sitesError } = useGetSitesQuery()
  const { data: recordsData, isLoading: loadingRecords, isError: recordsError } = useGetRecordsQuery()
  const { data: metricData } = useGetMetricsQuery(region || undefined, { skip: role !== 'executive' })
  const [selectedRecord, setSelectedRecord] = useState<EsgRecord | null>(null)
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null)
  const [hashVerified, setHashVerified] = useState<boolean | null>(null)
  const [reviewNote, setReviewNote] = useState('')
  const { data: auditData, isLoading: loadingAudit } = useGetRecordAuditQuery(selectedRecord?.id ?? '', { skip: !selectedRecord })
  const sites = siteData?.data ?? []
  const records = recordsData?.data ?? []
  const regions = [...new Set(sites.map((site) => site.region))].sort()
  const [category, setCategory] = useState(0)
  const [form, setForm] = useState({ siteId: '', period: currentPeriod, metricCode: 'diesel' as MetricCode, metric: 'Diesel consumed', rawValue: '', rawUnit: 'Liters', notes: '' })
  const [proof, setProof] = useState<File | null>(null)
  const [createSiteOpen, setCreateSiteOpen] = useState(false)
  const [siteForm, setSiteForm] = useState({ group: '', subsidiary: '', site: '', region: '' })
  const [userOpen, setUserOpen] = useState(false)
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'subsidiary_head' as UserRole, entityIds: [] as number[] })

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const setMetric = (code: string) => {
    const item = categories.flatMap((item) => item.metrics).find((metric) => metric.code === code)
    if (!item) return
    setForm((current) => ({ ...current, metricCode: code as MetricCode, metric: item.label, rawUnit: item.unit }))
  }
  const recentRecords = useMemo(() => records.slice(0, 10), [records])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!role || !proof || !form.siteId || !form.rawValue) return
    const payload = new FormData()
    payload.set('siteId', form.siteId)
    payload.set('period', form.period)
    payload.set('metricCode', form.metricCode)
    payload.set('metric', form.metric)
    payload.set('rawValue', form.rawValue)
    payload.set('rawUnit', form.rawUnit)
    payload.set('notes', form.notes)
    payload.set('evidence', proof)
    await createRecord(payload).unwrap()
    setForm((current) => ({ ...current, rawValue: '', notes: '' }))
    setProof(null)
  }

  const saveSite = async () => {
    try {
      const created = await createSite(siteForm).unwrap()
      setForm((current) => ({ ...current, siteId: String(created.data.id) }))
      setCreateSiteOpen(false)
      setSiteForm({ group: '', subsidiary: '', site: '', region: '' })
    } catch { /* show the mutation error in the dialog */ }
  }

  const errorMessage = (value: unknown, fallback: string) => {
    if (typeof value === 'object' && value && 'data' in value && typeof value.data === 'object' && value.data && 'message' in value.data) return String(value.data.message)
    return fallback
  }

  const activeMetrics = metricData?.data ?? []
  const canEnter = role === 'engineer'
  const availableScopeIds = userForm.role === 'subsidiary_head'
    ? [...new Map(sites.map((site) => [site.subsidiaryId, { id: site.subsidiaryId, name: site.subsidiary }])).values()]
    : sites.map((site) => ({ id: site.id, name: `${site.name} · ${site.region}` }))

  const submitUser = async () => {
    try {
      await createUser({ ...userForm, entityIds: userForm.role === 'auditor' ? [] : userForm.entityIds }).unwrap()
      setUserOpen(false)
      setUserForm({ name: '', email: '', password: '', role: 'subsidiary_head', entityIds: [] })
    } catch { /* show the mutation error in the dialog */ }
  }

  const decideReview = async (status: 'approved' | 'rejected') => {
    if (!selectedRecord) return
    try {
      await reviewRecord({ id: selectedRecord.id, status, note: reviewNote }).unwrap()
      setSelectedRecord(null)
      setReviewNote('')
    } catch { /* show the mutation error in the drawer */ }
  }

  const openEvidence = async (evidenceId: number) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1/'}evidence/${evidenceId}`, { headers: { Authorization: `Bearer ${token}` } })
    if (!response.ok) return
    const blob = await response.blob()
    const bytes = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
    const actualHash = [...new Uint8Array(bytes)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
    setHashVerified(actualHash === response.headers.get('X-Content-SHA256'))
    setEvidencePreview(URL.createObjectURL(blob))
  }

  useEffect(() => () => { if (evidencePreview) URL.revokeObjectURL(evidencePreview) }, [evidencePreview])

  return <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4.5 } }}>
    {role === 'executive' && <Box sx={{ mb: 3 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
        <Box><Typography variant="h5">Group overview</Typography><Typography variant="body2" color="text.secondary">Totals are calculated from site records.</Typography></Box>
        <TextField select size="small" label="Region" value={region} onChange={(event) => dispatch(setRegion(event.target.value))} sx={{ minWidth: 210 }}>
          <MenuItem value="">All regions</MenuItem>{regions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
        </TextField>
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
        {activeMetrics.slice(0, 4).map((metric) => <Card key={`${metric.metricCode}-${metric.period}`}><CardContent sx={{ p: 2 }}><Typography variant="caption" color="text.secondary">{metric.metric} · {metric.period}</Typography><Typography variant="h5" sx={{ mt: .5 }}>{metric.total.toLocaleString()} <Typography component="span" variant="body2" color="text.secondary">{metric.unit}</Typography></Typography><Typography variant="caption" color="text.secondary">Across {metric.siteCount} sites</Typography></CardContent></Card>)}
        {activeMetrics.length === 0 && <Alert severity="info" sx={{ gridColumn: '1 / -1' }}>No saved site records for this region yet.</Alert>}
      </Box>
    </Box>}

    <Stack direction="row" sx={{ mb: 3, alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
      <Box><Typography variant="h4" sx={{ mb: .75 }}>{canEnter ? 'Enter site data' : role === 'subsidiary_head' ? 'Review site submissions' : 'ESG records'}</Typography><Typography color="text.secondary">{canEnter ? 'Add one measurement with its source document.' : role === 'subsidiary_head' ? 'Review and approve records from your assigned subsidiaries.' : role === 'auditor' ? 'Read-only records and evidence across the organization.' : 'Browse current site records and manage portal access.'}</Typography></Box>
      {role === 'executive' && <Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => setCreateSiteOpen(true)}>Add a site</Button><Button variant="outlined" onClick={() => setUserOpen(true)}>Manage users</Button></Stack>}
    </Stack>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.25fr) minmax(300px, .75fr)' }, gap: 2.5, alignItems: 'start' }}>
      {canEnter && <Card><CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center' }}><AddCircleOutlineRoundedIcon color="primary" /><Typography variant="h6">New measurement</Typography></Stack>
        {sitesError && <Alert severity="error" sx={{ mb: 2 }}>Could not load the site list. Check the server connection.</Alert>}
        {sites.length === 0 && !loadingSites && <Alert severity="info" sx={{ mb: 2 }}>No site is assigned to your account yet. Ask your administrator to add a site and grant access.</Alert>}
        <Box component="form" onSubmit={submit} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField select required label="Site" value={form.siteId} onChange={update('siteId')} disabled={loadingSites}>
            {sites.map((site) => <MenuItem key={site.id} value={site.id}>{site.name} · {site.region}</MenuItem>)}
          </TextField>
          <TextField required label="Reporting month" type="month" value={form.period} onChange={update('period')} slotProps={{ inputLabel: { shrink: true } }} />
          <Box sx={{ gridColumn: { sm: '1 / -1' }, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={category} onChange={(_event, next) => { setCategory(next); setMetric(categories[next].metrics[0].code) }} variant="scrollable" scrollButtons="auto">{categories.map((item) => <Tab key={item.name} label={item.name} />)}</Tabs>
          </Box>
          <TextField select required label="Measurement" value={form.metricCode} onChange={(event) => setMetric(event.target.value)}>
            {categories[category].metrics.map((metric) => <MenuItem key={metric.code} value={metric.code}>{metric.label}</MenuItem>)}
          </TextField>
          <TextField required label="Amount" type="number" value={form.rawValue} onChange={update('rawValue')} slotProps={{ htmlInput: { min: 0, step: 'any' } }} />
          <TextField required label="Unit" value={form.rawUnit} onChange={update('rawUnit')} />
          {form.rawValue !== '' && <Alert severity="info" sx={{ gridColumn: { sm: '1 / -1' } }}>
            {form.metricCode === 'diesel' && ['liters', 'liter', 'l'].includes(form.rawUnit.toLowerCase())
              ? `Stored as ${((Number(form.rawValue) * 2.68) / 1000).toFixed(4)} MT CO2e · liters × 2.68 ÷ 1,000`
              : form.metricCode === 'electricity' && ['mwh', 'megawatt-hours'].includes(form.rawUnit.toLowerCase())
                ? `Stored as ${(Number(form.rawValue) * 1000).toLocaleString()} kWh · MWh × 1,000`
                : form.metricCode === 'water' && ['liters', 'liter', 'l'].includes(form.rawUnit.toLowerCase())
                  ? `Stored as ${(Number(form.rawValue) / 1000).toLocaleString()} kL · liters ÷ 1,000`
                  : ['total_waste', 'recycled_waste'].includes(form.metricCode) && ['kg', 'kilograms'].includes(form.rawUnit.toLowerCase())
                    ? `Stored as ${(Number(form.rawValue) / 1000).toLocaleString()} t · kg ÷ 1,000`
                    : `Stored as ${form.rawValue} ${form.rawUnit}`}
          </Alert>}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button component="label" variant={proof ? 'outlined' : 'contained'} startIcon={<AttachFileRoundedIcon />}>
              {proof ? 'Replace PDF proof' : 'Attach PDF proof'}<input hidden type="file" accept="application/pdf,.pdf" onChange={(event) => setProof(event.target.files?.[0] ?? null)} />
            </Button>
            {proof && <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{proof.name}</Typography>}
          </Box>
          <TextField label="Notes (optional)" multiline minRows={2} value={form.notes} onChange={update('notes')} sx={{ gridColumn: { sm: '1 / -1' } }} />
          {error && <Alert severity="error" sx={{ gridColumn: { sm: '1 / -1' } }}>{errorMessage(error, 'Could not save this record. Check the server and database.')}</Alert>}
          {siteError && <Alert severity="error" sx={{ gridColumn: { sm: '1 / -1' } }}>{errorMessage(siteError, 'Could not create the site.')}</Alert>}
          {isSuccess && <Alert severity="success" sx={{ gridColumn: { sm: '1 / -1' } }}>Measurement and evidence saved.</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={isLoading || !form.siteId || !form.rawValue || !proof} sx={{ gridColumn: { sm: '1 / -1' }, minHeight: 48 }}>
            {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Save measurement'}
          </Button>
        </Box>
      </CardContent></Card>}
      <Card><CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
        <Typography variant="h6">{canEnter ? 'Recently saved' : 'Site records'}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5, mb: 2 }}>Open a record to review its entry and evidence.</Typography><Divider />
        {loadingRecords ? <Box sx={{ display: 'grid', placeItems: 'center', py: 5 }}><CircularProgress size={24} /></Box> : recordsError ? <Alert severity="warning" sx={{ mt: 2 }}>Could not load records. Check the server connection.</Alert> : recentRecords.length === 0 ? <Box sx={{ py: 4, textAlign: 'center' }}><Typography sx={{ fontWeight: 600 }}>No records yet</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Your first saved measurement will show here.</Typography></Box> : <Stack divider={<Divider flexItem />}>
          {recentRecords.map((record) => <Button key={record.id} onClick={() => { setSelectedRecord(record); setEvidencePreview(null); setHashVerified(null); setReviewNote('') }} color="inherit" sx={{ py: 1.5, px: 0, textAlign: 'left', textTransform: 'none', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ minWidth: 0 }}><Typography sx={{ fontWeight: 650 }} noWrap>{record.metric}</Typography><Typography variant="body2" color="text.secondary" noWrap>{record.site} · {record.period}</Typography></Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}><Typography sx={{ fontWeight: 700 }}>{record.rawValue} {record.rawUnit}</Typography><Typography variant="caption" color="text.secondary">{record.reviewStatus === 'approved' ? 'Approved' : record.reviewStatus === 'rejected' ? 'Needs correction' : 'Pending review'}</Typography></Box>
          </Button>)}
        </Stack>}
      </CardContent></Card>
    </Box>

    <Dialog open={createSiteOpen} onClose={() => setCreateSiteOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Add a site to your organization</DialogTitle><DialogContent><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Records can only be entered at site level. Link the site to its subsidiary and group.</Typography>
        {siteError && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage(siteError, 'Could not save this site.')}</Alert>}
        <Stack spacing={2} sx={{ pt: .5 }}>
          {(['group','subsidiary','site','region'] as const).map((field) => <TextField key={field} required label={field === 'group' ? 'Group / company' : field === 'site' ? 'Site / facility' : field[0].toUpperCase() + field.slice(1)} value={siteForm[field]} onChange={(event) => setSiteForm((current) => ({ ...current, [field]: event.target.value }))} />)}
        </Stack>
      </DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={() => setCreateSiteOpen(false)}>Cancel</Button><Button variant="contained" onClick={saveSite} disabled={creatingSite || Object.values(siteForm).some((value) => !value.trim())}>{creatingSite ? 'Saving…' : 'Save site'}</Button></DialogActions>
    </Dialog>
    <Dialog open={userOpen} onClose={() => setUserOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Create a portal account</DialogTitle><DialogContent>
        <Stack spacing={2} sx={{ pt: .75 }}>
          <TextField required label="Full name" value={userForm.name} onChange={(event) => setUserForm((current) => ({ ...current, name: event.target.value }))} />
          <TextField required type="email" label="Work email" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} />
          <TextField required type="password" label="Temporary password (12+ characters)" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} />
          <TextField select label="Role" value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value as UserRole, entityIds: [] }))}>
            <MenuItem value="subsidiary_head">Subsidiary Head</MenuItem><MenuItem value="auditor">Independent Auditor</MenuItem>
          </TextField>
          {userForm.role !== 'auditor' && <Box><Typography variant="body2" sx={{ mb: .5 }}>Assign subsidiary access</Typography>
            {availableScopeIds.map((scope) => <FormControlLabel key={scope.id} control={<Checkbox checked={userForm.entityIds.includes(scope.id)} onChange={(event) => setUserForm((current) => ({ ...current, entityIds: event.target.checked ? [...current.entityIds, scope.id] : current.entityIds.filter((id) => id !== scope.id) }))} />} label={scope.name} />)}
            {availableScopeIds.length === 0 && <Alert severity="info">Create sites before assigning this account.</Alert>}
          </Box>}
          {userError && <Alert severity="error">{errorMessage(userError, 'Could not create this account.')}</Alert>}
        </Stack>
      </DialogContent><DialogActions sx={{ p: 2.5 }}><Button onClick={() => setUserOpen(false)}>Cancel</Button><Button variant="contained" onClick={submitUser} disabled={creatingUser || !userForm.name || !userForm.email || userForm.password.length < 12 || (userForm.role !== 'auditor' && userForm.entityIds.length === 0)}>{creatingUser ? 'Creating…' : 'Create account'}</Button></DialogActions>
    </Dialog>
    <Drawer anchor="right" open={Boolean(selectedRecord)} onClose={() => setSelectedRecord(null)}>
      {selectedRecord && <Box sx={{ width: { xs: '100vw', sm: 420 }, p: 3 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 2 }}><FactCheckOutlinedIcon color="primary" /><Typography variant="h6">Audit details</Typography></Stack>
        <Typography variant="h5" sx={{ mb: 2 }}>{selectedRecord.metric}</Typography>
        <Stack divider={<Divider flexItem />}>
          <Detail label="Site and month" value={`${selectedRecord.site} · ${selectedRecord.period}`} />
          <Detail label="Raw value" value={`${selectedRecord.rawValue} ${selectedRecord.rawUnit}`} />
          <Detail label="Stored value" value={`${selectedRecord.value} ${selectedRecord.unit}`} />
          <Detail label="Conversion" value={selectedRecord.formula ?? 'No conversion applied'} />
          <Detail label="Entered by" value={`${selectedRecord.enteredBy} · ${new Date(selectedRecord.createdAt).toLocaleString()}`} />
          <Detail label="Evidence SHA-256" value={selectedRecord.evidenceHash ?? 'Missing'} />
          <Detail label="Review status" value={`${selectedRecord.reviewStatus}${selectedRecord.reviewedBy ? ` · ${selectedRecord.reviewedBy}` : ''}`} />
          {selectedRecord.reviewNote && <Detail label="Review note" value={selectedRecord.reviewNote} />}
        </Stack>
        {hashVerified !== null && <Alert severity={hashVerified ? 'success' : 'error'} sx={{ mt: 1 }}>{hashVerified ? 'Evidence hash verified.' : 'Evidence hash mismatch.'}</Alert>}
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Entry history</Typography>
        {loadingAudit ? <CircularProgress size={22} /> : (auditData?.data ?? []).map((event) => <Box key={event.id} sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" sx={{ fontWeight: 650 }}>{event.action} · {event.enteredBy}</Typography>
          <Typography variant="caption" color="text.secondary">{new Date(event.createdAt).toLocaleString()}</Typography>
          <Typography variant="body2" sx={{ mt: .5 }}>{event.rawValue} {event.rawUnit} → {event.normalizedValue} {event.normalizedUnit}</Typography>
          <Typography variant="caption" sx={{ display: 'block', overflowWrap: 'anywhere' }}>SHA-256: {event.evidenceHash}</Typography>
          <Button size="small" sx={{ mt: .5 }} onClick={() => void openEvidence(event.evidenceId)}>View {event.evidenceName}</Button>
        </Box>)}
        {selectedRecord.reviewStatus === 'pending' && role === 'subsidiary_head' && <Box sx={{ mt: 2 }}>
          <TextField fullWidth multiline minRows={2} label="Review note (optional)" value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} />
          {reviewError && <Alert severity="error" sx={{ mt: 1 }}>{errorMessage(reviewError, 'Could not save the review decision.')}</Alert>}
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}><Button fullWidth color="error" variant="outlined" disabled={reviewing} onClick={() => void decideReview('rejected')}>Reject</Button><Button fullWidth variant="contained" disabled={reviewing} onClick={() => void decideReview('approved')}>Approve</Button></Stack>
        </Box>}
        {selectedRecord.evidenceId && <Button fullWidth variant="outlined" sx={{ mt: 3 }} onClick={() => void openEvidence(selectedRecord.evidenceId)}>Preview attached PDF</Button>}
        {evidencePreview && <Box component="iframe" title="Evidence PDF preview" src={evidencePreview} sx={{ width: '100%', height: 520, mt: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }} />}
      </Box>}
    </Drawer>
  </Container>
}

function Detail({ label, value }: { label: string; value: string }) {
  return <Box sx={{ py: 1.75 }}><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="body2" sx={{ overflowWrap: 'anywhere', mt: .4 }}>{value}</Typography></Box>
}
