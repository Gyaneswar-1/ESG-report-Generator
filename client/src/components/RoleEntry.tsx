import React, { useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
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
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ClearRoundedIcon from '@mui/icons-material/ClearRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import { signIn, type UserRole } from '../store/authSlice'
import type { AppDispatch, RootState } from '../store'
import {
  useGetPublicSitesQuery,
  useGetPublicSubsidiariesQuery,
  useLoginMutation,
  useSignupMutation,
} from '../store/api'

interface RoleEntryProps {
  initialRole?: UserRole | null
  onBackToLanding?: () => void
  isSuperAdminOnly?: boolean
  onSelectSuperAdmin?: () => void
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

export const RoleEntry: React.FC<RoleEntryProps> = ({
  initialRole = null,
  onBackToLanding,
  isSuperAdminOnly = false,
  onSelectSuperAdmin,
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(
    isSuperAdminOnly ? 'executive' : initialRole === 'executive' ? null : initialRole
  )
  const [tabIndex, setTabIndex] = useState<number>(0) // 0: Login, 1: Signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedSiteId, setSelectedSiteId] = useState<number | ''>('')
  const [selectedSubId, setSelectedSubId] = useState<number | ''>('')
  const [companySearchQuery, setCompanySearchQuery] = useState('')

  const [login, { isLoading: isLoggingIn, error: loginError }] = useLoginMutation()
  const [signup, { isLoading: isSigningUp, error: signupError }] = useSignupMutation()

  const cachedPublicSites = useSelector((state: RootState) => state.data.publicSites)
  const cachedPublicSubs = useSelector((state: RootState) => state.data.publicSubsidiaries)

  const { data: publicSitesData } = useGetPublicSitesQuery(undefined, {
    skip: selectedRole !== 'engineer' || tabIndex !== 1,
  })
  const { data: publicSubsData, isLoading: isLoadingSubsQuery } = useGetPublicSubsidiariesQuery(undefined, {
    skip: (selectedRole !== 'subsidiary_head' && selectedRole !== 'engineer') || tabIndex !== 1,
  })

  const sites = useMemo(
    () => (cachedPublicSites.length > 0 ? cachedPublicSites : publicSitesData?.data ?? []),
    [cachedPublicSites, publicSitesData?.data]
  )
  const subsidiaries = useMemo(
    () => (cachedPublicSubs.length > 0 ? cachedPublicSubs : publicSubsData?.data ?? []),
    [cachedPublicSubs, publicSubsData?.data]
  )
  const isLoadingSubs = subsidiaries.length === 0 && isLoadingSubsQuery

  const filteredSubsidiaries = useMemo(() => {
    if (!companySearchQuery.trim()) return subsidiaries
    const q = companySearchQuery.toLowerCase().trim()
    return subsidiaries.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.region && s.region.toLowerCase().includes(q)) ||
        (s.subHeadName && s.subHeadName.toLowerCase().includes(q)) ||
        (s.subHeadTitle && s.subHeadTitle.toLowerCase().includes(q))
    )
  }, [subsidiaries, companySearchQuery])

  const selectedCompany = useMemo(() => {
    if (!selectedSubId) return null
    return subsidiaries.find((s) => s.id === Number(selectedSubId)) || null
  }, [subsidiaries, selectedSubId])

  const availableSitesForCompany = useMemo(() => {
    if (!selectedCompany) return []
    if (selectedCompany.sites && selectedCompany.sites.length > 0) {
      return selectedCompany.sites
    }
    return sites.filter((st) => st.subsidiary === selectedCompany.name)
  }, [selectedCompany, sites])

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

        if (selectedRole === 'engineer') {
          if (selectedSubId) {
            payload.subsidiaryIds = [Number(selectedSubId)]
          }
          if (selectedSiteId) {
            payload.siteIds = [Number(selectedSiteId)]
          }
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
                  bgcolor: isSuperAdminOnly ? '#eef2ff' : '#dbeafe',
                }}
              >
                {isSuperAdminOnly ? (
                  <SecurityOutlinedIcon sx={{ color: '#4f46e5', fontSize: 28 }} />
                ) : (
                  <PublicOutlinedIcon color="primary" sx={{ fontSize: 28 }} />
                )}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                {isSuperAdminOnly ? 'Corporate Super Admin Portal' : 'EcoTrace ESG Portal'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isSuperAdminOnly
                  ? 'Restricted Access: Enterprise Telemetry & Filing'
                  : selectedRole
                  ? `${roleNames[selectedRole]} Authentication`
                  : 'Select your designated role to enter'}
              </Typography>
            </Stack>

            {!selectedRole ? (
              <Stack spacing={1.5}>
                {roleInfo
                  .filter(({ role }) => (isSuperAdminOnly ? role === 'executive' : role !== 'executive'))
                  .map(({ role, title, detail, icon }) => (
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

                {!isSuperAdminOnly && onSelectSuperAdmin && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed #e2e8f0', textAlign: 'center' }}>
                    <Button
                      size="small"
                      variant="text"
                      onClick={onSelectSuperAdmin}
                      sx={{ color: '#94a3b8', fontSize: '0.75rem', textTransform: 'none', '&:hover': { color: '#0f172a' } }}
                    >
                      Corporate Executive / Super Admin Portal &rarr;
                    </Button>
                  </Box>
                )}
              </Stack>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  {!isSuperAdminOnly ? (
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
                  ) : onBackToLanding ? (
                    <Button
                      size="small"
                      startIcon={<ArrowBackRoundedIcon />}
                      onClick={onBackToLanding}
                      sx={{ color: 'text.secondary', textTransform: 'none' }}
                    >
                      Back to Overview
                    </Button>
                  ) : (
                    <Box />
                  )}
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
                    <Box
                      sx={{
                        border: '1px solid #cbd5e1',
                        borderRadius: 3,
                        p: 2,
                        bgcolor: '#f8fafc',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessOutlinedIcon color="primary" fontSize="small" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                            Select Operating Company & Sub Head *
                          </Typography>
                        </Box>
                        {selectedCompany && (
                          <Chip
                            icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                            label="Selected"
                            color="success"
                            size="small"
                            sx={{ fontWeight: 650, fontSize: '0.675rem' }}
                          />
                        )}
                      </Box>

                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        The Subsidiary Head can only approve site engineers of the same company. Search and choose your company:
                      </Typography>

                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Search company by name (e.g. Water, Power, Infra)..."
                        value={companySearchQuery}
                        onChange={(e) => setCompanySearchQuery(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <SearchRoundedIcon fontSize="small" sx={{ color: '#64748b' }} />
                              </InputAdornment>
                            ),
                            endAdornment: companySearchQuery ? (
                              <InputAdornment position="end">
                                <IconButton size="small" onClick={() => setCompanySearchQuery('')} edge="end">
                                  <ClearRoundedIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ) : null,
                          },
                        }}
                        sx={{ mb: 1.5, bgcolor: '#ffffff', borderRadius: 1 }}
                      />

                      <Stack spacing={1} sx={{ maxHeight: 200, overflowY: 'auto', pr: 0.5 }}>
                        {isLoadingSubs ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : filteredSubsidiaries.length === 0 ? (
                          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                            No companies found matching "{companySearchQuery}".
                          </Typography>
                        ) : (
                          filteredSubsidiaries.map((sub) => {
                            const isSelected = selectedSubId === sub.id
                            return (
                              <Box
                                key={sub.id}
                                onClick={() => {
                                  setSelectedSubId(sub.id)
                                  setSelectedSiteId('')
                                }}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  border: '2px solid',
                                  borderColor: isSelected ? '#0284c7' : '#e2e8f0',
                                  bgcolor: isSelected ? '#f0f9ff' : '#ffffff',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: 1.5,
                                  '&:hover': {
                                    borderColor: isSelected ? '#0284c7' : '#94a3b8',
                                    bgcolor: isSelected ? '#f0f9ff' : '#f8fafc',
                                  },
                                }}
                              >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                    <Typography variant="body2" sx={{ fontWeight: 750, color: '#0f172a' }}>
                                      {sub.name}
                                    </Typography>
                                    {sub.region && (
                                      <Chip
                                        label={sub.region}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.675rem', height: 20 }}
                                      />
                                    )}
                                  </Box>

                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5 }}>
                                    <SupervisorAccountOutlinedIcon sx={{ fontSize: 16, color: '#0284c7' }} />
                                    <Typography variant="caption" sx={{ color: '#334155' }}>
                                      Sub Head: <strong style={{ color: '#0369a1' }}>{sub.subHeadName || 'Unassigned'}</strong>
                                      {sub.subHeadTitle ? ` (${sub.subHeadTitle})` : ''}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Radio checked={isSelected} size="small" />
                              </Box>
                            )
                          })
                        )}
                      </Stack>

                      {selectedCompany && (
                        <Alert severity="info" sx={{ mt: 1.5, py: 0.5, px: 1.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block' }}>
                            Approving Sub Head: <strong>{selectedCompany.subHeadName || 'Subsidiary Head'}</strong> for <strong>{selectedCompany.name}</strong>.
                          </Typography>
                        </Alert>
                      )}

                      {selectedCompany && (
                        <Box sx={{ mt: 1.5 }}>
                          <TextField
                            select
                            fullWidth
                            size="small"
                            label="Assigned Site Facility (Optional)"
                            value={selectedSiteId}
                            onChange={(e) => setSelectedSiteId(Number(e.target.value))}
                            helperText="Choose the site under this company, or assign later in profile"
                          >
                            <MenuItem value="">Assign specific site later in profile</MenuItem>
                            {availableSitesForCompany.map((s) => (
                              <MenuItem key={s.id} value={s.id}>
                                {s.name} {s.region ? `· ${s.region}` : ''}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Box>
                      )}
                    </Box>
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
                      (isSignup && (!name.trim() || password.length < 8 || (selectedRole === 'engineer' && !selectedSubId)))
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
