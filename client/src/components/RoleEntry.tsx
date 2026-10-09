import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Box, Button, Card, CardActionArea, Container, Stack, TextField, Typography } from '@mui/material'
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined'
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined'
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import { signIn, type UserRole } from '../store/authSlice'
import type { AppDispatch } from '../store'

const roles: { id: UserRole; title: string; description: string; icon: React.ReactNode }[] = [
  { id: 'engineer', title: 'Site Engineer', description: 'Data entry, site metrics, evidence uploads', icon: <EngineeringOutlinedIcon /> },
  { id: 'hse', title: 'HSE Officer', description: 'Safety incidents, working hours, headcount', icon: <HealthAndSafetyOutlinedIcon /> },
  { id: 'executive', title: 'CSO / Executive', description: 'Group KPIs, emissions, site comparisons', icon: <InsightsOutlinedIcon /> },
  { id: 'auditor', title: 'Statutory Auditor', description: 'Evidence verification, audit trails, reports', icon: <FactCheckOutlinedIcon /> },
]

export function RoleEntry() {
  const dispatch = useDispatch<AppDispatch>()
  const [selected, setSelected] = useState<UserRole | null>(null)
  const [name, setName] = useState('')

  const enter = () => selected && dispatch(signIn({ role: selected, name: name.trim() || roles.find((role) => role.id === selected)!.title }))

  return (
    <Box className="entry-page">
      <Container maxWidth="md">
        <Box className="entry-shell">
          <Box className="entry-brand">
            <PublicOutlinedIcon sx={{ fontSize: 25, color: 'primary.main' }} />
            <Typography variant="h5">EcoTrace ESG Portal</Typography>
            <Typography color="text.secondary">One simple workspace for every ESG role</Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ mb: 2.5, alignItems: 'center', justifyContent: 'center' }}>
            <Box className="step-dot active">1</Box><Typography variant="body2">Choose your role</Typography>
            <Box className="step-line" /><Box className="step-dot">2</Box><Typography variant="body2" color="text.secondary">Open your workspace</Typography>
          </Stack>
          <Box className="role-grid">
            {roles.map((role) => (
              <Card key={role.id} className={`role-card ${selected === role.id ? 'selected' : ''}`}>
                <CardActionArea onClick={() => setSelected(role.id)} sx={{ height: '100%', p: 2 }}>
                  <Box className="role-icon">{role.icon}</Box>
                  <Typography variant="h6" sx={{ mt: 1 }}>{role.title}</Typography>
                  <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>{role.description}</Typography>
                </CardActionArea>
              </Card>
            ))}
          </Box>
          <Box className="entry-actions">
            <TextField size="small" label="Your name" placeholder="e.g. Asha Das" value={name} onChange={(event) => setName(event.target.value)} />
            <Button size="large" variant="contained" endIcon={<ArrowForwardRoundedIcon />} disabled={!selected} onClick={enter}>Continue to workspace</Button>
          </Box>
          <Typography className="entry-note" variant="caption">Select the role that matches your work. You can switch roles from your profile menu.</Typography>
        </Box>
      </Container>
    </Box>
  )
}
