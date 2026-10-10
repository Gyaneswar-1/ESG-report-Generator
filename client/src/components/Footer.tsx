import React from 'react'
import { Box, Typography } from '@mui/material'

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 34,
        minHeight: 34,
        bgcolor: 'rgba(255, 255, 255, 0.96)',
        backdropFilter: 'blur(8px)',
        borderTop: '1px solid #e2e8f0',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        px: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, overflow: 'hidden' }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#0f172a',
              fontSize: '0.725rem',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
          >
            MEIL ESG Portal
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontSize: '0.6875rem',
              lineHeight: 1,
              display: { xs: 'none', sm: 'inline' },
              whiteSpace: 'nowrap',
            }}
          >
            • BRSR, CSRD & GRI Aligned
          </Typography>
        </Box>

        <Typography
          variant="caption"
          sx={{
            color: '#94a3b8',
            fontSize: '0.6875rem',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          © {new Date().getFullYear()} MEIL Group • Confidential Internal System
        </Typography>
      </Box>
    </Box>
  )
}
export default Footer

