import React, { useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  MenuItem,
  Select,
  Button,
} from '@mui/material'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined'
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'

interface CsoDashboardProps {
  onOpenReportModal?: () => void
  onNavigateToTab?: (tabName: string) => void
}

export const CsoDashboard: React.FC<CsoDashboardProps> = ({
  onOpenReportModal,
  onNavigateToTab,
}) => {
  const [financialYear, setFinancialYear] = useState('2024-25 (FY)')
  const [region, setRegion] = useState('All Regions')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Monthly data for Emissions Trend (Apr to Mar)
  const monthlyEmissions = [
    { month: 'Apr', value: 16500, target: 19000 },
    { month: 'May', value: 20200, target: 21000 },
    { month: 'Jun', value: 24800, target: 25000 },
    { month: 'Jul', value: 31000, target: 29000 },
    { month: 'Aug', value: 29500, target: 30000 },
    { month: 'Sep', value: 38200, target: 36000 },
    { month: 'Oct', value: 35100, target: 37000 },
    { month: 'Nov', value: 42600, target: 41000 },
    { month: 'Dec', value: 46800, target: 45000 },
    { month: 'Jan', value: 44200, target: 46000 },
    { month: 'Feb', value: 51900, target: 48000 },
    { month: 'Mar', value: 49800, target: 50000 },
  ]

  // Top Operational Sites
  const topSites = [
    { name: 'Hyderabad Metro Expansion', code: 'HM-PKG-04', region: 'Telangana', emissions: 32450, share: 26 },
    { name: 'Odisha Natural Gas Pipeline', code: 'OD-PL-02', region: 'Odisha', emissions: 28320, share: 23 },
    { name: 'Rourkela Substation Grid', code: 'RK-SUB-01', region: 'Odisha', emissions: 18240, share: 15 },
    { name: 'Vizag Port Bulk Terminal', code: 'VZ-PRT-09', region: 'Andhra Pradesh', emissions: 12450, share: 10 },
    { name: 'Bangalore Water Supply Grid', code: 'BLR-WS-11', region: 'Karnataka', emissions: 9870, share: 8 },
  ]

  // SVG Chart dimensions
  const chartWidth = 620
  const chartHeight = 190
  const padLeft = 46
  const padRight = 24
  const padTop = 20
  const padBottom = 32
  const maxVal = 60000

  const plotW = chartWidth - padLeft - padRight
  const plotH = chartHeight - padTop - padBottom

  // Coordinates for actual trend curve
  const points = monthlyEmissions.map((item, idx) => {
    const x = padLeft + (idx / (monthlyEmissions.length - 1)) * plotW
    const y = padTop + plotH - (item.value / maxVal) * plotH
    const ty = padTop + plotH - (item.target / maxVal) * plotH
    return { x, y, ty, ...item }
  })

  const pathD = points.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`
  }, '')

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + plotH} L ${points[0].x} ${padTop + plotH} Z`

  const targetPathD = points.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.ty}`
  }, '')

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '1440px',
        mx: 'auto',
        color: '#0f172a',
      }}
    >
      {/* ========================================================================= */}
      {/* 1. MINIMAL EXECUTIVE HEADER */}
      {/* ========================================================================= */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'flex-end' },
          gap: 2.5,
          pb: 3,
          mb: 3,
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                bgcolor: '#059669',
                boxShadow: '0 0 0 3px #ecfdf5',
              }}
            />
            <Typography
              variant="caption"
              sx={{
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: '#047857',
                fontSize: '0.7rem',
              }}
            >
              Enterprise Telemetry • Consolidated View
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 750,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              fontSize: { xs: '1.45rem', sm: '1.75rem', md: '2rem' },
              lineHeight: 1.15,
            }}
          >
            Corporate ESG Overview
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              mt: 0.5,
              fontSize: '0.875rem',
            }}
          >
            Audited disclosures, carbon trajectory, and statutory assurance across 250+ project sites.
          </Typography>
        </Box>

        {/* Header Action Controls */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1.25,
            width: { xs: '100%', md: 'auto' },
          }}
        >
          {/* Financial Year Selector */}
          <Select
            size="small"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            sx={{
              bgcolor: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#1e293b',
              height: 38,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#047857' },
            }}
          >
            <MenuItem value="2024-25 (FY)">FY 2024–25 (Current)</MenuItem>
            <MenuItem value="2023-24 (FY)">FY 2023–24 (Audited)</MenuItem>
            <MenuItem value="2025-26 (Target)">FY 2025–26 (Target Plan)</MenuItem>
          </Select>

          {/* Region Selector */}
          <Select
            size="small"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            sx={{
              bgcolor: '#ffffff',
              borderRadius: '8px',
              fontSize: '0.825rem',
              fontWeight: 600,
              color: '#1e293b',
              height: 38,
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e2e8f0' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#047857' },
            }}
          >
            <MenuItem value="All Regions">All Operating Regions</MenuItem>
            <MenuItem value="South India">South India Grid</MenuItem>
            <MenuItem value="East India">East India Region</MenuItem>
            <MenuItem value="West India">West India Operations</MenuItem>
            <MenuItem value="North India">North India Pipeline</MenuItem>
          </Select>

          {/* Generate Filing Report Button */}
          {onOpenReportModal && (
            <Button
              variant="contained"
              disableElevation
              startIcon={<PictureAsPdfOutlinedIcon sx={{ fontSize: 17 }} />}
              onClick={onOpenReportModal}
              sx={{
                height: 38,
                bgcolor: '#0f172a',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.825rem',
                borderRadius: '8px',
                px: 2,
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              Filing Report
            </Button>
          )}
        </Box>
      </Box>

      {/* ========================================================================= */}
      {/* 2. MINIMAL KPI STAT TILES */}
      {/* ========================================================================= */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        {/* KPI 1: Greenhouse Gas Emissions */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            '&:hover': {
              borderColor: '#cbd5e1',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            },
          }}
        >
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Total GHG Emissions
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#047857',
                  bgcolor: '#ecfdf5',
                  px: 1,
                  py: 0.25,
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.68rem',
                }}
              >
                Scope 1 + 2 + 3
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5, mb: 1.25 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 750,
                  color: '#0f172a',
                  letterSpacing: '-0.03em',
                  fontSize: { xs: '1.6rem', md: '1.85rem' },
                  lineHeight: 1,
                }}
              >
                245,672
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                MT CO₂e
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingDownIcon sx={{ fontSize: 15, color: '#059669' }} />
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, fontSize: '0.75rem' }}>
                  12.4%
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  vs FY 23-24
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                Target: -15%
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* KPI 2: Energy Consumption */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            '&:hover': {
              borderColor: '#cbd5e1',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            },
          }}
        >
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Energy Consumption
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#0f766e',
                  bgcolor: '#f0fdfa',
                  px: 1,
                  py: 0.25,
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.68rem',
                }}
              >
                42% Clean Power
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5, mb: 1.25 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 750,
                  color: '#0f172a',
                  letterSpacing: '-0.03em',
                  fontSize: { xs: '1.6rem', md: '1.85rem' },
                  lineHeight: 1,
                }}
              >
                892,430
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                MWh
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingDownIcon sx={{ fontSize: 15, color: '#059669' }} />
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, fontSize: '0.75rem' }}>
                  8.1%
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  vs FY 23-24
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                Captive Solar Mix
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* KPI 3: Water Withdrawal */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            '&:hover': {
              borderColor: '#cbd5e1',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            },
          }}
        >
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Water Withdrawal
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#0369a1',
                  bgcolor: '#f0f9ff',
                  px: 1,
                  py: 0.25,
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.68rem',
                }}
              >
                74% Reused
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5, mb: 1.25 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 750,
                  color: '#0f172a',
                  letterSpacing: '-0.03em',
                  fontSize: { xs: '1.6rem', md: '1.85rem' },
                  lineHeight: 1,
                }}
              >
                3,210,560
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                kL
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingDownIcon sx={{ fontSize: 15, color: '#059669' }} />
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, fontSize: '0.75rem' }}>
                  5.3%
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  vs FY 23-24
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                Zero Liquid Sites
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* KPI 4: Circular Waste Diversion */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            '&:hover': {
              borderColor: '#cbd5e1',
              boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
            },
          }}
        >
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Waste Recovered
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#15803d',
                  bgcolor: '#f0fdf4',
                  px: 1,
                  py: 0.25,
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.68rem',
                }}
              >
                88% Circular Rate
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5, mb: 1.25 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 750,
                  color: '#0f172a',
                  letterSpacing: '-0.03em',
                  fontSize: { xs: '1.6rem', md: '1.85rem' },
                  lineHeight: 1,
                }}
              >
                12,340
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.8rem' }}>
                MT
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1, borderTop: '1px solid #f1f5f9' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUpIcon sx={{ fontSize: 15, color: '#059669' }} />
                <Typography variant="caption" sx={{ color: '#059669', fontWeight: 700, fontSize: '0.75rem' }}>
                  18.0%
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                  diverted vs LY
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                100% Non-Hazardous
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* ========================================================================= */}
      {/* 3. MIDDLE SECTION: EMISSIONS TRAJECTORY + ASSURANCE HEALTH */}
      {/* ========================================================================= */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.65fr 1fr',
          },
          gap: 2,
          mb: 3,
        }}
      >
        {/* Card: Monthly Emissions Trajectory Chart */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
          }}
        >
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: 1.5,
                mb: 2.5,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                  Emissions Trajectory vs Target
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
                  Consolidated monthly actuals in MT CO₂e against FY SBTi benchmark
                </Typography>
              </Box>

              {/* Chart Legend */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{ width: 14, height: 2.5, bgcolor: '#047857', borderRadius: 1 }} />
                  <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.72rem' }}>
                    Actuals
                  </Typography>
                </Box>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                  <Box
                    sx={{
                      width: 14,
                      height: 0,
                      borderTop: '2px dashed #94a3b8',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.72rem' }}>
                    SBTi Target
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Responsive SVG Area Chart */}
            <Box sx={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ width: '100%', height: 'auto', minWidth: '340px', display: 'block' }}
              >
                <defs>
                  <linearGradient id="minimalEmissionsArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#047857" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#047857" stopOpacity="0.01" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[
                  { label: '60k', val: 60000 },
                  { label: '40k', val: 40000 },
                  { label: '20k', val: 20000 },
                  { label: '0', val: 0 },
                ].map((grid) => {
                  const y = padTop + plotH - (grid.val / maxVal) * plotH
                  return (
                    <g key={grid.label}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={chartWidth - padRight}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeDasharray={grid.val === 0 ? 'none' : '3 3'}
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 10}
                        y={y + 3.5}
                        textAnchor="end"
                        fill="#94a3b8"
                        fontSize="9"
                        fontWeight="500"
                        fontFamily="system-ui"
                      >
                        {grid.label}
                      </text>
                    </g>
                  )
                })}

                {/* Target Baseline (Dashed) */}
                <path
                  d={targetPathD}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />

                {/* Gradient Area Fill */}
                <path d={areaD} fill="url(#minimalEmissionsArea)" />

                {/* Main Trend Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#047857"
                  strokeWidth="2.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Points and Labels */}
                {points.map((pt, idx) => {
                  const isHovered = hoveredIndex === idx
                  return (
                    <g
                      key={pt.month}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Vertical Hover Indicator Line */}
                      {isHovered && (
                        <line
                          x1={pt.x}
                          y1={padTop}
                          x2={pt.x}
                          y2={padTop + plotH}
                          stroke="#cbd5e1"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* Circle Dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 5 : 3}
                        fill="#ffffff"
                        stroke="#047857"
                        strokeWidth={isHovered ? 2.5 : 1.75}
                      />

                      {/* Month Text Label on X Axis */}
                      <text
                        x={pt.x}
                        y={chartHeight - 10}
                        textAnchor="middle"
                        fill={isHovered ? '#0f172a' : '#64748b'}
                        fontSize="9.5"
                        fontWeight={isHovered ? '700' : '500'}
                        fontFamily="system-ui"
                      >
                        {pt.month}
                      </text>

                      {/* Minimalist Tooltip Card on Hover */}
                      {isHovered && (
                        <g>
                          <rect
                            x={Math.max(padLeft, Math.min(chartWidth - padRight - 84, pt.x - 42))}
                            y={pt.y - 32}
                            width="84"
                            height="22"
                            rx="5"
                            fill="#0f172a"
                          />
                          <text
                            x={Math.max(padLeft, Math.min(chartWidth - padRight - 84, pt.x - 42)) + 42}
                            y={pt.y - 18}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize="9"
                            fontWeight="600"
                            fontFamily="system-ui"
                          >
                            {pt.value.toLocaleString()} MT CO₂e
                          </text>
                        </g>
                      )}
                    </g>
                  )
                })}
              </svg>
            </Box>
          </CardContent>
        </Card>

        {/* Card: Statutory Assurance & Disclosure Completeness */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                  Filing Readiness
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
                  250 Total Project Site Submissions
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => onNavigateToTab && onNavigateToTab('reports')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: '#047857',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': { bgcolor: 'transparent', color: '#065f46' },
                }}
              >
                All Reports →
              </Button>
            </Box>

            {/* Minimal Circular Progress & Site Status */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                my: 2,
                flexDirection: { xs: 'column', sm: 'row' },
              }}
            >
              {/* Clean SVG Ring */}
              <Box sx={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
                <svg width="110" height="110" viewBox="0 0 110 110">
                  <circle cx="55" cy="55" r="44" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                  <circle
                    cx="55"
                    cy="55"
                    r="44"
                    fill="transparent"
                    stroke="#047857"
                    strokeWidth="10"
                    strokeDasharray="276.46"
                    strokeDashoffset={276.46 * (1 - 0.78)}
                    strokeLinecap="round"
                    transform="rotate(-90 55 55)"
                  />
                </svg>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                    78%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.68rem', mt: 0.25 }}>
                    Complete
                  </Typography>
                </Box>
              </Box>

              {/* Status Breakdown List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flex: 1, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleOutlinedIcon sx={{ fontSize: 16, color: '#047857' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>
                      Audited & Signed
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                    195 <span style={{ color: '#94a3b8', fontWeight: 500 }}>/ 250</span>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <HourglassEmptyRoundedIcon sx={{ fontSize: 16, color: '#d97706' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>
                      In Verification
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                    45 <span style={{ color: '#94a3b8', fontWeight: 500 }}>/ 250</span>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <RadioButtonUncheckedIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.8rem' }}>
                      Pending Submission
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.8rem' }}>
                    10 <span style={{ color: '#94a3b8', fontWeight: 500 }}>/ 250</span>
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Framework Assurance Alignment Bar */}
            <Box sx={{ pt: 2, borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <ShieldOutlinedIcon sx={{ fontSize: 15, color: '#047857' }} />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#334155', fontSize: '0.72rem' }}>
                    SEBI BRSR Core Assurance
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#047857', fontSize: '0.72rem' }}>
                  92% Compliant
                </Typography>
              </Box>
              <Box sx={{ width: '100%', height: 5, bgcolor: '#f1f5f9', borderRadius: 1, overflow: 'hidden' }}>
                <Box sx={{ width: '92%', height: '100%', bgcolor: '#047857', borderRadius: 1 }} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* ========================================================================= */}
      {/* 4. BOTTOM SECTION: TOP SITES + ESG PILLAR PERFORMANCE */}
      {/* ========================================================================= */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.4fr 1.25fr',
          },
          gap: 2,
        }}
      >
        {/* Left Card: Top Contributing Operational Sites */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
          }}
        >
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                  Top Contributing Sites
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
                  Locations with highest consolidated greenhouse emissions
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => onNavigateToTab && onNavigateToTab('sites-projects')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  color: '#047857',
                  p: 0,
                  minWidth: 'auto',
                  '&:hover': { bgcolor: 'transparent', color: '#065f46' },
                }}
              >
                All Sites →
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, mt: 1 }}>
              {topSites.map((site, index) => (
                <Box
                  key={site.code}
                  sx={{
                    p: 1.25,
                    borderRadius: '8px',
                    transition: 'background-color 0.15s ease',
                    '&:hover': { bgcolor: '#f8fafc' },
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#94a3b8',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        0{index + 1}
                      </Typography>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: '#1e293b',
                            fontSize: '0.825rem',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {site.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                          {site.code} • {site.region}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: 'right', flexShrink: 0, pl: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.825rem' }}>
                        {site.emissions.toLocaleString()} <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>MT</span>
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#047857', fontWeight: 600, fontSize: '0.7rem' }}>
                        {site.share}% of total
                      </Typography>
                    </Box>
                  </Box>

                  {/* Slim Progress Bar */}
                  <Box sx={{ width: '100%', height: 4, bgcolor: '#f1f5f9', borderRadius: 1, overflow: 'hidden' }}>
                    <Box
                      sx={{
                        width: `${(site.emissions / 35000) * 100}%`,
                        height: '100%',
                        bgcolor: index === 0 ? '#047857' : index === 1 ? '#059669' : '#10b981',
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Right Card: ESG Performance by Pillar */}
        <Card
          elevation={0}
          sx={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                  Pillar Performance
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.78rem' }}>
                  BRSR and GRI criteria audit scores
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  bgcolor: '#f1f5f9',
                  color: '#475569',
                  px: 1,
                  py: 0.35,
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                }}
              >
                Overall: 75.3%
              </Typography>
            </Box>

            {/* 3 Pillar Score Tiles */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, my: 1.5 }}>
              {/* Environmental */}
              <Box
                sx={{
                  p: 1.75,
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      bgcolor: '#ecfdf5',
                      color: '#047857',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ForestOutlinedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                      Environmental (E)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                      Emissions, Water Intensity & Grid Mix
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 750, color: '#047857', fontSize: '1rem', lineHeight: 1 }}>
                    82%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: '0.68rem' }}>
                    On Track
                  </Typography>
                </Box>
              </Box>

              {/* Social */}
              <Box
                sx={{
                  p: 1.75,
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      bgcolor: '#eef2ff',
                      color: '#4338ca',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <GroupsOutlinedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                      Social (S)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                      LTIFR 0.12, Fair Wage & Diversity
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 750, color: '#4338ca', fontSize: '1rem', lineHeight: 1 }}>
                    68%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#d97706', fontWeight: 600, fontSize: '0.68rem' }}>
                    Review Required
                  </Typography>
                </Box>
              </Box>

              {/* Governance */}
              <Box
                sx={{
                  p: 1.75,
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  bgcolor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      bgcolor: '#fefce8',
                      color: '#b45309',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <GavelOutlinedIcon sx={{ fontSize: 20 }} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>
                      Governance (G)
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.72rem' }}>
                      Board Diversity, Ethics & Audits
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" sx={{ fontWeight: 750, color: '#b45309', fontSize: '1rem', lineHeight: 1 }}>
                    76%
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, fontSize: '0.68rem' }}>
                    Assured
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Inspect Disclosures Action Link */}
            <Box sx={{ pt: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                size="small"
                variant="outlined"
                endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                onClick={() => {
                  if (onNavigateToTab) {
                    onNavigateToTab('metrics')
                  } else if (onOpenReportModal) {
                    onOpenReportModal()
                  }
                }}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderColor: '#cbd5e1',
                  color: '#1e293b',
                  borderRadius: '6px',
                  '&:hover': {
                    borderColor: '#94a3b8',
                    bgcolor: '#f8fafc',
                  },
                }}
              >
                Inspect All Disclosures
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
}

export default CsoDashboard
