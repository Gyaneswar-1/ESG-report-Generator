import React, { useState, useMemo } from 'react'
import {
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  MenuItem,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

import { DISCLOSURE_ITEMS } from '../data/esgData'
import type { EsgPillarType } from '../types/esg'

export const DisclosuresTable: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | EsgPillarType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filteredDisclosures = useMemo(() => {
    return DISCLOSURE_ITEMS.filter((item) => {
      const matchesTab = selectedTab === 'all' || item.pillar === selectedTab
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.auditProof.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesTab && matchesStatus && matchesSearch
    })
  }, [selectedTab, statusFilter, searchQuery])

  const envCount = DISCLOSURE_ITEMS.filter((i) => i.pillar === 'environmental').length
  const socCount = DISCLOSURE_ITEMS.filter((i) => i.pillar === 'social').length
  const govCount = DISCLOSURE_ITEMS.filter((i) => i.pillar === 'governance').length

  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      {/* Header */}
      <Box sx={{ mb: 3.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
          ESG Metrics & Statutory Disclosures
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          Quantitative ESG indicators aligned with SEBI BRSR Core 9 Principles, GRI 2026, and GHG Protocol across MEIL Group
        </Typography>
      </Box>

      {/* Top 4 KPI Metric Summary Cards (Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: { xs: 2, sm: 2.25, md: 2.5 },
          mb: 3.5,
        }}
      >
        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Total Disclosures</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>{DISCLOSURE_ITEMS.length}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <CheckCircleIcon sx={{ fontSize: 13, color: '#10b981' }} />
              <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 700 }}>100% Assurance Ready</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Environmental (E)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>{envCount} Metrics</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Scope 1-3, Energy, Water, Waste</Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Social & Workforce (S)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1d4ed8', mt: 0.5 }}>{socCount} Metrics</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Zero Fatalities, LTIFR: 0.12</Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Corporate Governance (G)</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#b45309', mt: 0.5 }}>{govCount} Metrics</Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>100% Anti-Bribery Compliance</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Main Table Card */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflow: 'hidden' }}>
        {/* Table Controls Bar */}
        <Box
          sx={{
            p: 2.5,
            borderBottom: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
          }}
        >
          {/* Pillar Tabs */}
          <Tabs
            value={selectedTab}
            onChange={(_e, val) => setSelectedTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              minHeight: 40,
              '& .MuiTab-root': {
                minHeight: 40,
                py: 0.75,
                px: 2,
                fontSize: '0.825rem',
                fontWeight: 600,
                textTransform: 'none',
              },
            }}
          >
            <Tab label={`All Disclosures (${DISCLOSURE_ITEMS.length})`} value="all" />
            <Tab label={`Environmental (${envCount})`} value="environmental" />
            <Tab label={`Social (${socCount})`} value="social" />
            <Tab label={`Governance (${govCount})`} value="governance" />
          </Tabs>

          {/* Search & Status Filters */}
          <Box sx={{ display: 'flex', gap: 1.5, width: { xs: '100%', md: 'auto' }, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search code, title, voucher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: '#64748b' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: '100%', sm: 260 } }}
            />

            <TextField
              select
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ width: { xs: '100%', sm: 140 } }}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Verified">Verified</MenuItem>
              <MenuItem value="Compliant">Compliant</MenuItem>
              <MenuItem value="Audited">Audited</MenuItem>
            </TextField>
          </Box>
        </Box>

        {/* Data Table */}
        <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>STATUTORY CODE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>DISCLOSURE METRIC & CATEGORY</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>BASELINE (FY23)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>CURRENT (FY24)</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>CHANGE</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>AUDIT EVIDENCE VOUCHER</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>STATUS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDisclosures.map((item) => (
                <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell>
                    <Chip
                      label={item.code}
                      size="small"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        bgcolor: '#f1f5f9',
                        color: '#0f172a',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {item.category} • {item.unit}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                    {item.baselineValue}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}>
                    {item.currentValue}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: item.isImprovement ? '#ecfdf5' : '#fef2f2',
                        color: item.isImprovement ? '#15803d' : '#b91c1c',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    >
                      {item.isImprovement ? <ArrowDownwardIcon sx={{ fontSize: 13 }} /> : <ArrowUpwardIcon sx={{ fontSize: 13 }} />}
                      {item.change}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PictureAsPdfIcon sx={{ fontSize: 16, color: '#dc2626' }} />
                      <Typography variant="caption" sx={{ color: '#334155', fontWeight: 500 }}>
                        {item.auditProof}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      size="small"
                      icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: '#166534 !important' }} />}
                      label={item.status}
                      sx={{
                        bgcolor: '#dcfce7',
                        color: '#166534',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Card>
    </Box>
  )
}
export default DisclosuresTable
