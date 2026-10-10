import React, { useMemo, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Radio,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ClearRoundedIcon from '@mui/icons-material/ClearRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import type { RootState, AppDispatch } from '../store'
import { signOut, updateUser } from '../store/authSlice'
import {
  useCompleteProfileMutation,
  useGetPublicSitesQuery,
  useGetPublicSubsidiariesQuery,
} from '../store/api'

const roleTitles: Record<string, string> = {
  engineer: 'Site Engineer',
  subsidiary_head: 'Subsidiary Head',
  executive: 'CSO / Super Admin',
  auditor: 'Independent Auditor',
}

export const ProfileCompletion: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, role, name, email } = useSelector((state: RootState) => state.auth)

  const [phone, setPhone] = useState(user?.phone || '')
  const [employeeId, setEmployeeId] = useState(user?.employeeId || '')
  const [department, setDepartment] = useState(user?.department || '')
  const [designation, setDesignation] = useState(user?.designation || '')
  const [organization, setOrganization] = useState(user?.organization || 'MEIL Corporate Group')
  const [location, setLocation] = useState(user?.location || '')
  const [qualifications, setQualifications] = useState(user?.qualifications || '')
  const [selectedSiteId, setSelectedSiteId] = useState<number | ''>('')
  const [selectedSubId, setSelectedSubId] = useState<number | ''>('')
  const [companySearchQuery, setCompanySearchQuery] = useState('')

  const cachedPublicSites = useSelector((state: RootState) => state.data.publicSites)
  const cachedPublicSubs = useSelector((state: RootState) => state.data.publicSubsidiaries)

  const [completeProfile, { isLoading, error }] = useCompleteProfileMutation()
  const { data: publicSitesData, isLoading: loadingSitesQuery } = useGetPublicSitesQuery(undefined, {
    skip: role !== 'engineer',
  })
  const { data: publicSubsData, isLoading: loadingSubsQuery } = useGetPublicSubsidiariesQuery(undefined, {
    skip: role !== 'subsidiary_head' && role !== 'engineer',
  })

  const publicSites = useMemo(
    () => (cachedPublicSites.length > 0 ? cachedPublicSites : publicSitesData?.data ?? []),
    [cachedPublicSites, publicSitesData?.data]
  )
  const publicSubs = useMemo(
    () => (cachedPublicSubs.length > 0 ? cachedPublicSubs : publicSubsData?.data ?? []),
    [cachedPublicSubs, publicSubsData?.data]
  )
  const loadingSites = publicSites.length === 0 && loadingSitesQuery
  const loadingSubs = publicSubs.length === 0 && loadingSubsQuery

  // Pre-select company if user already has matching organization
  useEffect(() => {
    if (!selectedSubId && publicSubs.length > 0 && user?.organization) {
      const orgName = user.organization.toLowerCase().trim()
      const match = publicSubs.find((s) => s.name.toLowerCase().trim() === orgName)
      if (match) {
        setSelectedSubId(match.id)
      }
    }
  }, [publicSubs, user?.organization, selectedSubId])

  const filteredSubs = useMemo(() => {
    if (!companySearchQuery.trim()) return publicSubs
    const q = companySearchQuery.toLowerCase().trim()
    return publicSubs.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.region && s.region.toLowerCase().includes(q)) ||
        (s.subHeadName && s.subHeadName.toLowerCase().includes(q)) ||
        (s.subHeadTitle && s.subHeadTitle.toLowerCase().includes(q))
    )
  }, [publicSubs, companySearchQuery])

  const selectedCompany = useMemo(() => {
    if (!selectedSubId) return null
    return publicSubs.find((s) => s.id === Number(selectedSubId)) || null
  }, [publicSubs, selectedSubId])

  const availableSitesForCompany = useMemo(() => {
    if (!selectedCompany) return publicSites
    if (selectedCompany.sites && selectedCompany.sites.length > 0) {
      return selectedCompany.sites
    }
    return publicSites.filter((st) => st.subsidiary === selectedCompany.name)
  }, [selectedCompany, publicSites])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const targetOrg = selectedCompany ? selectedCompany.name : organization
      const payload: {
        phone: string
        employeeId: string
        department: string
        designation: string
        qualifications: string
        organization: string
        location: string
        siteIds?: number[]
        subsidiaryIds?: number[]
      } = {
        phone,
        employeeId,
        department,
        designation,
        qualifications,
        organization: targetOrg,
        location,
      }

      if (role === 'engineer') {
        if (selectedSubId) {
          payload.subsidiaryIds = [Number(selectedSubId)]
        }
        if (selectedSiteId) {
          payload.siteIds = [Number(selectedSiteId)]
        }
      }
      if (role === 'subsidiary_head' && selectedSubId) {
        payload.subsidiaryIds = [Number(selectedSubId)]
      }

      const result = await completeProfile(payload).unwrap()
      dispatch(updateUser(result.data.user))
    } catch {
      // RTK Query error handled below
    }
  }

  const errorMessage =
    error && typeof error === 'object' && 'data' in error && typeof error.data === 'object' && error.data && 'message' in error.data
      ? String(error.data.message)
      : error
      ? 'Failed to complete profile. Please check that all required fields are filled.'
      : null

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f1f5f9', py: { xs: 4, md: 7 } }}>
      <Container maxWidth="md">
        <Card sx={{ borderRadius: 3, boxShadow: '0 20px 40px rgba(15,23,42,0.06)' }}>
          <Box sx={{ bgcolor: '#0f172a', color: '#ffffff', p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1, bgcolor: '#1e293b', borderRadius: 2 }}>
                <AssignmentIndOutlinedIcon sx={{ color: '#38bdf8' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Mandatory Profile Completion
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  Statutory corporate identity & regulatory scope registration
                </Typography>
              </Box>
            </Box>
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<LogoutRoundedIcon />}
              onClick={() => dispatch(signOut())}
              sx={{ borderColor: '#475569', color: '#cbd5e1' }}
            >
              Sign out
            </Button>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Welcome, <strong>{name || email}</strong> ({roleTitles[role || ''] || role}). To comply with statutory
              audit standards, you must complete this profile form. Once submitted, your profile will be forwarded to
              your upper-level role for authorization.
            </Alert>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {errorMessage}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BadgeOutlinedIcon fontSize="small" color="primary" /> Official Credentials & Identity
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 3 }}>
                <TextField label="Full Name" value={name} disabled slotProps={{ input: { readOnly: true } }} />
                <TextField label="Work Email" value={email} disabled slotProps={{ input: { readOnly: true } }} />
                <TextField
                  required
                  label="Official Mobile / Contact Number"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <TextField
                  required
                  label="Corporate Employee / Badge ID"
                  placeholder="e.g. MEIL-ENG-4921"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
                <TextField
                  required
                  label="Department / Functional Unit"
                  placeholder="e.g. EHS & Environmental Engineering"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
                <TextField
                  required
                  label="Official Job Title / Designation"
                  placeholder="e.g. Site Quality & ESG Engineer"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                />
                <TextField
                  required
                  label="Parent Organization / Company"
                  placeholder="e.g. MEIL Corporate Group"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
                <TextField
                  required
                  label="Base Office / City Location"
                  placeholder="e.g. Bhubaneswar, Odisha"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </Box>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Organizational Assignment & Qualifications
              </Typography>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5, mb: 3 }}>
                {role === 'engineer' && (
                  <Box sx={{ gridColumn: '1 / -1', border: '1px solid #cbd5e1', borderRadius: 2.5, p: 2, bgcolor: '#f8fafc' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <BusinessOutlinedIcon color="primary" fontSize="small" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                          Operating Company & Approving Subsidiary Head *
                        </Typography>
                      </Box>
                      {selectedCompany && (
                        <Chip
                          icon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                          label={selectedCompany.name}
                          color="success"
                          size="small"
                          sx={{ fontWeight: 650, fontSize: '0.675rem' }}
                        />
                      )}
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      The Subsidiary Head can only approve site engineers of the same company. Search and select your company:
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

                    <Stack spacing={1} sx={{ maxHeight: 180, overflowY: 'auto', pr: 0.5, mb: 2 }}>
                      {loadingSubs ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      ) : filteredSubs.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1.5, textAlign: 'center' }}>
                          No companies match "{companySearchQuery}".
                        </Typography>
                      ) : (
                        filteredSubs.map((sub) => {
                          const isSelected = selectedSubId === sub.id
                          return (
                            <Box
                              key={sub.id}
                              onClick={() => {
                                setSelectedSubId(sub.id)
                                setOrganization(sub.name)
                              }}
                              sx={{
                                p: 1.25,
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

                    <TextField
                      select
                      required
                      fullWidth
                      label="Assigned Project / Site Facility"
                      value={selectedSiteId}
                      onChange={(e) => setSelectedSiteId(Number(e.target.value))}
                      disabled={loadingSites}
                      helperText={
                        selectedCompany
                          ? `Project facilities operating under ${selectedCompany.name}`
                          : 'Select your operational site facility'
                      }
                      sx={{ bgcolor: '#ffffff' }}
                    >
                      {availableSitesForCompany.map((site) => (
                        <MenuItem key={site.id} value={site.id}>
                          {site.name} {site.region ? `(${site.region})` : ''}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                )}

                {role === 'subsidiary_head' && (
                  <TextField
                    select
                    required
                    label="Assigned Subsidiary Entity"
                    value={selectedSubId}
                    onChange={(e) => setSelectedSubId(Number(e.target.value))}
                    disabled={loadingSubs}
                    helperText="Select the operating subsidiary company you supervise"
                  >
                    {publicSubs.map((sub) => (
                      <MenuItem key={sub.id} value={sub.id}>
                        {sub.name} {sub.region ? `· ${sub.region}` : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                <TextField
                  label="Professional Qualifications & Certifications"
                  placeholder="e.g. B.Tech Civil, ISO 14001 Auditor, Certified Energy Manager"
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  sx={{ gridColumn: role === 'executive' || role === 'auditor' ? '1 / -1' : undefined }}
                />
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={
                    isLoading ||
                    !phone.trim() ||
                    !employeeId.trim() ||
                    !department.trim() ||
                    !designation.trim() ||
                    (role === 'engineer' && (!selectedSiteId || !selectedSubId)) ||
                    (role === 'subsidiary_head' && !selectedSubId)
                  }
                  sx={{ minWidth: 220, minHeight: 46, fontWeight: 700 }}
                >
                  {isLoading ? <CircularProgress size={22} color="inherit" /> : 'Save & Submit Profile'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
