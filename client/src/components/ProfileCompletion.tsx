import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
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

  const [completeProfile, { isLoading, error }] = useCompleteProfileMutation()
  const { data: publicSitesData, isLoading: loadingSites } = useGetPublicSitesQuery(undefined, {
    skip: role !== 'engineer',
  })
  const { data: publicSubsData, isLoading: loadingSubs } = useGetPublicSubsidiariesQuery(undefined, {
    skip: role !== 'subsidiary_head',
  })

  const publicSites = publicSitesData?.data ?? []
  const publicSubs = publicSubsData?.data ?? []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
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
        organization,
        location,
      }

      if (role === 'engineer' && selectedSiteId) {
        payload.siteIds = [Number(selectedSiteId)]
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
                  <TextField
                    select
                    required
                    label="Assigned Project / Site Facility"
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(Number(e.target.value))}
                    disabled={loadingSites}
                    helperText="Select the single facility you are authorized to report ESG data for"
                  >
                    {publicSites.map((site) => (
                      <MenuItem key={site.id} value={site.id}>
                        {site.name} {site.region ? `(${site.region})` : ''}
                      </MenuItem>
                    ))}
                  </TextField>
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
                    (role === 'engineer' && !selectedSiteId) ||
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
