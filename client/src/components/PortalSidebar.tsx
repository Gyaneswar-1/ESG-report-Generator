import React, { useState } from 'react'
import {
  Box,
  Typography,
  Avatar,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Drawer,
  IconButton,
} from '@mui/material'
import NatureIcon from '@mui/icons-material/Nature'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined'
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import TravelExploreOutlinedIcon from '@mui/icons-material/TravelExploreOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined'
import CloseIcon from '@mui/icons-material/Close'

import type { PortalRole } from '../types/dataEntry'

interface PortalSidebarProps {
  currentRole: PortalRole
  onRoleChange: (role: PortalRole) => void
  activeNav: string
  onNavChange: (navId: string) => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  currentRole,
  onRoleChange,
  activeNav,
  onNavChange,
  mobileOpen = false,
  onMobileClose,
}) => {
  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null)

  // Navigation items for each role matching the mockup
  const getNavItems = () => {
    switch (currentRole) {
      case 'SITE_ENGINEER':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
          { id: 'my-site', label: 'My Site', icon: <BusinessOutlinedIcon fontSize="small" /> },
          { id: 'data-entry', label: 'Data Entry', icon: <EditNoteOutlinedIcon fontSize="small" /> },
          { id: 'my-submissions', label: 'My Submissions', icon: <FactCheckOutlinedIcon fontSize="small" /> },
          { id: 'evidence-vault', label: 'Evidence Vault', icon: <FolderZipOutlinedIcon fontSize="small" /> },
        ]
      case 'CSO_ADMIN':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
          { id: 'sites-projects', label: 'Sites & Projects', badge: '11', icon: <BusinessOutlinedIcon fontSize="small" /> },
          { id: 'esg-metrics', label: 'ESG Metrics', icon: <AssessmentOutlinedIcon fontSize="small" /> },
          { id: 'reports', label: 'Reports (SEBI)', icon: <FactCheckOutlinedIcon fontSize="small" /> },
          { id: 'users-roles', label: 'Users & Roles', icon: <ManageAccountsOutlinedIcon fontSize="small" /> },
          { id: 'audit-trail', label: 'Audit Trail', icon: <SecurityOutlinedIcon fontSize="small" /> },
          { id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon fontSize="small" /> },
        ]
      case 'SUBSIDIARY_HEAD':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
          { id: 'my-subsidiary', label: 'My Subsidiary', icon: <BusinessOutlinedIcon fontSize="small" /> },
          { id: 'submissions', label: 'Submissions', icon: <FactCheckOutlinedIcon fontSize="small" /> },
          { id: 'approve-reject', label: 'Approve / Reject', icon: <VerifiedUserOutlinedIcon fontSize="small" /> },
          { id: 'sites', label: 'Sites', icon: <BusinessOutlinedIcon fontSize="small" /> },
          { id: 'reports', label: 'Reports', icon: <AssessmentOutlinedIcon fontSize="small" /> },
        ]
      case 'AUDITOR':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
          { id: 'explore-data', label: 'Explore Data', icon: <TravelExploreOutlinedIcon fontSize="small" /> },
          { id: 'evidence-vault', label: 'Evidence Vault', icon: <FolderZipOutlinedIcon fontSize="small" /> },
          { id: 'audit-trail', label: 'Audit Trail', icon: <SecurityOutlinedIcon fontSize="small" /> },
          { id: 'reports', label: 'Reports', icon: <AssessmentOutlinedIcon fontSize="small" /> },
        ]
    }
  }

  const getUserBadge = () => {
    switch (currentRole) {
      case 'SITE_ENGINEER':
        return {
          initials: 'SE',
          name: 'Site Engineer',
          subtitle: 'Bhubaneswar Water Grid',
          color: '#166534',
        }
      case 'CSO_ADMIN':
        return {
          initials: 'AD',
          name: 'Admin',
          subtitle: 'CSO / Super Admin',
          color: '#1e293b',
        }
      case 'SUBSIDIARY_HEAD':
        return {
          initials: 'SH',
          name: 'Subsidiary Head',
          subtitle: 'MEIL Power',
          color: '#0f766e',
        }
      case 'AUDITOR':
        return {
          initials: 'IA',
          name: 'Independent Auditor',
          subtitle: 'Verifier',
          color: '#047857',
        }
    }
  }

  const userBadge = getUserBadge()
  const navItems = getNavItems()

  const handleRoleSelect = (role: PortalRole) => {
    onRoleChange(role)
    setRoleMenuAnchor(null)
    if (onMobileClose) onMobileClose()
  }

  const handleNavItemClick = (id: string) => {
    onNavChange(id)
    if (onMobileClose) onMobileClose()
  }

  // Sidebar Inner Content Component
  const renderSidebarContent = (isMobile: boolean = false) => (
    <Box
      sx={{
        width: 240,
        height: '100%',
        bgcolor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: 2,
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* Top Branding matching the mockup */}
      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
            px: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                bgcolor: '#166534',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <NatureIcon sx={{ fontSize: 20 }} />
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.05rem',
                color: '#0f172a',
                letterSpacing: '-0.02em',
              }}
            >
              ESG Portal
            </Typography>
          </Box>

          {isMobile && onMobileClose && (
            <IconButton size="small" onClick={onMobileClose} sx={{ color: '#64748b' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {/* Clean Navigation List without dropdown clutter */}
        <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navItems.map((item) => {
            const isSelected = activeNav === item.id
            return (
              <ListItemButton
                key={item.id}
                onClick={() => handleNavItemClick(item.id)}
                sx={{
                  borderRadius: '8px',
                  py: 1,
                  px: 1.5,
                  bgcolor: isSelected ? '#e6f4ea' : 'transparent',
                  color: isSelected ? '#166534' : '#4b5563',
                  '&:hover': {
                    bgcolor: isSelected ? '#e6f4ea' : '#f8fafc',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 32,
                    color: isSelected ? '#166534' : '#6b7280',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Typography
                        sx={{
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 700 : 500,
                          color: isSelected ? '#166534' : '#374151',
                        }}
                      >
                        {item.label}
                      </Typography>
                      {item.badge && (
                        <Box
                          component="span"
                          sx={{
                            px: 0.8,
                            py: 0.1,
                            bgcolor: isSelected ? '#dcfce7' : '#f1f5f9',
                            color: isSelected ? '#166534' : '#64748b',
                            borderRadius: '10px',
                            fontSize: '0.675rem',
                            fontWeight: 700,
                            lineHeight: 1.4,
                          }}
                        >
                          {item.badge}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            )
          })}
        </List>
      </Box>

      {/* Bottom User Profile Badge with Role Switcher Menu */}
      <Box>
        <Divider sx={{ mb: 1.5, borderColor: '#f1f5f9' }} />
        <Box
          onClick={(e) => setRoleMenuAnchor(e.currentTarget)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.25,
            p: 1,
            borderRadius: '8px',
            bgcolor: '#f8fafc',
            border: '1px solid #f1f5f9',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            '&:hover': {
              bgcolor: '#f1f5f9',
              borderColor: '#e2e8f0',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, overflow: 'hidden' }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: userBadge.color,
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              {userBadge.initials}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: '0.8rem',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {userBadge.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontSize: '0.675rem',
                  display: 'block',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                }}
              >
                {userBadge.subtitle}
              </Typography>
            </Box>
          </Box>
          <UnfoldMoreOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
        </Box>

        {/* Role Switcher Menu */}
        <Menu
          anchorEl={roleMenuAnchor}
          open={Boolean(roleMenuAnchor)}
          onClose={() => setRoleMenuAnchor(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          slotProps={{
            paper: {
              sx: {
                width: 230,
                borderRadius: 2,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0',
                p: 0.5,
              },
            },
          }}
        >
          <Typography variant="caption" sx={{ px: 1.5, py: 0.5, display: 'block', color: '#94a3b8', fontWeight: 700 }}>
            SWITCH PERSPECTIVE
          </Typography>
          <MenuItem
            selected={currentRole === 'CSO_ADMIN'}
            onClick={() => handleRoleSelect('CSO_ADMIN')}
            sx={{ fontSize: '0.8rem', fontWeight: 600, borderRadius: 1 }}
          >
            CSO / Super Admin
          </MenuItem>
          <MenuItem
            selected={currentRole === 'SITE_ENGINEER'}
            onClick={() => handleRoleSelect('SITE_ENGINEER')}
            sx={{ fontSize: '0.8rem', fontWeight: 600, borderRadius: 1 }}
          >
            Site Engineer (Data Entry)
          </MenuItem>
          <MenuItem
            selected={currentRole === 'SUBSIDIARY_HEAD'}
            onClick={() => handleRoleSelect('SUBSIDIARY_HEAD')}
            sx={{ fontSize: '0.8rem', fontWeight: 600, borderRadius: 1 }}
          >
            Subsidiary Head (Approvals)
          </MenuItem>
          <MenuItem
            selected={currentRole === 'AUDITOR'}
            onClick={() => handleRoleSelect('AUDITOR')}
            sx={{ fontSize: '0.8rem', fontWeight: 600, borderRadius: 1 }}
          >
            Independent Auditor (Verifier)
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  )

  return (
    <>
      {/* Desktop Persistent Left Panel: Visible on >= 1024px */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: 240,
          minWidth: 240,
          flexShrink: 0,
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          borderRight: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          zIndex: 1000,
          overflowY: 'auto',
        }}
      >
        {renderSidebarContent(false)}
      </Box>

      {/* Mobile / Tablet Drawer: Shown below 1024px when toggled */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={onMobileClose}
        sx={{ display: { xs: 'block', lg: 'none' } }}
        slotProps={{
          paper: {
            sx: {
              width: 240,
              bgcolor: '#ffffff',
            },
          },
        }}
      >
        {renderSidebarContent(true)}
      </Drawer>
    </>
  )
}
export default PortalSidebar
