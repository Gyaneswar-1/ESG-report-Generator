import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Container,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import LoginRoundedIcon from '@mui/icons-material/LoginRounded'
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined'
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
import { signIn, type UserRole } from '../store/authSlice'
import type { AppDispatch } from '../store'
import {
  useGetPublicSitesQuery,
  useGetPublicSubsidiariesQuery,
  useLoginMutation,
  useSignupMutation,
} from '../store/api'

interface RoleEntryProps {
  initialRole?: UserRole | null
  onBackToLanding?: () => void
}

const roleInfo: {
  role: UserRole
  title: string
  detail: string
  icon: React.ReactNode
}[] = [
  {
    role: 'engineer',
    title: 'Site Engineer',
    detail: 'Enter site metrics, bills, and project proof',
    icon: <EngineeringOutlinedIcon sx={{ color: '#0284c7' }} />,
  },
  {
    role: 'subsidiary_head',
    title: 'Subsidiary Head',
    detail: 'Approve site engineers, publish project forms & review data',
    icon: <SupervisorAccountOutlinedIcon sx={{ color: '#0d9488' }} />,
  },
  {
    role: 'executive',
    title: 'CSO / Super Admin',
    detail: 'Approve subsidiary heads, view enterprise roll-up & filing',
    icon: <SecurityOutlinedIcon sx={{ color: '#4f46e5' }} />,
  },
  {
    role: 'auditor',
    title: 'Independent Auditor',
    detail: 'Verify cryptographic evidence hashes & audit logs',
    icon: <PolicyOutlinedIcon sx={{ color: '#d97706' }} />,
  },
]

const roleNames: Record<UserRole, string> = {
  engineer: 'Site Engineer',
  subsidiary_head: 'Subsidiary Head',
  executive: 'CSO / Super Admin',
  auditor: 'Independent Auditor',
}

