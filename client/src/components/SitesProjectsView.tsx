import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  LinearProgress,
} from '@mui/material'
import BusinessIcon from '@mui/icons-material/Business'
import SearchIcon from '@mui/icons-material/Search'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'

interface SiteProject {
  id: string
  name: string
  subsidiary: string
  region: string
  emissionsMT: number
  completionPct: number
  siteEngineer: string
  status: 'Verified' | 'Active' | 'Under Review'
}

const SITES_DATA: SiteProject[] = [
  {
    id: 'SITE-01',
    name: 'Hyderabad Metro Rail Project',
    subsidiary: 'MEIL Infrastructure',
    region: 'South India',
    emissionsMT: 32450,
    completionPct: 100,
    siteEngineer: 'Rajesh Kumar',
    status: 'Verified',
  },
  {
    id: 'SITE-02',
    name: 'Odisha Water Grid Pipeline',
    subsidiary: 'MEIL Water Grid',
    region: 'East India',
    emissionsMT: 28320,
    completionPct: 92,
    siteEngineer: 'Amit Patnaik',
    status: 'Active',
  },
  {
    id: 'SITE-03',
    name: 'Rourkela 400kV Substation',
    subsidiary: 'MEIL Power',
    region: 'East India',
    emissionsMT: 18240,
    completionPct: 85,
    siteEngineer: 'Suresh Mohanty',
    status: 'Active',
  },
  {
    id: 'SITE-04',
    name: 'Vizag International Port Terminal',
    subsidiary: 'MEIL Maritime',
    region: 'South India',
    emissionsMT: 12450,
    completionPct: 100,
    siteEngineer: 'Vikram Naidu',
    status: 'Verified',
  },
  {
    id: 'SITE-05',
    name: 'Bangalore Urban Water Grid',
    subsidiary: 'MEIL Water Grid',
    region: 'South India',
    emissionsMT: 9870,
    completionPct: 78,
    siteEngineer: 'Priya Sharma',
    status: 'Under Review',
  },
  {
    id: 'SITE-06',
    name: 'Bhubaneswar Water Grid Station',
    subsidiary: 'MEIL Water Grid',
    region: 'East India',
    emissionsMT: 3350,
    completionPct: 100,
    siteEngineer: 'SE Bhubaneswar',
    status: 'Verified',
  },
  {
    id: 'SITE-07',
    name: 'Polavaram Hydro Dam Project',
    subsidiary: 'MEIL Hydro',
    region: 'South India',
    emissionsMT: 4120,
    completionPct: 95,
    siteEngineer: 'Ramesh Thota',
    status: 'Active',
  },
  {
    id: 'SITE-08',
    name: 'Zojila Tunnel Construction',
    subsidiary: 'MEIL Highways',
    region: 'North India',
    emissionsMT: 14800,
    completionPct: 90,
    siteEngineer: 'Farooq Ahmed',
    status: 'Active',
  },
  {
    id: 'SITE-09',
    name: 'Kaleshwaram Lift Irrigation',
    subsidiary: 'MEIL Infrastructure',
    region: 'South India',
    emissionsMT: 22600,
    completionPct: 88,
    siteEngineer: 'Srinivas Rao',
    status: 'Active',
  },
  {
    id: 'SITE-10',
    name: 'Western Dedicated Freight Corridor',
    subsidiary: 'MEIL Railways',
    region: 'West India',
    emissionsMT: 16300,
    completionPct: 94,
    siteEngineer: 'Manoj Kulhari',
    status: 'Active',
  },
  {
    id: 'SITE-11',
    name: 'Chennai Desalination Plant',
    subsidiary: 'MEIL Water Grid',
    region: 'South India',
    emissionsMT: 7450,
    completionPct: 82,
    siteEngineer: 'Karthik Varadan',
    status: 'Under Review',
  },
]

