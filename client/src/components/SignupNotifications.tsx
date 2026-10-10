import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Alert, Badge, Box, Button, IconButton, Popover, Stack, Typography } from '@mui/material'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import { useGetPendingApprovalsQuery, useDecideApprovalMutation, type PendingApprovalUser } from '../store/api'
import type { UserRole } from '../store/authSlice'
import type { RootState, AppDispatch } from '../store'
import { updateApprovalStatusLocal } from '../store/dataSlice'

export function SignupNotifications({ role }: { role: UserRole }) {
  const dispatch = useDispatch<AppDispatch>()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const canReview = role === 'subsidiary_head' || role === 'executive'
  const cachedApprovals = useSelector((state: RootState) => state.data.pendingApprovals)
  const { data, isLoading: queryLoading, error } = useGetPendingApprovalsQuery(undefined, {
    skip: !canReview,
    pollingInterval: 30_000,
  })
  const [decide, { isLoading: deciding, error: reviewError }] = useDecideApprovalMutation()
  if (!canReview) return null

  const allUsers = cachedApprovals && cachedApprovals.length > 0 ? cachedApprovals : (data?.data ?? [])
  const requests = allUsers.filter((u) => u.approvalStatus === 'pending')
  const isLoading = allUsers.length === 0 && queryLoading

  return (
    <>
      <IconButton aria-label="Approval requests" color="inherit" onClick={(event) => setAnchor(event.currentTarget)}>
        <Badge badgeContent={requests.length} color="error">
          <NotificationsNoneRoundedIcon />
        </Badge>
      </IconButton>
      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: { xs: 320, sm: 390 }, maxHeight: '70vh', overflowY: 'auto', p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            Registration Approvals
          </Typography>
          {isLoading && <Typography color="text.secondary">Loading requests…</Typography>}
          {error && <Alert severity="warning">Could not load requests.</Alert>}
          {reviewError && <Alert severity="error" sx={{ mb: 1 }}>Could not save decision.</Alert>}
          {!isLoading && !error && !requests.length && (
            <Typography color="text.secondary">No pending requests waiting for authorization.</Typography>
          )}
          <Stack spacing={1.5}>
            {requests.map((request: PendingApprovalUser) => (
              <Box key={request.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 700 }}>{request.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {request.email} · {request.role}
                </Typography>
                {request.sites && request.sites.length > 0 && (
                  <Typography variant="body2" sx={{ mt: 0.75 }}>
                    Facility: {request.sites.map((site) => site.name).join(', ')}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Submitted {new Date(request.createdAt).toLocaleDateString()}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    disabled={deciding}
                    onClick={() => {
                      dispatch(updateApprovalStatusLocal({ id: request.id, status: 'approved' }))
                      decide({ id: request.id, decision: 'approve' })
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    disabled={deciding}
                    onClick={() => {
                      dispatch(updateApprovalStatusLocal({ id: request.id, status: 'rejected' }))
                      decide({ id: request.id, decision: 'reject' })
                    }}
                  >
                    Reject
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  )
}
