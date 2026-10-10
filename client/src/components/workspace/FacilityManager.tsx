import React, { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import type { Site } from '../../store/api'
import { useCreateSiteMutation } from '../../store/api'

interface FacilityManagerProps {
  sites: Site[]
}

export const FacilityManager: React.FC<FacilityManagerProps> = ({ sites }) => {
  const [createSiteOpen, setCreateSiteOpen] = useState(false)
  const [siteForm, setSiteForm] = useState({
    group: 'MEIL Corporate Group',
    subsidiary: '',
    site: '',
    region: '',
  })
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [createSite, { isLoading }] = useCreateSiteMutation()

  const handleSaveSite = async () => {
    if (!siteForm.subsidiary.trim() || !siteForm.site.trim() || !siteForm.region.trim()) {
      setErrorMessage('Please fill in subsidiary name, site/project name, and operational region.')
      return
    }

    try {
      setErrorMessage(null)
      await createSite(siteForm).unwrap()
      setCreateSiteOpen(false)
      setSiteForm({ group: 'MEIL Corporate Group', subsidiary: '', site: '', region: '' })
    } catch (err: any) {
      setErrorMessage(err.data?.message || 'Failed to create site entity.')
    }
  }

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Enterprise Hierarchy & Operational Facilities
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Hierarchical 3-level tree: <strong>Group &rarr; Subsidiary &rarr; Leaf Site</strong>. Telemetry is collected strictly at the operational site level.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddCircleOutlineRoundedIcon />}
          onClick={() => setCreateSiteOpen(true)}
          sx={{ bgcolor: '#0f172a', fontWeight: 700 }}
        >
          Add New Operational Facility
        </Button>
      </Box>

      <Grid container spacing={2.5}>
        {sites.map((s) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={s.id}>
            <Card variant="outlined" sx={{ height: '100%', borderRadius: 2.5, borderColor: '#cbd5e1' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', mb: 1.5 }}>
                  <LocationOnOutlinedIcon sx={{ color: '#0d9488', mt: 0.25 }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                      {s.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Region: <strong>{s.region || 'India'}</strong>
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: '#475569' }}>
                    Subsidiary: <strong>{s.subsidiary}</strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Holding Group: {s.group || 'MEIL Corporate Group'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0d9488', fontWeight: 600, mt: 0.5 }}>
                    Leaf Reporting Node • ISO 14064 Scoped
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Site Dialog */}
      <Dialog open={createSiteOpen} onClose={() => setCreateSiteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Add Operational Facility / Site</DialogTitle>
        <DialogContent dividers>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Parent Holding Group"
              fullWidth
              size="small"
              value={siteForm.group}
              onChange={(e) => setSiteForm({ ...siteForm, group: e.target.value })}
            />
            <TextField
              label="Subsidiary Company Name"
              placeholder="e.g. MEIL Water & Natural Resources"
              fullWidth
              size="small"
              value={siteForm.subsidiary}
              onChange={(e) => setSiteForm({ ...siteForm, subsidiary: e.target.value })}
            />
            <TextField
              label="Operational Site / Project Name"
              placeholder="e.g. Sambalpur Water Treatment Plant"
              fullWidth
              size="small"
              value={siteForm.site}
              onChange={(e) => setSiteForm({ ...siteForm, site: e.target.value })}
            />
            <TextField
              label="State / Operational Region"
              placeholder="e.g. Odisha Region"
              fullWidth
              size="small"
              value={siteForm.region}
              onChange={(e) => setSiteForm({ ...siteForm, region: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCreateSiteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveSite}
            disabled={isLoading}
            sx={{ bgcolor: '#0f172a', fontWeight: 700 }}
          >
            {isLoading ? 'Creating...' : 'Create Facility'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
