import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Alert, Box, Button, Card, CardContent, Container, Stack, TextField, Typography } from '@mui/material'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import { signIn } from '../store/authSlice'
import type { AppDispatch } from '../store'
import { useLoginMutation } from '../store/api'

export function RoleEntry() {
  const dispatch = useDispatch<AppDispatch>()
  const [login, { isLoading, error }] = useLoginMutation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    try {
      const result = await login({ email, password }).unwrap()
      dispatch(signIn({ role: result.data.user.role, name: result.data.user.name, token: result.data.token }))
    } catch { /* the API error is displayed below */ }
  }

  const message = error && typeof error === 'object' && 'data' in error && typeof error.data === 'object' && error.data && 'message' in error.data
    ? String(error.data.message) : 'Could not connect to the portal. Check that the server is running.'

  return <Box className="entry-page"><Container maxWidth="sm">
    <Card sx={{ maxWidth: 460, mx: 'auto', borderRadius: 4, boxShadow: '0 20px 60px rgba(15,23,42,.08)' }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'grid', placeItems: 'center', width: 48, height: 48, borderRadius: 3, bgcolor: '#dbeafe' }}><PublicOutlinedIcon color="primary" /></Box>
          <Typography variant="h5" sx={{ fontWeight: 750 }}>EcoTrace ESG Portal</Typography>
          <Typography variant="body2" color="text.secondary">Sign in to your assigned workspace</Typography>
        </Stack>
        <Box component="form" onSubmit={submit} sx={{ display: 'grid', gap: 2 }}>
          <TextField required type="email" label="Work email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
          <TextField required type="password" label="Password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <Alert severity="error">{message}</Alert>}
          <Button type="submit" size="large" variant="contained" endIcon={<LoginRoundedIcon />} disabled={isLoading || !email || !password} sx={{ minHeight: 48 }}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2.5 }}>
          Portal access is assigned by your administrator. Your role and site access are checked by the server.
        </Typography>
      </CardContent>
    </Card>
  </Container></Box>
}
