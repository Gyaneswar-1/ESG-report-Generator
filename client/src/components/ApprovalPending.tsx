import React from 'react'
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
  Stack,
  Typography,
} from '@mui/material'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import type { RootState, AppDispatch } from '../store'
import { signOut, updateUser } from '../store/authSlice'
import { useGetCurrentUserQuery } from '../store/api'

const roleTitles: Record<string, string> = {
  engineer: 'Site Engineer',
  subsidiary_head: 'Subsidiary Head',
  executive: 'CSO / Super Admin',
  auditor: 'Independent Auditor',
}

interface ApprovalPendingProps {
  onEditProfile?: () => void
}

export const ApprovalPending: React.FC<ApprovalPendingProps> = ({ onEditProfile }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { user, role, name, email, approvalStatus } = useSelector(
    (state: RootState) => state.auth
  )

  const { refetch, isFetching } = useGetCurrentUserQuery()

  const handleRefresh = async () => {
    try {
      const result = await refetch()
      if (result.data?.data) {
        dispatch(updateUser(result.data.data))
      }
    } catch {
      // ignore
    }
  }

  const isRejected = approvalStatus === 'rejected'

  const upperRole =
    role === 'engineer'
      ? 'Subsidiary Head'
      : role === 'subsidiary_head'
      ? 'Chief Sustainability Officer (CSO) / Super Admin'
      : 'Super Administrator'

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: { xs: 5, md: 8 }, display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 4, boxShadow: '0 20px 50px rgba(15,23,42,0.08)', overflow: 'hidden' }}>
          {/* Top banner */}
          <Box
            sx={{
              p: 3,
              bgcolor: isRejected ? '#fef2f2' : '#f0fdf4',
              borderBottom: '1px solid',
              borderColor: isRejected ? '#fecaca' : '#bbf7d0',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 56,
                height: 56,
                mx: 'auto',
                mb: 1.5,
                borderRadius: '50%',
                bgcolor: isRejected ? '#fee2e2' : '#dcfce7',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {isRejected ? (
                <CancelOutlinedIcon sx={{ fontSize: 32, color: '#dc2626' }} />
              ) : (
                <HourglassEmptyRoundedIcon sx={{ fontSize: 30, color: '#16a34a' }} />
              )}
            </Box>

            <Chip
              label={isRejected ? 'Application Rejected' : 'Awaiting Authorization'}
              color={isRejected ? 'error' : 'success'}
              size="small"
              sx={{ fontWeight: 700, mb: 1 }}
            />

            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              {isRejected ? 'Account Registration Not Approved' : 'Profile Submitted for Authorization'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Role: <strong>{roleTitles[role || ''] || role}</strong>
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {isRejected ? (
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Review Feedback:
                </Typography>
                <Typography variant="body2">
                  {user?.reviewNote || 'Your registration was rejected by the reviewer. Please review and update your profile.'}
                </Typography>
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 3 }}>
                Your profile information has been securely recorded. In accordance with SEBI governance protocols, access
                to the reporting dashboard requires approval from your upper-level role (<strong>{upperRole}</strong>).
              </Alert>
            )}

            {/* Profile Summary Card */}
            <Box sx={{ p: 2.5, bgcolor: '#f1f5f9', borderRadius: 2.5, mb: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                Submitted Credentials
              </Typography>
              <Stack spacing={1} divider={<Divider flexItem />}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Name:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Email:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Employee ID:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.employeeId || 'Pending'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Department:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.department || 'Pending'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">Contact Phone:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{user?.phone || 'Pending'}</Typography>
                </Box>
              </Stack>
            </Box>

            <Stack spacing={1.5}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={isFetching ? <CircularProgress size={18} color="inherit" /> : <RefreshRoundedIcon />}
                onClick={handleRefresh}
                disabled={isFetching}
                sx={{ minHeight: 46, fontWeight: 700 }}
              >
                {isFetching ? 'Checking Status…' : 'Check Approval Status'}
              </Button>

              {isRejected && onEditProfile && (
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<EditOutlinedIcon />}
                  onClick={onEditProfile}
                  sx={{ minHeight: 44, fontWeight: 700 }}
                >
                  Edit & Resubmit Profile
                </Button>
              )}

              <Button
                variant="text"
                color="inherit"
                fullWidth
                startIcon={<LogoutRoundedIcon />}
                onClick={() => dispatch(signOut())}
                sx={{ color: 'text.secondary', mt: 1 }}
              >
                Sign out
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  )
}
