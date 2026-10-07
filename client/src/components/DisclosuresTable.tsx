import React, { useState, useMemo } from 'react'
import {
  Card,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import { DISCLOSURE_ITEMS } from '../data/esgData'
import type { EsgPillarType } from '../types/esg'

export const DisclosuresTable: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | EsgPillarType>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDisclosures = useMemo(() => {
    return DISCLOSURE_ITEMS.filter((item) => {
      const matchesTab = selectedTab === 'all' || item.pillar === selectedTab
      const matchesSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.auditProof.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesTab && matchesSearch
    })
  }, [selectedTab, searchQuery])

  return (
    <Card sx={{ mb: 4 }}>
      {/* Table Header & Controls */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
              Statutory ESG Disclosures & Performance Ledger
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Verified quantitative disclosure items mapped to SEBI BRSR Core, GRI 2026, and EU CSRD directives.
            </Typography>
          </Box>

          <TextField
            size="small"
            placeholder="Search metric, code, or voucher..."
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
            sx={{ width: { xs: '100%', sm: 300 } }}
          />
        </Box>

        {/* Tab Filters */}
        <Tabs
          value={selectedTab}
          onChange={(_e, val) => setSelectedTab(val)}
          sx={{
            minHeight: 38,
            '& .MuiTab-root': {
              minHeight: 38,
              py: 0.75,
              px: 2,
              fontSize: '0.8125rem',
            },
          }}
        >
          <Tab label={`All Disclosures (${DISCLOSURE_ITEMS.length})`} value="all" />
          <Tab
            label={`Environmental (${DISCLOSURE_ITEMS.filter((i) => i.pillar === 'environmental').length})`}
            value="environmental"
          />
          <Tab
            label={`Social (${DISCLOSURE_ITEMS.filter((i) => i.pillar === 'social').length})`}
            value="social"
          />
          <Tab
            label={`Governance (${DISCLOSURE_ITEMS.filter((i) => i.pillar === 'governance').length})`}
            value="governance"
          />
        </Tabs>
      </Box>

      {/* Table Content */}
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 140 }}>Mandate Standard</TableCell>
              <TableCell sx={{ minWidth: 260 }}>Disclosure Topic</TableCell>
              <TableCell sx={{ minWidth: 160 }}>Category</TableCell>
              <TableCell align="right" sx={{ minWidth: 110 }}>FY25 Base</TableCell>
              <TableCell align="right" sx={{ minWidth: 110 }}>FY26 Current</TableCell>
              <TableCell align="right" sx={{ minWidth: 110 }}>Variance</TableCell>
              <TableCell sx={{ minWidth: 110 }}>Assurance Status</TableCell>
              <TableCell sx={{ minWidth: 200 }}>Digital Proof Document</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDisclosures.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5, color: '#64748b' }}>
                  No matching disclosure records found.
                </TableCell>
              </TableRow>
            ) : (
              filteredDisclosures.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}
                    >
                      {row.code}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                      {row.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {row.unit}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem' }}>
                      {row.category}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8125rem' }}>
                      {row.baselineValue}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8125rem' }}>
                      {row.currentValue}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                      {row.change.startsWith('-') ? (
                        <ArrowDownwardIcon sx={{ fontSize: 13, color: '#0f172a' }} />
                      ) : row.change.startsWith('+') ? (
                        <ArrowUpwardIcon sx={{ fontSize: 13, color: '#0f172a' }} />
                      ) : null}
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8rem' }}>
                        {row.change}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={row.status}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 22,
                        fontSize: '0.675rem',
                        fontWeight: 600,
                        borderColor: '#cbd5e1',
                        color: '#1e293b',
                        bgcolor: '#f8fafc',
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#475569',
                          bgcolor: '#f1f5f9',
                          px: 1,
                          py: 0.25,
                          borderRadius: 0.5,
                          border: '1px solid #e2e8f0',
                          fontSize: '0.7rem',
                        }}
                      >
                        {row.auditProof}
                      </Typography>
                      <Tooltip title="View Verified Voucher Metadata">
                        <IconButton size="small" sx={{ color: '#64748b', p: 0.5 }}>
                          <OpenInNewIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}
