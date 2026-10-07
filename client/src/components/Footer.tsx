import React from 'react'
import { Box, Typography, Container } from '@mui/material'

export const Footer: React.FC = () => {
  return (
    <Box component="footer" sx={{ bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0', mt: 'auto', py: 3 }}>
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8125rem' }}>
              EcoPulse ESG Automation System
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Confidential internal reporting platform • Aligned with SEBI BRSR, EU CSRD & GRI Standards
            </Typography>
          </Box>

          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            © {new Date().getFullYear()} Apex Holdings Ltd. All disclosures subject to independent statutory assurance.
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}
