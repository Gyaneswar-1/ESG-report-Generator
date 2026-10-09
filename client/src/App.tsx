import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppBar, Avatar, Box, Button, Chip, CssBaseline, ThemeProvider, Toolbar, Typography } from '@mui/material'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import { esgTheme } from './theme/theme'
import { RoleEntry } from './components/RoleEntry'
import { RecordWorkspace } from './components/RecordWorkspace'
import { SignupNotifications } from './components/SignupNotifications'
import { signOut, type UserRole } from './store/authSlice'
import type { RootState, AppDispatch } from './store'
import { api, useGetCurrentUserQuery } from './store/api'

const roleTitles: Record<UserRole, string> = { engineer: 'Site Engineer', subsidiary_head: 'Subsidiary Head', executive: 'CSO / Super Admin', auditor: 'Independent Auditor' }

export const App: React.FC = () => {
  const { role, name, token } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const { error: sessionError } = useGetCurrentUserQuery(undefined, { skip: !token })
  const sessionExpired = typeof sessionError === 'object' && sessionError !== null && 'status' in sessionError && sessionError.status === 401
  const endSession = useCallback(() => { dispatch(signOut()); dispatch(api.util.resetApiState()) }, [dispatch])
  useEffect(() => { if (sessionExpired) endSession() }, [sessionExpired, endSession])

  return (
    <ThemeProvider theme={esgTheme}>
      <CssBaseline />
      {!role ? <RoleEntry /> : <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <AppBar position="sticky" color="default">
          <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 }, minHeight: 68, gap: 1.5 }}>
            <Box sx={{ display: 'grid', placeItems: 'center', width: 38, height: 38, borderRadius: 2, bgcolor: '#dbeafe', color: 'primary.main', fontWeight: 800 }}>E</Box>
            <Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 750, color: 'text.primary' }}>EcoTrace</Typography><Typography variant="caption" color="text.secondary">ESG data entry</Typography></Box>
            <Chip size="small" label={roleTitles[role]} color="primary" variant="outlined" />
            <SignupNotifications role={role} />
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#e0f2fe', color: '#0e7490', fontSize: 14 }}>{(name || roleTitles[role]).slice(0, 1).toUpperCase()}</Avatar>
            <Button color="inherit" size="small" onClick={endSession} startIcon={<LogoutRoundedIcon />}>Sign out</Button>
          </Toolbar>
        </AppBar>
        <RecordWorkspace />
      </Box>}
    </ThemeProvider>
  )
}

export default App