export const SitesProjectsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [subsidiaryFilter, setSubsidiaryFilter] = useState('All')
  const [regionFilter, setRegionFilter] = useState('All')

  const filteredSites = SITES_DATA.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.siteEngineer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubsidiary = subsidiaryFilter === 'All' || s.subsidiary === subsidiaryFilter
    const matchesRegion = regionFilter === 'All' || s.region === regionFilter
    return matchesSearch && matchesSubsidiary && matchesRegion
  })

  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto', pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3.5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Sites & Projects Portfolio
            </Typography>
            <Chip
              label="11 Active Key Assets"
              size="small"
              sx={{ bgcolor: '#ecfdf5', color: '#166534', fontWeight: 700, fontSize: '0.725rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
            Live monitoring for 250+ enterprise sites across MEIL Group infrastructure divisions
          </Typography>
        </Box>
      </Box>

      {/* Top 4 KPI Metrics */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
          mb: 3.5,
        }}
      >
        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Total Monitored Sites</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>250+</Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>11 Major Assets Online</Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Reporting Compliance</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>91.4%</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>Above Q4 statutory target</Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Total Monitored Emissions</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>169,450 MT</Typography>
            <Typography variant="caption" sx={{ color: '#64748b' }}>FY 2024-25 Year-to-Date</Typography>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Cryptographic Signatures</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f766e', mt: 0.5 }}>100% Valid</Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>SHA-256 Ledger Synced</Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Filter and Search Bar */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1.5fr 1fr 1fr' },
              gap: 2,
            }}
          >
            <TextField
              size="small"
              placeholder="Search by site name or engineer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              select
              size="small"
              label="Subsidiary"
              value={subsidiaryFilter}
              onChange={(e) => setSubsidiaryFilter(e.target.value)}
            >
              <MenuItem value="All">All Subsidiaries</MenuItem>
              <MenuItem value="MEIL Infrastructure">MEIL Infrastructure</MenuItem>
              <MenuItem value="MEIL Water Grid">MEIL Water Grid</MenuItem>
              <MenuItem value="MEIL Power">MEIL Power</MenuItem>
              <MenuItem value="MEIL Maritime">MEIL Maritime</MenuItem>
              <MenuItem value="MEIL Hydro">MEIL Hydro</MenuItem>
              <MenuItem value="MEIL Highways">MEIL Highways</MenuItem>
              <MenuItem value="MEIL Railways">MEIL Railways</MenuItem>
            </TextField>

            <TextField
              select
              size="small"
              label="Region"
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
            >
              <MenuItem value="All">All Regions</MenuItem>
              <MenuItem value="South India">South India</MenuItem>
              <MenuItem value="East India">East India</MenuItem>
              <MenuItem value="West India">West India</MenuItem>
              <MenuItem value="North India">North India</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Sites Data Table */}
      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2.5, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>SITE NAME</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>SUBSIDIARY & REGION</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>EMISSIONS (MT)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>REPORTING PROGRESS</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>SITE ENGINEER</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>STATUS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.75rem' }}>ACTION</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSites.map((site) => {
              const statusColor =
                site.status === 'Verified'
                  ? { bg: '#dcfce7', text: '#15803d', icon: <CheckCircleIcon sx={{ fontSize: 13, color: '#15803d' }} /> }
                  : site.status === 'Active'
                  ? { bg: '#eff6ff', text: '#1d4ed8', icon: <BusinessIcon sx={{ fontSize: 13, color: '#1d4ed8' }} /> }
                  : { bg: '#fef3c7', text: '#b45309', icon: <WarningAmberIcon sx={{ fontSize: 13, color: '#b45309' }} /> }

              return (
                <TableRow key={site.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {site.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                      {site.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                      {site.subsidiary}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      {site.region}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {site.emissionsMT.toLocaleString()} MT CO₂e
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 140 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={site.completionPct}
                        sx={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: '#f1f5f9',
                          '& .MuiLinearProgress-bar': {
                            bgcolor: site.completionPct === 100 ? '#10b981' : '#3b82f6',
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', minWidth: 32 }}>
                        {site.completionPct}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#334155', fontSize: '0.825rem' }}>
                    {site.siteEngineer}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={statusColor.icon}
                      label={site.status}
                      sx={{
                        bgcolor: statusColor.bg,
                        color: statusColor.text,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityOutlinedIcon fontSize="small" />}
                      sx={{
                        fontSize: '0.75rem',
                        textTransform: 'none',
                        borderColor: '#cbd5e1',
                        color: '#334155',
                      }}
                    >
                      Inspect
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Card>
    </Box>
  )
}
export default SitesProjectsView
