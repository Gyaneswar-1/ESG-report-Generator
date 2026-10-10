import React, { useState } from 'react'
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Tabs,
  Tab,
  Paper,
  Chip,
  Button,
  Typography,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

import { esgTheme } from './theme/theme'
import { ReportGenerator } from './components/ReportGenerator'
import { DisclosuresTable } from './components/DisclosuresTable'
import { AuditLedger } from './components/AuditLedger'
import { ReportModal } from './components/ReportModal'
import { Footer } from './components/Footer'

import { SiteEngineerDataEntry } from './components/SiteEngineerDataEntry'
import { MySubmissionsView } from './components/MySubmissionsView'
import { EvidenceDetailsDrawer } from './components/EvidenceDetailsDrawer'
import { CsoDashboard } from './components/CsoDashboard'
import { SitesProjectsView } from './components/SitesProjectsView'
import { UsersRolesView } from './components/UsersRolesView'
import { SettingsView } from './components/SettingsView'
import type { PortalRole, SubmissionItem, EvidenceFile } from './types/dataEntry'

const INITIAL_SUBMISSIONS: SubmissionItem[] = [
  {
    id: 'SUB-1042',
    site: 'Bhubaneswar Water Grid',
    category: 'Energy',
    metric: 'Diesel',
    period: 'Apr 2025',
    valueDisplay: '3.35 MT CO₂e',
    rawQuantity: 1250,
    unit: 'Liters',
    normalizedValue: '3.35 MT CO₂e',
    evidence: {
      name: 'diesel_bill_apr25.pdf',
      size: '2.4 MB',
      type: 'application/pdf',
      uploadedAt: '12 Apr 2025, 10:24 AM',
      hash: 'a2f5e2b1c9d40e4d2f7a8c1b3d6e9f0...7f8a2e1d5c6b9',
    },
    status: 'Pending',
    submittedAt: '12 Apr 2025, 10:24 AM',
    submittedBy: 'Site Engineer (Bhubaneswar)',
  },
  {
    id: 'SUB-1043',
    site: 'Rourkela Substation',
    category: 'Energy',
    metric: 'Grid Electricity',
    period: 'Apr 2025',
    valueDisplay: '125.6 MWh',
    rawQuantity: 125.6,
    unit: 'MWh',
    evidence: {
      name: 'electricity_bill_apr25.pdf',
      size: '1.9 MB',
      type: 'application/pdf',
      uploadedAt: '11 Apr 2025, 03:15 PM',
      hash: 'b4c7d9e1f2a3...6e7f8a9b0c1d2e3',
    },
    status: 'Pending',
    submittedAt: '11 Apr 2025, 03:15 PM',
    submittedBy: 'Site Engineer (Rourkela)',
  },
  {
    id: 'SUB-1040',
    site: 'Odisha Pipeline',
    category: 'Water',
    metric: 'Water Extraction',
    period: 'Apr 2025',
    valueDisplay: '45,230 KL',
    rawQuantity: 45230,
    unit: 'KL',
    evidence: {
      name: 'water_meter_log_apr25.pdf',
      size: '3.2 MB',
      type: 'application/pdf',
      uploadedAt: '09 Apr 2025, 09:30 AM',
      hash: 'd1e2f3a4b5c6...7a8b9c0d1e2f3a4',
    },
    status: 'Approved',
    submittedAt: '09 Apr 2025, 09:30 AM',
    submittedBy: 'Site Engineer (Odisha)',
  },
  {
    id: 'SUB-1039',
    site: 'Vizag Port',
    category: 'Waste',
    metric: 'Solid Waste',
    period: 'Apr 2025',
    valueDisplay: '32.4 MT',
    rawQuantity: 32.4,
    unit: 'MT',
    evidence: {
      name: 'port_waste_manifest_apr25.pdf',
      size: '1.4 MB',
      type: 'application/pdf',
      uploadedAt: '08 Apr 2025, 04:45 PM',
      hash: 'e9f8a7b6c5d4...3e2d1c0b9a8f7e6',
    },
    status: 'Pending',
    submittedAt: '08 Apr 2025, 04:45 PM',
    submittedBy: 'Site Engineer (Vizag)',
  },
  {
    id: 'SUB-1035',
    site: 'Hyderabad Metro',
    category: 'Energy',
    metric: 'Diesel',
    period: 'Apr 2025',
    valueDisplay: '12.4 MT CO₂e',
    rawQuantity: 4620,
    unit: 'Liters',
    evidence: {
      name: 'metro_fuel_receipt_apr25.pdf',
      size: '2.1 MB',
      type: 'application/pdf',
      uploadedAt: '05 Apr 2025, 11:10 AM',
      hash: 'f0e1d2c3b4a5...6f7e8d9c0b1a2f3',
    },
    status: 'Rejected',
    submittedAt: '05 Apr 2025, 11:10 AM',
    submittedBy: 'Site Engineer (Hyderabad)',
  },
]

