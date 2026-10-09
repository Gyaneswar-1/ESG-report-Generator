import React, { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  Typography,
} from '@mui/material'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import { esgTheme } from './theme/theme'
import { LandingPage } from './components/LandingPage'
import { RoleEntry } from './components/RoleEntry'
import { ProfileCompletion } from './components/ProfileCompletion'
import { ApprovalPending } from './components/ApprovalPending'
import { RecordWorkspace } from './components/RecordWorkspace'
import { BrsrReportStudio } from './components/BrsrReportStudio'
import { signOut, updateUser, type UserRole } from './store/authSlice'
import type { RootState, AppDispatch } from './store'
import { api, useGetCurrentUserQuery } from './store/api'

const roleTitles: Record<UserRole, string> = {
  engineer: 'Site Engineer',
  subsidiary_head: 'Subsidiary Head',
  executive: 'CSO / Super Admin',
  auditor: 'Independent Auditor',
}

export const App: React.FC = () => {
  const { role, name, token, isProfileCompleted, isApproved } = useSelector(
    (state: RootState) => state.auth
  )
  const dispatch = useDispatch<AppDispatch>()

  // Navigation state when unauthenticated
  const [authView, setAuthView] = useState<'landing' | 'auth'>('landing')
  const [selectedInitialRole, setSelectedInitialRole] = useState<UserRole | null>(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)

  // Sync latest user details from server
  const { data: userData, error: sessionError } = useGetCurrentUserQuery(undefined, {
    skip: !token,
    pollingInterval: 15000, // Periodically check for approval updates
  })

  useEffect(() => {
    if (userData?.data) {
      dispatch(updateUser(userData.data))
    }
  }, [userData, dispatch])

  const sessionExpired =
    typeof sessionError === 'object' &&
    sessionError !== null &&
    'status' in sessionError &&
    sessionError.status === 401

  const endSession = useCallback(() => {
    dispatch(signOut())
    dispatch(api.util.resetApiState())
    setAuthView('landing')
  }, [dispatch])

  useEffect(() => {
    if (sessionExpired) endSession()
  }, [sessionExpired, endSession])

  // Handlers for Landing Page interactions
  const handleSelectRoleFromLanding = (selectedRole: UserRole) => {
    setSelectedInitialRole(selectedRole)
    setAuthView('auth')
  }

  const handleOpenAuth = () => {
    setSelectedInitialRole(null)
    setAuthView('auth')
  }

  // Determine current screen
  const renderContent = () => {
    // 1. Not logged in
    if (!token || !role) {
      if (authView === 'landing') {
        return (
          <LandingPage
            onSelectRole={handleSelectRoleFromLanding}
            onOpenAuth={handleOpenAuth}
          />
        )
      }
      return (
        <RoleEntry
          initialRole={selectedInitialRole}
          onBackToLanding={() => setAuthView('landing')}
        />
      )
    }

    // 2. Logged in, but profile not completed
    if (!isProfileCompleted) {
      return <ProfileCompletion />
    }

    // 3. Logged in, profile completed, but awaiting upper-level approval
    if (!isApproved && role !== 'executive') {
      return <ApprovalPending onEditProfile={() => dispatch(updateUser({ isProfileCompleted: false }))} />
    }

    // 4. Logged in -> Profile completed -> Approved!
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <AppBar position="sticky" color="default" sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <Toolbar
            sx={{
              maxWidth: 1300,
              width: '100%',
              mx: 'auto',
              px: { xs: 2, sm: 3 },
              minHeight: 68,
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                display: 'grid',
                placeItems: 'center',
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: '#0f172a',
                color: '#ffffff',
                fontWeight: 800,
              }}
            >
              <AssessmentOutlinedIcon fontSize="small" />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                EcoTrace ESG Portal
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Statutory Reporting & Evidence Assurance
              </Typography>
            </Box>

            <Chip
              size="small"
              label={roleTitles[role]}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />

            {(role === 'executive' || role === 'auditor') && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PictureAsPdfOutlinedIcon fontSize="small" />}
                onClick={() => setReportModalOpen(true)}
                sx={{ display: { xs: 'none', sm: 'inline-flex' }, fontWeight: 600 }}
              >
                SEBI Annexure-I
              </Button>
            )}

            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: '#e0f2fe',
                color: '#0369a1',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {(name || roleTitles[role]).slice(0, 1).toUpperCase()}
            </Avatar>

            <Button
              color="inherit"
              size="small"
              onClick={endSession}
              startIcon={<LogoutRoundedIcon />}
              sx={{ color: '#475569' }}
            >
              Sign out
            </Button>
          </Toolbar>
        </AppBar>

        <RecordWorkspace />

        <BrsrReportStudio open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
      </Box>
    )
  }

  return (
    <ThemeProvider theme={esgTheme}>
      <CssBaseline />
      {renderContent()}
    </ThemeProvider>
  )
}

export default App
