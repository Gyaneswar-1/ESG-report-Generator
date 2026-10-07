import React, { useState } from 'react'
import {
  ThemeProvider,
  CssBaseline,
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
} from '@mui/material'
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined'
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'

import { esgTheme } from './theme/theme'
import { Navbar } from './components/Navbar'
import { OverviewMetrics } from './components/OverviewMetrics'
import { ReportGenerator } from './components/ReportGenerator'
import { DisclosuresTable } from './components/DisclosuresTable'
import { AuditLedger } from './components/AuditLedger'
import { FrameworkMapping } from './components/FrameworkMapping'
import { ReportModal } from './components/ReportModal'
import { Footer } from './components/Footer'

export const App: React.FC = () => {
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

  const handleOpenReportModal = () => {
    setReportModalOpen(true)
  }

  const handleCloseReportModal = () => {
    setReportModalOpen(false)
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue)
  }

  const handleGenerateClick = () => {
    setActiveTab(0)
    window.scrollTo({ top: 280, behavior: 'smooth' })
  }

  return (
    <ThemeProvider theme={esgTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f8fafc' }}>
        {/* Top Professional Navigation */}
        <Navbar
          onOpenReportModal={handleOpenReportModal}
          onGenerateClick={handleGenerateClick}
        />

        {/* Main Application Workspace */}
        <Container maxWidth="xl" sx={{ py: 3.5, flex: 1 }}>
          {/* Executive KPI Summary */}
          <OverviewMetrics />

          {/* Functional Workspaces / View Switcher */}
          <Paper sx={{ mb: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff', borderRadius: 1 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                px: 2,
                minHeight: 46,
                '& .MuiTab-root': {
                  minHeight: 46,
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 1,
                  alignItems: 'center',
                },
              }}
            >
              <Tab
                icon={<AutoGraphOutlinedIcon sx={{ fontSize: 18 }} />}
                label="Report Automation & Synthesis"
              />
              <Tab
                icon={<TableChartOutlinedIcon sx={{ fontSize: 18 }} />}
                label="Statutory Disclosures (E, S, G)"
              />
              <Tab
                icon={<ShieldOutlinedIcon sx={{ fontSize: 18 }} />}
                label="Audit Trail & Proof Ledger"
              />
              <Tab
                icon={<AccountBalanceOutlinedIcon sx={{ fontSize: 18 }} />}
                label="Framework Compliance Matrix"
              />
            </Tabs>
          </Paper>

          {/* Active Tab Panel */}
          {activeTab === 0 && (
            <ReportGenerator onOpenReportModal={handleOpenReportModal} />
          )}

          {activeTab === 1 && (
            <DisclosuresTable />
          )}

          {activeTab === 2 && (
            <AuditLedger />
          )}

          {activeTab === 3 && (
            <FrameworkMapping />
          )}
        </Container>

        {/* Minimal Footer */}
        <Footer />

        {/* Formal Statutory Report Inspection Modal */}
        <ReportModal open={reportModalOpen} onClose={handleCloseReportModal} />
      </Box>
    </ThemeProvider>
  )
}

export default App
