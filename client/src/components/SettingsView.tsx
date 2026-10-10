import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Chip,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
} from '@mui/material'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'

export const SettingsView: React.FC = () => {
  const [dieselFactor, setDieselFactor] = useState('2.68')
  const [gridFactor, setGridFactor] = useState('0.82')
  const [naturalGasFactor, setNaturalGasFactor] = useState('2.03')
  const [waterFactor, setWaterFactor] = useState('0.34')
  const [autoVerify, setAutoVerify] = useState(true)
  const [outlierAlerts, setOutlierAlerts] = useState(true)
  const [massBalanceValidation, setMassBalanceValidation] = useState(true)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Enterprise ESG Governance Settings
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Configure standard emission factors, reporting deadlines, and automated statutory assurance rules
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<SaveOutlinedIcon />}
          onClick={handleSave}
          sx={{
            bgcolor: '#064e3b',
            color: '#ffffff',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { bgcolor: '#043e2e' },
          }}
        >
          Save Configuration
        </Button>
      </Box>

      {/* Grid of Settings Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
        {/* Card 1: Standard Emission Factors */}
        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1rem' }}>
              Standard Emission Factors (IPCC / CEA Baseline)
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2.5 }}>
              Emission coefficients applied automatically across all 250+ MEIL site submissions
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Diesel Fuel (kg CO₂e per liter)"
                value={dieselFactor}
                onChange={(e) => setDieselFactor(e.target.value)}
                helperText="Standard DEFRA/IPCC factor for high-speed commercial diesel"
              />

              <TextField
                fullWidth
                size="small"
                label="Regional Grid Electricity (kg CO₂e per kWh)"
                value={gridFactor}
                onChange={(e) => setGridFactor(e.target.value)}
                helperText="Central Electricity Authority (CEA) User Guide v19 Indian Grid Average"
              />

              <TextField
                fullWidth
                size="small"
                label="Natural Gas (kg CO₂e per m³)"
                value={naturalGasFactor}
                onChange={(e) => setNaturalGasFactor(e.target.value)}
                helperText="Standard commercial gas heating coefficient"
              />

              <TextField
                fullWidth
                size="small"
                label="Municipal Water Supply (kg CO₂e per kL)"
                value={waterFactor}
                onChange={(e) => setWaterFactor(e.target.value)}
                helperText="Embodied treatment and distribution energy factor"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Card 2: Reporting Deadlines & Cycle */}
        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1rem' }}>
              Statutory Reporting Schedule
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2.5 }}>
              Cycle parameters and submission cutoff deadlines
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Active Reporting Period"
                defaultValue="FY 2024-25 (Annual Statutory Cycle)"
              />

              <TextField
                fullWidth
                size="small"
                label="Monthly Submission Cutoff"
                defaultValue="15th of the following month (11:59 PM IST)"
              />

              <TextField
                fullWidth
                size="small"
                label="Auditor Verification SLA"
                defaultValue="7 business days following subsidiary signoff"
              />

              <TextField
                fullWidth
                size="small"
                label="SEBI BRSR Submission Deadline"
                defaultValue="31 May 2025"
              />
            </Box>
          </CardContent>
        </Card>

        {/* Card 3: Cryptographic Integrity & Assurance */}
        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1rem' }}>
              Statutory Audit & Hash Ledger
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2.5 }}>
              Cryptographic integrity parameters for third-party assurance
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <FormControlLabel
                control={<Switch checked={autoVerify} onChange={(e) => setAutoVerify(e.target.checked)} color="success" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                      Automated SHA-256 Hash Generation
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Compute and record cryptographic proof on every uploaded PDF bill
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch checked={massBalanceValidation} onChange={(e) => setMassBalanceValidation(e.target.checked)} color="success" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                      Enforce Mass Balance Conservation Rules
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Block submissions where recycled or diverted quantities exceed input generation
                    </Typography>
                  </Box>
                }
              />

              <FormControlLabel
                control={<Switch checked={outlierAlerts} onChange={(e) => setOutlierAlerts(e.target.checked)} color="success" />}
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                      Variance & Outlier Detection Alerts
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      Notify Subsidiary Head if reported monthly utility variance exceeds ±15%
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </CardContent>
        </Card>

        {/* Card 4: Compliance Framework Enablement */}
        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 1, fontSize: '1rem' }}>
              Active Statutory Frameworks
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mb: 2.5 }}>
              Standards mapped to reporting engine synthesis
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { name: 'SEBI BRSR Core', desc: 'Mandatory 9 Principles for Top 1,000 Listed Entities', status: 'Enabled' },
                { name: 'GRI Universal Standards', desc: 'Global Reporting Initiative Sustainability Metrics', status: 'Enabled' },
                { name: 'GHG Corporate Protocol', desc: 'Scope 1, Scope 2, and Scope 3 Emissions Standard', status: 'Enabled' },
                { name: 'EU CSRD / ESRS', desc: 'European Union Double Materiality Readiness', status: 'Active (Pilot)' },
              ].map((fw) => (
                <Box
                  key={fw.name}
                  sx={{
                    p: 1.5,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>{fw.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>{fw.desc}</Typography>
                  </Box>
                  <Chip size="small" label={fw.status} color="success" sx={{ fontWeight: 700, fontSize: '0.675rem' }} />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Confirmation Snackbar */}
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSaved(false)}
          severity="success"
          sx={{ bgcolor: '#064e3b', color: '#ffffff', fontWeight: 600, '& .MuiAlert-icon': { color: '#86efac' } }}
        >
          ✓ ESG Governance settings and emission factors saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  )
}
export default SettingsView
