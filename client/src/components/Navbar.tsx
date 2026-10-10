import React from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  Tooltip,
} from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import { IconButton } from '@mui/material'
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined'
import type { UserRole } from '../store/authSlice'

interface NavbarProps {
  onOpenReportModal: () => void
  onGenerateClick?: () => void
  role: UserRole
  name: string
  onSwitchRole: () => void
}

const roleNames: Record<UserRole, string> = { engineer: 'Site Engineer', subsidiary_head: 'Subsidiary Head', executive: 'CSO / Super Admin', auditor: 'Independent Auditor' }

export const Navbar: React.FC<NavbarProps> = ({ onOpenReportModal, onGenerateClick, role, name, onSwitchRole }) => {
  return (
    <AppBar position="sticky" color="default" sx={{ bgcolor: '#ffffff' }}>
      <Toolbar
        sx={{
          maxWidth: '1440px',
          width: '100%',
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          minHeight: '64px',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand & System Title */}
        <Box sx={{ display: 'flex', items: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              bgcolor: '#0f172a',
              color: '#ffffff',
              borderRadius: 1,
            }}
          >
            <AssessmentOutlinedIcon fontSize="small" />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  letterSpacing: '-0.01em',
                  color: '#0f172a',
                  lineHeight: 1.2,
                }}
              >
                MEIL ESG Portal
              </Typography>
              <Chip
                label={roleNames[role]}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: '0.675rem',
                  fontWeight: 600,
                  borderColor: '#cbd5e1',
                  color: '#475569',
                  bgcolor: '#f8fafc',
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ color: '#64748b', fontSize: '0.725rem', display: 'block' }}
            >
              Megha Engineering & Infrastructures Ltd • Statutory Reporting
            </Typography>
          </Box>
        </Box>

        {/* Center / Entity Context */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 0.75,
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 1,
          }}
        >
          <BusinessIcon sx={{ fontSize: 16, color: '#64748b' }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
            MEIL Group (Megha Engineering)
          </Typography>
          <Typography variant="caption" sx={{ color: '#94a3b8' }}>
            |
          </Typography>
          <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>
            Cycle: FY 2024-25
          </Typography>
          <Tooltip title="External Assurance Readiness: Clean Opinion">
            <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}>
              <VerifiedUserOutlinedIcon sx={{ fontSize: 15, color: '#334155' }} />
            </Box>
          </Tooltip>
        </Box>

        {/* Action Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {(role === 'executive' || role === 'auditor') && <Button
            variant="outlined"
            size="small"
            startIcon={<PictureAsPdfOutlinedIcon fontSize="small" />}
            onClick={onOpenReportModal}
            sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
          >
            Sample Statutory PDF
          </Button>}
          <Tooltip title={`Switch role${name ? ` · ${name}` : ''}`}>
            <IconButton onClick={onSwitchRole} aria-label="Switch role" size="small" sx={{ color: 'text.secondary', border: '1px solid', borderColor: 'divider' }}>
              <LogoutOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {(role === 'executive' || role === 'auditor') && <Button
            variant="contained"
            size="small"
            onClick={onGenerateClick}
            sx={{ fontWeight: 600, fontSize: '0.8125rem' }}
          >
            Generate Report
          </Button>}
        </Box>
      </Toolbar>
    </AppBar>
  )
}