export const App: React.FC = () => {
  // Primary role state: defaults to CSO_ADMIN (Corporate Overview)
  const [currentRole, setCurrentRole] = useState<PortalRole>('CSO_ADMIN')
  const [activeNav, setActiveNav] = useState<string>('dashboard')

  // Statutory Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false)

  // Submissions list
  const [submissions, setSubmissions] = useState<SubmissionItem[]>(INITIAL_SUBMISSIONS)

  // Slide-Over Audit Drawer state (Screen 5)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceFile | null>(null)
  const [drawerMetric, setDrawerMetric] = useState('Diesel')
  const [drawerSite, setDrawerSite] = useState('Bhubaneswar Water Grid')

  const handleOpenEvidenceDrawer = (
    evidence: EvidenceFile,
    metricName: string = 'Diesel',
    siteName: string = 'Bhubaneswar Water Grid'
  ) => {
    setSelectedEvidence(evidence)
    setDrawerMetric(metricName)
    setDrawerSite(siteName)
    setDrawerOpen(true)
  }

  const handleCloseEvidenceDrawer = () => {
    setDrawerOpen(false)
  }

  const handleNewSubmission = (newSub: SubmissionItem) => {
    setSubmissions((prev) => [newSub, ...prev])
  }


  const [roleMenuAnchor, setRoleMenuAnchor] = useState<null | HTMLElement>(null)

  const getRoleDetails = (role: PortalRole) => {
    switch (role) {
      case 'SITE_ENGINEER':
        return { initials: 'SE', label: 'Site Engineer', color: '#166534', bg: '#dcfce7' }
      case 'CSO_ADMIN':
        return { initials: 'CSO', label: 'CSO / Admin', color: '#1e3a8a', bg: '#dbeafe' }
      case 'SUBSIDIARY_HEAD':
        return { initials: 'SH', label: 'Subsidiary Head', color: '#0f766e', bg: '#ccfbf1' }
      case 'AUDITOR':
        return { initials: 'AU', label: 'Auditor (Verifier)', color: '#7e22ce', bg: '#f3e8ff' }
    }
  }

  const currentRoleData = getRoleDetails(currentRole)

  const handleRoleChange = (role: PortalRole) => {
    setCurrentRole(role)
    if (role === 'SITE_ENGINEER') {
      setActiveNav('data-entry')
    } else {
      setActiveNav('dashboard')
    }
    setRoleMenuAnchor(null)
  }

  return (
    <ThemeProvider theme={esgTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
        {/* Sticky Site Header & Navbar */}
        <Box
          component="header"
          sx={{
            bgcolor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            zIndex: 1100,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* Top Brand & Actions Bar */}
          <Box
            sx={{
              maxWidth: '1440px',
              mx: 'auto',
              px: { xs: 2, sm: 3, md: 4 },
              py: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  color: '#0f172a',
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  letterSpacing: '-0.01em',
                }}
              >
                MEIL Sustainability Cloud
              </Typography>
              <Chip
                label="LIVE FY 2024-25"
                size="small"
                sx={{
                  bgcolor: '#dcfce7',
                  color: '#15803d',
                  fontWeight: 700,
                  fontSize: '0.675rem',
                  height: 22,
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setReportModalOpen(true)}
                sx={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderColor: '#cbd5e1',
                  color: '#334155',
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              >
                Sample Statutory PDF
              </Button>

              {/* Role Perspective Selector */}
              <Button
                size="small"
                onClick={(e) => setRoleMenuAnchor(e.currentTarget)}
                endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: currentRoleData.bg,
                  color: currentRoleData.color,
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 1.25,
                  py: 0.5,
                  border: '1px solid transparent',
                  '&:hover': {
                    bgcolor: currentRoleData.bg,
                    filter: 'brightness(0.95)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 22,
                    height: 22,
                    bgcolor: currentRoleData.color,
                    color: '#ffffff',
                    fontSize: '0.625rem',
                    fontWeight: 700,
                    mr: 0.8,
                  }}
                >
                  {currentRoleData.initials}
                </Avatar>
                {currentRoleData.label}
              </Button>

              <Menu
                anchorEl={roleMenuAnchor}
                open={Boolean(roleMenuAnchor)}
                onClose={() => setRoleMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    sx: {
                      width: 240,
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
                  onClick={() => handleRoleChange('CSO_ADMIN')}
                  sx={{ fontSize: '0.8rem', fontWeight: 600, borderRadius: 1 }}
                >
                  CSO / Super Admin
                </MenuItem>
                <MenuItem
                  selected={currentRole === 'SITE_ENGINEER'}
                  onClick={() => handleRoleChange('SITE_ENGINEER')}
                  sx={{ fontSize: '0.8rem', fontWeight: 600, borderRadius: 1 }}
                >
                  Site Engineer (Data Entry)
                </MenuItem>
                <MenuItem
                  selected={currentRole === 'SUBSIDIARY_HEAD'}
                  onClick={() => handleRoleChange('SUBSIDIARY_HEAD')}
                  sx={{ fontSize: '0.8rem', fontWeight: 600, borderRadius: 1 }}
                >
                  Subsidiary Head (Approvals)
                </MenuItem>
                <MenuItem
                  selected={currentRole === 'AUDITOR'}
                  onClick={() => handleRoleChange('AUDITOR')}
                  sx={{ fontSize: '0.8rem', fontWeight: 600, borderRadius: 1 }}
                >
                  Independent Auditor (Verifier)
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Site Navigation Tabs Bar */}
          <Box sx={{ borderTop: '1px solid #f1f5f9', px: { xs: 2, sm: 3, md: 4 } }}>
            <Box sx={{ maxWidth: '1440px', mx: 'auto' }}>
              <Tabs
                value={
                  ['dashboard', 'sites-projects', 'esg-metrics', 'reports', 'users-roles', 'audit-trail', 'settings', 'data-entry', 'my-submissions'].includes(activeNav)
                    ? activeNav
                    : 'dashboard'
                }
                onChange={(_e, v) => setActiveNav(v)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 46,
                  '& .MuiTabs-indicator': {
                    bgcolor: '#059669',
                    height: 2.5,
                    borderRadius: '2px 2px 0 0',
                  },
                  '& .MuiTab-root': {
                    minHeight: 46,
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    color: '#64748b',
                    px: { xs: 1.5, sm: 2 },
                    '&.Mui-selected': {
                      color: '#065f46',
                      fontWeight: 700,
                    },
                    '&:hover': {
                      color: '#0f172a',
                    },
                  },
                }}
              >
                <Tab value="dashboard" label="Corporate Overview" />
                <Tab value="sites-projects" label="Sites & Projects (11)" />
                <Tab value="esg-metrics" label="ESG Metrics (BRSR/GRI)" />
                <Tab value="reports" label="Reports (SEBI)" />
                <Tab value="users-roles" label="Users & Roles" />
                <Tab value="audit-trail" label="Audit Trail & Ledger" />
                <Tab value="settings" label="Settings" />
                {currentRole === 'SITE_ENGINEER' && (
                  <Tab value="data-entry" label="Data Entry Form" />
                )}
                {currentRole === 'SITE_ENGINEER' && (
                  <Tab value="my-submissions" label={`My Submissions (${submissions.length})`} />
                )}
              </Tabs>
            </Box>
          </Box>
        </Box>

        {/* Main Body Content */}
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, pb: { xs: 7, sm: 7, md: 8 }, flex: 1, width: '100%', boxSizing: 'border-box' }}>
          <Box sx={{ maxWidth: '1440px', mx: 'auto' }}>
            {activeNav === 'dashboard' && (
              <CsoDashboard
                onOpenReportModal={() => setReportModalOpen(true)}
                onNavigateToTab={(tab) => {
                  if (tab === 'reports') setActiveNav('reports')
                  else if (tab === 'metrics') setActiveNav('esg-metrics')
                }}
              />
            )}
            {activeNav === 'sites-projects' && <SitesProjectsView />}
            {activeNav === 'esg-metrics' && <DisclosuresTable />}
            {activeNav === 'reports' && <ReportGenerator onOpenReportModal={() => setReportModalOpen(true)} />}
            {activeNav === 'users-roles' && <UsersRolesView />}
            {activeNav === 'audit-trail' && <AuditLedger />}
            {activeNav === 'settings' && <SettingsView />}
            {activeNav === 'data-entry' && (
              <SiteEngineerDataEntry
                onNewSubmission={handleNewSubmission}
                onViewEvidenceDrawer={handleOpenEvidenceDrawer}
              />
            )}
            {activeNav === 'my-submissions' && (
              <MySubmissionsView
                submissions={submissions}
                onViewEvidence={handleOpenEvidenceDrawer}
                onNavigateToDataEntry={() => setActiveNav('data-entry')}
              />
            )}
          </Box>
        </Box>

        {/* Minimal Fixed Footer */}
        <Footer />

        {/* Slide-Over Audit Drawer (Screen 5) */}
        <EvidenceDetailsDrawer
          open={drawerOpen}
          onClose={handleCloseEvidenceDrawer}
          evidence={selectedEvidence}
          metricName={drawerMetric}
          siteName={drawerSite}
        />

        {/* Formal Statutory Report Inspection Modal */}
        <ReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
      </Box>
    </ThemeProvider>
  )
}

export default App