export const RoleEntry: React.FC<RoleEntryProps> = ({ initialRole = null, onBackToLanding }) => {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(initialRole)
  const [tabIndex, setTabIndex] = useState<number>(0) // 0: Login, 1: Signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedSiteId, setSelectedSiteId] = useState<number | ''>('')
  const [selectedSubId, setSelectedSubId] = useState<number | ''>('')

  const [login, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation()
  const [signup, { isLoading: isSigningUp, error: signupError }] = useSignupMutation()

  const { data: publicSitesData } = useGetPublicSitesQuery(undefined, {
    skip: selectedRole !== 'engineer' || tabIndex !== 1,
  })
  const { data: publicSubsData } = useGetPublicSubsidiariesQuery(undefined, {
    skip: selectedRole !== 'subsidiary_head' || tabIndex !== 1,
  })

  const sites = publicSitesData?.data ?? []
  const subsidiaries = publicSubsData?.data ?? []

  const isSignup = selectedRole !== 'executive' && tabIndex === 1
  const activeError = isSignup ? signupError : loginError

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selectedRole) return

    try {
      if (isSignup) {
        const payload: {
          name: string
          email: string
          password: string
          role: UserRole
          siteIds?: number[]
          subsidiaryIds?: number[]
        } = {
          name,
          email,
          password,
          role: selectedRole,
        }

        if (selectedRole === 'engineer' && selectedSiteId) {
          payload.siteIds = [Number(selectedSiteId)]
        }
        if (selectedRole === 'subsidiary_head' && selectedSubId) {
          payload.subsidiaryIds = [Number(selectedSubId)]
        }

        const res = await signup(payload).unwrap()
        dispatch(signIn({ user: res.data.user, token: res.data.token }))
      } else {
        const res = await login({ email, password, role: selectedRole }).unwrap()
        dispatch(signIn({ user: res.data.user, token: res.data.token }))
      }
    } catch {
      // Error is captured in activeError
    }
  }

  const errorMessage =
    activeError &&
    typeof activeError === 'object' &&
    'data' in activeError &&
    typeof activeError.data === 'object' &&
    activeError.data &&
    'message' in activeError.data
      ? String(activeError.data.message)
      : activeError
      ? 'Could not connect to the portal. Please ensure the backend server is active.'
      : null

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: '0 20px 60px rgba(15,23,42,0.08)' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
            {/* Header */}
            <Stack spacing={1} sx={{ alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  bgcolor: '#dbeafe',
                }}
              >
                <PublicOutlinedIcon color="primary" sx={{ fontSize: 28 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                EcoTrace ESG Portal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedRole ? `${roleNames[selectedRole]} Authentication` : 'Select your designated role to enter'}
              </Typography>
            </Stack>

            {!selectedRole ? (
              <Stack spacing={1.5}>
                {roleInfo.map(({ role, title, detail, icon }) => (
                  <Card
                    key={role}
                    variant="outlined"
                    sx={{
                      borderRadius: 2.5,
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: '#f0fdfa',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => {
                        setSelectedRole(role)
                        if (role === 'executive') setTabIndex(0)
                      }}
                    >
                      <CardContent sx={{ py: 1.75, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ p: 1, bgcolor: '#f1f5f9', borderRadius: 2 }}>{icon}</Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography sx={{ fontWeight: 750, color: '#0f172a' }}>{title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {detail}
                          </Typography>
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                ))}

                {onBackToLanding && (
                  <Button
                    size="small"
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={onBackToLanding}
                    sx={{ mt: 2, alignSelf: 'center', color: 'text.secondary' }}
                  >
                    Back to Overview
                  </Button>
                )}
              </Stack>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Button
                    size="small"
                    startIcon={<ArrowBackRoundedIcon />}
                    onClick={() => {
                      setSelectedRole(null)
                      setPassword('')
                    }}
                  >
                    Change role
                  </Button>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', bgcolor: '#eff6ff', px: 1, py: 0.5, borderRadius: 1 }}>
                    {roleNames[selectedRole]}
                  </Typography>
                </Box>

                {selectedRole === 'executive' ? (
                  <Alert severity="info" sx={{ mb: 2.5 }}>
                    <strong>Pre-configured Executive Account:</strong> The Chief Sustainability Officer (CSO) does not require registration. Sign in using the credentials defined in the environment configuration (<code>.env</code>).
                  </Alert>
                ) : (
                  <Tabs
                    value={tabIndex}
                    onChange={(_e, v) => setTabIndex(v)}
                    variant="fullWidth"
                    sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider' }}
                  >
                    <Tab label="Sign In" />
                    <Tab label="Register New Account" />
                  </Tabs>
                )}

                {errorMessage && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
                  {isSignup && (
                    <TextField
                      required
                      label="Full Name"
                      placeholder="e.g. Rajesh Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  )}

                  <TextField
                    required
                    type="email"
                    label="Official Work Email"
                    placeholder="name@company.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <TextField
                    required
                    type="password"
                    label="Password"
                    autoComplete={isSignup ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    helperText={isSignup ? 'Use at least 8 characters.' : undefined}
                  />

                  {isSignup && selectedRole === 'engineer' && (
                    <TextField
                      select
                      label="Assigned Site (Optional - can be set in profile)"
                      value={selectedSiteId}
                      onChange={(e) => setSelectedSiteId(Number(e.target.value))}
                    >
                      <MenuItem value="">Select later in profile</MenuItem>
                      {sites.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name} {s.region ? `· ${s.region}` : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                  {isSignup && selectedRole === 'subsidiary_head' && (
                    <TextField
                      select
                      label="Assigned Subsidiary (Optional - can be set in profile)"
                      value={selectedSubId}
                      onChange={(e) => setSelectedSubId(Number(e.target.value))}
                    >
                      <MenuItem value="">Select later in profile</MenuItem>
                      {subsidiaries.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name} {s.region ? `· ${s.region}` : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                  <Button
                    type="submit"
                    size="large"
                    variant="contained"
                    endIcon={
                      isLoggingIn || isSigningUp ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : isSignup ? (
                        <PersonAddAlt1RoundedIcon />
                      ) : (
                        <LoginRoundedIcon />
                      )
                    }
                    disabled={
                      isLoggingIn ||
                      isSigningUp ||
                      !email ||
                      !password ||
                      (isSignup && (!name.trim() || password.length < 8))
                    }
                    sx={{ minHeight: 48, fontWeight: 700, mt: 1 }}
                  >
                    {isSignup
                      ? isSigningUp
                        ? 'Creating Account…'
                        : 'Register & Continue to Profile'
                      : isLoggingIn
                      ? 'Authenticating…'
                      : 'Sign In'}
                  </Button>
                </Box>

                {selectedRole === 'executive' && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                    Configured via <code>.env</code> (BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD)
                  </Typography>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
