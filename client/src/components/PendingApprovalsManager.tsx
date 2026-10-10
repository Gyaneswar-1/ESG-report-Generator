import React, { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded'
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded'
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined'
import {
  useDecideApprovalMutation,
  useGetPendingApprovalsQuery,
  type PendingApprovalUser,
} from '../store/api'
import type { UserRole } from '../store/authSlice'

interface PendingApprovalsManagerProps {
  currentRole: UserRole
}

const roleTitles: Record<string, string> = {
  engineer: 'Site Engineer',
  subsidiary_head: 'Subsidiary Head',
  executive: 'CSO / Super Admin',
  auditor: 'Independent Auditor',
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export const PendingApprovalsManager: React.FC<PendingApprovalsManagerProps> = ({ currentRole }) => {
  const { data, isLoading, refetch } = useGetPendingApprovalsQuery()
  const [decideApproval, { isLoading: isDeciding }] = useDecideApprovalMutation()

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedUser, setSelectedUser] = useState<PendingApprovalUser | null>(null)
  const [decisionType, setDecisionType] = useState<'approve' | 'reject' | 'pending'>('approve')
  const [reviewNote, setReviewNote] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  const allUsers = useMemo(() => data?.data ?? [], [data?.data])

  // Count metrics
  const counts = useMemo(() => {
    return {
      all: allUsers.length,
      pending: allUsers.filter((u) => u.approvalStatus === 'pending').length,
      approved: allUsers.filter((u) => u.approvalStatus === 'approved').length,
      rejected: allUsers.filter((u) => u.approvalStatus === 'rejected').length,
    }
  }, [allUsers])

  // Filtered roster
  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      // Status filter
      if (statusFilter !== 'all' && user.approvalStatus !== statusFilter) {
        return false
      }

      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchName = user.name?.toLowerCase().includes(query)
        const matchEmail = user.email?.toLowerCase().includes(query)
        const matchEmpId = user.employeeId?.toLowerCase().includes(query)
        const matchDept = user.department?.toLowerCase().includes(query)
        const matchLocation = (user.location || user.organization || '')?.toLowerCase().includes(query)
        if (!matchName && !matchEmail && !matchEmpId && !matchDept && !matchLocation) {
          return false
        }
      }

      return true
    })
  }, [allUsers, statusFilter, roleFilter, searchQuery])

  const handleOpenAction = (user: PendingApprovalUser, decision: 'approve' | 'reject' | 'pending') => {
    setSelectedUser(user)
    setDecisionType(decision)
    setReviewNote(user.reviewNote || '')
    setDialogOpen(true)
  }

  const handleConfirmDecision = async () => {
    if (!selectedUser) return
    try {
      const res = await decideApproval({
        id: selectedUser.id,
        decision: decisionType,
        note: reviewNote,
      }).unwrap()
      setFeedback(res.message)
      setDialogOpen(false)
      refetch()
    } catch (err: unknown) {
      setFeedback(
        typeof err === 'object' && err && 'data' in err && typeof err.data === 'object' && err.data && 'message' in err.data
          ? String(err.data.message)
          : 'Could not record approval decision.'
      )
    }
  }

  const title =
    currentRole === 'subsidiary_head'
      ? 'Site Engineer Registration & Approval Directory'
      : 'Subsidiary Head & Enterprise Registrations Directory'

  const subtitle =
    currentRole === 'subsidiary_head'
      ? 'Manage and monitor all Site Engineers under your jurisdiction: view approved, pending, and rejected accounts.'
      : 'Comprehensive oversight of all Subsidiary Heads, Auditors, and site personnel registrations: approved, pending, and rejected.'

  return (
    <Box sx={{ py: 1 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      {feedback && (
        <Alert severity="info" onClose={() => setFeedback(null)} sx={{ mb: 2.5 }}>
          {feedback}
        </Alert>
      )}

      {/* Metric Stat Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 3,
        }}
      >
        <Card
          variant="outlined"
          onClick={() => setStatusFilter('all')}
          sx={{
            cursor: 'pointer',
            borderRadius: 2.5,
            border: statusFilter === 'all' ? '2px solid #2563eb' : '1px solid #e2e8f0',
            bgcolor: statusFilter === 'all' ? '#eff6ff' : '#ffffff',
            transition: 'all 0.15s ease',
            '&:hover': { borderColor: '#93c5fd' },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Total Accounts
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
              {counts.all}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          onClick={() => setStatusFilter('pending')}
          sx={{
            cursor: 'pointer',
            borderRadius: 2.5,
            border: statusFilter === 'pending' ? '2px solid #d97706' : '1px solid #e2e8f0',
            bgcolor: statusFilter === 'pending' ? '#fffbeb' : '#ffffff',
            transition: 'all 0.15s ease',
            '&:hover': { borderColor: '#fcd34d' },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#d97706', textTransform: 'uppercase' }}>
              Pending Review
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#b45309', mt: 0.5 }}>
              {counts.pending}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          onClick={() => setStatusFilter('approved')}
          sx={{
            cursor: 'pointer',
            borderRadius: 2.5,
            border: statusFilter === 'approved' ? '2px solid #16a34a' : '1px solid #e2e8f0',
            bgcolor: statusFilter === 'approved' ? '#f0fdf4' : '#ffffff',
            transition: 'all 0.15s ease',
            '&:hover': { borderColor: '#86efac' },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#16a34a', textTransform: 'uppercase' }}>
              Approved & Active
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
              {counts.approved}
            </Typography>
          </CardContent>
        </Card>

        <Card
          variant="outlined"
          onClick={() => setStatusFilter('rejected')}
          sx={{
            cursor: 'pointer',
            borderRadius: 2.5,
            border: statusFilter === 'rejected' ? '2px solid #dc2626' : '1px solid #e2e8f0',
            bgcolor: statusFilter === 'rejected' ? '#fef2f2' : '#ffffff',
            transition: 'all 0.15s ease',
            '&:hover': { borderColor: '#fca5a5' },
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#dc2626', textTransform: 'uppercase' }}>
              Rejected / Revoked
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#b91c1c', mt: 0.5 }}>
              {counts.rejected}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filter Tabs & Search Controls */}
      <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: '#ffffff', mb: 3 }}>
        <Box
          sx={{
            px: 2,
            pt: 1,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          <Tabs
            value={statusFilter}
            onChange={(_e, val) => setStatusFilter(val as StatusFilter)}
            sx={{
              minHeight: 44,
              '& .MuiTab-root': {
                minHeight: 44,
                textTransform: 'none',
                fontWeight: 650,
                fontSize: '0.875rem',
              },
            }}
          >
            <Tab value="all" label={`All (${counts.all})`} />
            <Tab value="pending" label={`Pending (${counts.pending})`} />
            <Tab value="approved" label={`Approved (${counts.approved})`} />
            <Tab value="rejected" label={`Rejected (${counts.rejected})`} />
          </Tabs>

          <Stack direction="row" spacing={1.5} sx={{ py: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {currentRole === 'executive' && (
              <Select
                size="small"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                sx={{ minWidth: 160, height: 38, fontSize: '0.825rem' }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="subsidiary_head">Subsidiary Heads</MenuItem>
                <MenuItem value="engineer">Site Engineers</MenuItem>
                <MenuItem value="auditor">Auditors</MenuItem>
              </Select>
            )}

            <TextField
              size="small"
              placeholder="Search by name, email, employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ minWidth: { xs: 200, sm: 260 } }}
            />
          </Stack>
        </Box>
      </Card>

      {/* Directory Roster */}
      {isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress size={36} />
        </Box>
      ) : filteredUsers.length === 0 ? (
        <Card variant="outlined" sx={{ borderRadius: 2.5, bgcolor: '#ffffff' }}>
          <CardContent sx={{ py: 6, textAlign: 'center' }}>
            <PersonOutlineRoundedIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 750, color: '#1e293b' }}>
              No Accounts Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {statusFilter === 'all'
                ? 'No registered users match the applied filters.'
                : `There are currently no users with status "${statusFilter}".`}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2.5}>
          {filteredUsers.map((user) => {
            const isApproved = user.approvalStatus === 'approved'
            const isRejected = user.approvalStatus === 'rejected'
            const isPending = user.approvalStatus === 'pending'

            return (
              <Card
                key={user.id}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  border: '1px solid',
                  borderColor: isPending
                    ? '#fde68a'
                    : isRejected
                    ? '#fecaca'
                    : '#e2e8f0',
                  boxShadow: isPending ? '0 1px 3px rgba(217, 119, 6, 0.08)' : 'none',
                  transition: 'border-color 0.2s',
                  '&:hover': { borderColor: '#cbd5e1' },
                }}
              >
                <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1.5,
                      mb: 2,
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                        <Typography variant="h6" sx={{ fontWeight: 750, color: '#0f172a' }}>
                          {user.name}
                        </Typography>

                        <Chip
                          label={roleTitles[user.role] || user.role}
                          size="small"
                          color="primary"
                          variant="outlined"
                          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                        />

                        {isApproved && (
                          <Chip
                            icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: '14px !important' }} />}
                            label="Approved & Active"
                            size="small"
                            color="success"
                            sx={{ fontWeight: 650, fontSize: '0.725rem' }}
                          />
                        )}

                        {isPending && (
                          <Chip
                            icon={<HourglassEmptyRoundedIcon sx={{ fontSize: '14px !important' }} />}
                            label="Pending Review"
                            size="small"
                            color="warning"
                            sx={{ fontWeight: 650, fontSize: '0.725rem' }}
                          />
                        )}

                        {isRejected && (
                          <Chip
                            icon={<HighlightOffRoundedIcon sx={{ fontSize: '14px !important' }} />}
                            label="Rejected / Inactive"
                            size="small"
                            color="error"
                            sx={{ fontWeight: 650, fontSize: '0.725rem' }}
                          />
                        )}

                        {!user.isProfileCompleted && (
                          <Chip
                            label="Profile Incomplete"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 500, fontSize: '0.675rem', color: '#64748b' }}
                          />
                        )}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {user.email} · Registered on {new Date(user.createdAt).toLocaleDateString()}
                        {user.reviewedAt && (
                          <> · Reviewed on {new Date(user.reviewedAt).toLocaleDateString()}</>
                        )}
                      </Typography>
                    </Box>

                    {/* Action buttons contextualized by status */}
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                      {isPending && (
                        <>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<HighlightOffRoundedIcon />}
                            onClick={() => handleOpenAction(user, 'reject')}
                          >
                            {currentRole === 'executive' ? 'Disapprove' : 'Reject'}
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleOutlineRoundedIcon />}
                            onClick={() => handleOpenAction(user, 'approve')}
                            sx={{ fontWeight: 700 }}
                          >
                            Approve & Activate
                          </Button>
                        </>
                      )}

                      {isApproved && (
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<BlockOutlinedIcon />}
                          onClick={() => handleOpenAction(user, 'reject')}
                        >
                          Revoke Access / Disapprove
                        </Button>
                      )}

                      {isRejected && (
                        <>
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            startIcon={<RestartAltRoundedIcon />}
                            onClick={() => handleOpenAction(user, 'pending')}
                          >
                            Reset to Pending
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            startIcon={<CheckCircleOutlineRoundedIcon />}
                            onClick={() => handleOpenAction(user, 'approve')}
                            sx={{ fontWeight: 700 }}
                          >
                            Re-Approve & Activate
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Profile Details Grid */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                      gap: 2,
                      pt: 0.5,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BadgeOutlinedIcon sx={{ fontSize: 14 }} /> Employee ID:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.employeeId || 'N/A'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <BusinessOutlinedIcon sx={{ fontSize: 14 }} /> Department:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.department || 'N/A'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneOutlinedIcon sx={{ fontSize: 14 }} /> Contact Phone:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.phone || 'N/A'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnOutlinedIcon sx={{ fontSize: 14 }} /> Location:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.location || user.organization || 'MEIL Facility'}
                      </Typography>
                    </Box>
                  </Box>

                  {user.qualifications && (
                    <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#f8fafc', borderRadius: 1.5 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <SchoolOutlinedIcon sx={{ fontSize: 14 }} /> Qualifications:
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {user.qualifications}
                      </Typography>
                    </Box>
                  )}

                  {/* Assigned sites or scopes */}
                  {user.sites && user.sites.length > 0 && (
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                        Requested Facility Scope:
                      </Typography>
                      {user.sites.map((s) => (
                        <Chip key={s.id} label={`${s.name} (${s.region})`} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}

                  {user.scopes && user.scopes.length > 0 && (
                    <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#475569' }}>
                        Operating Jurisdiction:
                      </Typography>
                      {user.scopes.map((s) => (
                        <Chip key={s.id} label={`${s.name} · ${s.level}`} size="small" variant="outlined" />
                      ))}
                    </Box>
                  )}

                  {/* Review Audit Note Box */}
                  {user.reviewNote && (
                    <Box
                      sx={{
                        mt: 1.75,
                        p: 1.5,
                        bgcolor: isApproved ? '#f0fdf4' : isRejected ? '#fef2f2' : '#f8fafc',
                        border: '1px dashed',
                        borderColor: isApproved ? '#bbf7d0' : isRejected ? '#fecaca' : '#e2e8f0',
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                      }}
                    >
                      <RateReviewOutlinedIcon
                        sx={{
                          fontSize: 16,
                          color: isApproved ? '#16a34a' : isRejected ? '#dc2626' : '#64748b',
                          mt: 0.25,
                        }}
                      />
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: isApproved ? '#15803d' : isRejected ? '#b91c1c' : '#475569',
                          }}
                        >
                          Review Note / Audit Comment:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#334155', mt: 0.25 }}>
                          {user.reviewNote}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </Stack>
      )}

      {/* Decision Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {decisionType === 'approve'
            ? `Approve ${selectedUser?.name}`
            : decisionType === 'reject'
            ? `${currentRole === 'executive' ? 'Disapprove' : 'Reject'} ${selectedUser?.name}`
            : `Reset ${selectedUser?.name} to Pending`}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {decisionType === 'approve'
              ? `This will grant ${selectedUser?.name} full ${roleTitles[selectedUser?.role || '']} access to the reporting portal and project records.`
              : decisionType === 'reject'
              ? `This will set the account for ${selectedUser?.name} to rejected/inactive, disabling access to project submission and management features.`
              : `This will reset the application status for ${selectedUser?.name} back to pending review.`}
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={3}
            label={
              decisionType === 'approve'
                ? 'Approval Note (Optional)'
                : decisionType === 'reject'
                ? 'Rejection / Revocation Reason'
                : 'Reason for Status Reset (Optional)'
            }
            placeholder={
              decisionType === 'approve'
                ? 'e.g. Credentials verified against enterprise HR database.'
                : decisionType === 'reject'
                ? 'e.g. Facility assignment incorrect, re-apply with valid employee ID.'
                : 'e.g. Returned to pending for re-verification.'
            }
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color={decisionType === 'approve' ? 'success' : decisionType === 'reject' ? 'error' : 'warning'}
            onClick={handleConfirmDecision}
            disabled={isDeciding}
          >
            {isDeciding ? <CircularProgress size={18} color="inherit" /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
