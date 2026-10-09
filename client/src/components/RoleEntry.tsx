import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Alert, Box, Button, Card, CardActionArea, CardContent, Container, MenuItem, Stack, TextField, Typography } from '@mui/material'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import { signIn, type UserRole } from '../store/authSlice'
import type { AppDispatch } from '../store'
import { useGetPublicSitesQuery, useLoginMutation, useSignupMutation } from '../store/api'

const roleInfo: { role: UserRole; title: string; detail: string; signup?: boolean }[] = [
  { role: 'engineer', title: 'Site Engineer', detail: 'Enter site metrics and attach evidence', signup: true },
  { role: 'subsidiary_head', title: 'Subsidiary Head', detail: 'Review and approve engineer submissions' },
  { role: 'executive', title: 'CSO / Super Admin', detail: 'View group dashboards and generate reports' },
  { role: 'auditor', title: 'Independent Auditor', detail: 'Verify records and evidence, read only' },
]
const roleNames: Record<UserRole, string> = { engineer: 'Site Engineer', executive: 'CSO / Super Admin', subsidiary_head: 'Subsidiary Head', auditor: 'Independent Auditor' }

export function RoleEntry() {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [siteIds, setSiteIds] = useState<number[]>([])
  const [success, setSuccess] = useState('')
  const [login, { isLoading, error: loginError }] = useLoginMutation()
  const [signup, { isLoading: signingUp, error: signupError }] = useSignupMutation()
  const { data: sitesData } = useGetPublicSitesQuery(undefined, { skip: mode !== 'signup' })
  const error = mode === 'signup' ? signupError : loginError

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSuccess('')
    try {
      if (mode === 'signup' && selectedRole === 'engineer') {
        await signup({ name, email, password, role: 'engineer', siteIds }).unwrap()
        setSuccess('Request submitted. A Subsidiary Head with access to the selected site must approve it before you can sign in.')
        setMode('login'); setPassword(''); return
      }
      if (!selectedRole) return
      const result = await login({ email, password, role: selectedRole }).unwrap()
      dispatch(signIn({ role: result.data.user.role, name: result.data.user.name, token: result.data.token }))
    } catch { /* API errors appear in the form */ }
  }

  const message = error && typeof error === 'object' && 'data' in error && typeof error.data === 'object' && error.data && 'message' in error.data
    ? String(error.data.message) : 'Could not connect to the portal. Check that the server is running.'
  const resetRole = () => { setSelectedRole(null); setMode('login'); setSuccess('') }
  const currentSites = sitesData?.data ?? []

  return <Box className="entry-page"><Container maxWidth="sm">
    <Card sx={{ maxWidth: 540, mx: 'auto', borderRadius: 4, boxShadow: '0 20px 60px rgba(15,23,42,.08)' }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 3, bgcolor: '#dbeafe' }}><PublicOutlinedIcon color="primary" /></Box>
          <Typography variant="h5" sx={{ fontWeight: 750 }}>EcoTrace ESG Portal</Typography>
          <Typography variant="body2" color="text.secondary">{selectedRole ? `${roleNames[selectedRole]} access` : 'Choose your role to continue'}</Typography>
        </Stack>
        {!selectedRole ? <Stack spacing={1.2}>
          {roleInfo.map(({ role, title, detail }) => <Card key={role} variant="outlined" sx={{ borderRadius: 2.5 }}><CardActionArea onClick={() => setSelectedRole(role)}><CardContent sx={{ py: 1.5 }}><Typography sx={{ fontWeight: 700 }}>{title}</Typography><Typography variant="body2" color="text.secondary">{detail}</Typography></CardContent></CardActionArea></Card>)}
        </Stack> : <>
          <Button size="small" startIcon={<ArrowBackRoundedIcon />} onClick={resetRole} sx={{ mb: 1.5 }}>Choose another role</Button>
          <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 1.6 }}>
            {mode === 'signup' && <TextField required label="Full name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} />}
            <TextField required type="email" label="Work email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
            <TextField required type="password" label="Password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} helperText={mode === 'signup' ? 'Use at least 12 characters.' : undefined} />
            {mode === 'signup' && <>
              {currentSites.length ? <TextField select required label="Assigned site" value={siteIds[0] ?? ''} onChange={(event) => setSiteIds([Number(event.target.value)])}>{currentSites.map((site) => <MenuItem key={site.id} value={site.id}>{site.name}{site.region ? ` · ${site.region}` : ''}</MenuItem>)}</TextField> : <Alert severity="info">No sites are available yet. Ask the portal administrator to add a site before signing up.</Alert>}
            </>}
            {success && <Alert severity="success">{success}</Alert>}
            {error && <Alert severity="error">{message}</Alert>}
            <Button type="submit" size="large" variant="contained" endIcon={<LoginRoundedIcon />} disabled={isLoading || signingUp || !email || !password || (mode === 'signup' && (!name || password.length < 12 || !siteIds.length || !currentSites.length))} sx={{ minHeight: 48 }}>
              {mode === 'signup' ? (signingUp ? 'Sending request…' : 'Request account') : (isLoading ? 'Signing in…' : 'Sign in')}
            </Button>
          </Box>
          {selectedRole === 'executive' && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>CSO credentials are verified against the server environment.</Typography>}
          {selectedRole === 'engineer' && <Button fullWidth sx={{ mt: 1 }} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setSuccess('') }}>{mode === 'login' ? 'Need access? Sign up for approval' : 'Already approved? Sign in'}</Button>}
        </>}
        {!selectedRole && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2.5 }}>Your role and access are checked securely by the server.</Typography>}
      </CardContent>
    </Card>
  </Container></Box>
}
