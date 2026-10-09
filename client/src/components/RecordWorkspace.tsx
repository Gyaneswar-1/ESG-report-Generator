import { useMemo, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'
import { useCreateRecordMutation, useGetRecordsQuery } from '../store/api'

const pillarForRole = { engineer: 'environmental', hse: 'social', executive: 'environmental', auditor: 'governance' } as const
const roleName = { engineer: 'Site Engineer', hse: 'HSE Officer', executive: 'CSO / Executive', auditor: 'Statutory Auditor' } as const
const currentPeriod = new Date().toISOString().slice(0, 7)

export function RecordWorkspace() {
  const { role, name } = useSelector((state: RootState) => state.auth)
  const [createRecord, { isLoading, isSuccess, error }] = useCreateRecordMutation()
  const { data, isLoading: loadingRecords, isError: recordsError } = useGetRecordsQuery()
  const records = data?.data ?? []
  const [form, setForm] = useState({ site: '', period: currentPeriod, pillar: role ? pillarForRole[role] : 'environmental', metric: '', value: '', unit: '', evidence: '', notes: '' })
  const recentRecords = useMemo(() => records.slice(0, 8), [records])

  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((current) => ({ ...current, [field]: event.target.value }))
  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!role || !form.site.trim() || !form.metric.trim() || !form.unit.trim() || form.value === '') return
    await createRecord({ ...form, value: Number(form.value), enteredBy: name || roleName[role], role }).unwrap()
    setForm((current) => ({ ...current, metric: '', value: '', unit: '', evidence: '', notes: '' }))
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 5 } }}>
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h4" sx={{ mb: 0.75 }}>Enter site data</Typography>
        <Typography color="text.secondary">Add one ESG measurement at a time. Saved records appear below.</Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.25fr) minmax(280px, .75fr)' }, gap: 2.5, alignItems: 'start' }}>
        <Card>
          <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
            <Stack direction="row" spacing={1} sx={{ mb: 2.5, alignItems: 'center' }}>
              <AddCircleOutlineRoundedIcon color="primary" />
              <Typography variant="h6">New measurement</Typography>
            </Stack>
            <Box component="form" onSubmit={submit} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField required label="Site or facility" placeholder="e.g. Bhubaneswar Plant" value={form.site} onChange={update('site')} />
              <TextField required label="Reporting month" type="month" value={form.period} onChange={update('period')} slotProps={{ inputLabel: { shrink: true } }} />
              <TextField select label="ESG area" value={form.pillar} onChange={update('pillar')}>
                <MenuItem value="environmental">Environment</MenuItem><MenuItem value="social">People & safety</MenuItem><MenuItem value="governance">Governance</MenuItem>
              </TextField>
              <TextField required label="Measurement" placeholder="e.g. Diesel used" value={form.metric} onChange={update('metric')} />
              <TextField required label="Amount" type="number" value={form.value} onChange={update('value')} slotProps={{ htmlInput: { min: 0, step: 'any' } }} />
              <TextField required label="Unit" placeholder="e.g. litres, kWh, people" value={form.unit} onChange={update('unit')} />
              <TextField label="Evidence reference (optional)" placeholder="Invoice number or file name" value={form.evidence} onChange={update('evidence')} sx={{ gridColumn: { sm: '1 / -1' } }} />
              <TextField label="Notes (optional)" multiline minRows={2} value={form.notes} onChange={update('notes')} sx={{ gridColumn: { sm: '1 / -1' } }} />
              {error && <Alert severity="error" sx={{ gridColumn: { sm: '1 / -1' } }}>{'data' in error && typeof error.data === 'object' && error.data && 'message' in error.data ? String(error.data.message) : 'Could not save this record. Check that the server and database are running.'}</Alert>}
              {isSuccess && <Alert icon={<CheckCircleOutlineRoundedIcon />} severity="success" sx={{ gridColumn: { sm: '1 / -1' } }}>Measurement saved.</Alert>}
              <Button type="submit" variant="contained" size="large" disabled={isLoading || !form.site.trim() || !form.metric.trim() || !form.unit.trim() || form.value === ''} sx={{ gridColumn: { sm: '1 / -1' }, minHeight: 48 }}>
                {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Save measurement'}
              </Button>
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: { xs: 2.25, sm: 3 } }}>
            <Typography variant="h6">Recently saved</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>Latest records from the shared ESG log</Typography>
            <Divider />
            {loadingRecords ? <Box sx={{ display: 'grid', placeItems: 'center', py: 5 }}><CircularProgress size={24} /></Box> : recordsError ? <Alert severity="warning" sx={{ mt: 2 }}>Could not load records. Check the server connection.</Alert> : recentRecords.length === 0 ? <Box sx={{ py: 4, textAlign: 'center' }}><Typography sx={{ fontWeight: 600 }}>No records yet</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>Your first saved measurement will show here.</Typography></Box> : <Stack divider={<Divider flexItem />}>
              {recentRecords.map((record) => <Box key={record.id} sx={{ py: 1.75 }}>
                <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ minWidth: 0 }}><Typography sx={{ fontWeight: 650 }} noWrap>{record.metric}</Typography><Typography variant="body2" color="text.secondary">{record.site} · {record.period}</Typography></Box>
                  <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{record.value} <Typography component="span" variant="caption" color="text.secondary">{record.unit}</Typography></Typography>
                </Stack>
                <Chip size="small" label={record.pillar} sx={{ mt: 1, textTransform: 'capitalize', bgcolor: '#f1f5f9' }} />
              </Box>)}
            </Stack>}
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
