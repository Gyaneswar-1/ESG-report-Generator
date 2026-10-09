import { useState } from 'react'
import { Alert, Badge, Box, Button, IconButton, Popover, Stack, Typography } from '@mui/material'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import { useGetSignupRequestsQuery, useReviewSignupMutation } from '../store/api'
import type { UserRole } from '../store/authSlice'

export function SignupNotifications({ role }: { role: UserRole }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const { data, isLoading, error } = useGetSignupRequestsQuery(undefined, {
    skip: role !== 'subsidiary_head', pollingInterval: 30_000,
  })
  const [review, { isLoading: reviewing, error: reviewError }] = useReviewSignupMutation()
  if (role !== 'subsidiary_head') return null
  const requests = data?.data ?? []

  return <>
    <IconButton aria-label="Sign-up requests" color="inherit" onClick={(event) => setAnchor(event.currentTarget)}>
      <Badge badgeContent={requests.length} color="error"><NotificationsNoneRoundedIcon /></Badge>
    </IconButton>
    <Popover open={Boolean(anchor)} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
      <Box sx={{ width: { xs: 320, sm: 390 }, maxHeight: '70vh', overflowY: 'auto', p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>Access requests</Typography>
        {isLoading && <Typography color="text.secondary">Loading requests…</Typography>}
        {error && <Alert severity="warning">Could not load requests. Check your connection.</Alert>}
        {reviewError && <Alert severity="error" sx={{ mb: 1 }}>Could not save the review. Please retry.</Alert>}
        {!isLoading && !error && !requests.length && <Typography color="text.secondary">No requests waiting for review.</Typography>}
        <Stack spacing={1.5}>{requests.map((request) => <Box key={request.id} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Typography sx={{ fontWeight: 700 }}>{request.name}</Typography>
          <Typography variant="body2" color="text.secondary">{request.email} · Site Engineer</Typography>
          <Typography variant="body2" sx={{ mt: .75 }}>{request.sites.map((site) => site.name).join(', ')}</Typography>
          <Typography variant="caption" color="text.secondary">Requested {new Date(request.createdAt).toLocaleDateString()}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
            <Button size="small" variant="contained" disabled={reviewing} onClick={() => review({ id: request.id, decision: 'approve' })}>Approve</Button>
            <Button size="small" color="error" disabled={reviewing} onClick={() => review({ id: request.id, decision: 'reject' })}>Reject</Button>
          </Stack>
        </Box>)}</Stack>
      </Box>
    </Popover>
  </>
}
