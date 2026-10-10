import React, { useState } from 'react'
import {
  Box,
  Card,
  Typography,
  Button,
} from '@mui/material'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'

interface ExecutiveRollupChartsProps {
  region?: string
  onOpenReports?: () => void
}

interface MonthlyData {
  month: string
  actual: number
  target: number
}

const MONTHLY_SERIES: MonthlyData[] = [
  { month: 'Apr', actual: 16200, target: 16500 },
  { month: 'May', actual: 20400, target: 20000 },
  { month: 'Jun', actual: 24800, target: 23800 },
  { month: 'Jul', actual: 31200, target: 28500 },
  { month: 'Aug', actual: 29400, target: 30800 },
  { month: 'Sep', actual: 38200, target: 35500 },
  { month: 'Oct', actual: 35100, target: 37200 },
  { month: 'Nov', actual: 42600, target: 41500 },
  { month: 'Dec', actual: 46800, target: 45000 },
  { month: 'Jan', actual: 44100, target: 46200 },
  { month: 'Feb', actual: 51800, target: 49200 },
  { month: 'Mar', actual: 49600, target: 51000 },
]

export const ExecutiveRollupCharts: React.FC<ExecutiveRollupChartsProps> = ({
  region,
  onOpenReports,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // Region-based multiplier for dynamic feel when toggling jurisdictions
  const regionMultiplier = region ? 0.38 : 1.0
  const totalSites = region ? 95 : 250
  const auditedSites = region ? 74 : 195
  const inVerificationSites = region ? 16 : 45
  const pendingSites = region ? 5 : 10
  const completionPercentage = Math.round((auditedSites / totalSites) * 100)
  const sebiAssurancePercentage = region ? 94 : 92

  // SVG Chart Dimensions
  const svgWidth = 620
  const svgHeight = 230
  const paddingLeft = 46
  const paddingRight = 24
  const paddingTop = 20
  const paddingBottom = 35

  const chartWidth = svgWidth - paddingLeft - paddingRight
  const chartHeight = svgHeight - paddingTop - paddingBottom
  const maxY = 65000

  // Calculate coordinates
  const points = MONTHLY_SERIES.map((d, index) => {
    const x = paddingLeft + (index / (MONTHLY_SERIES.length - 1)) * chartWidth
    const yActual =
      paddingTop + chartHeight - ((d.actual * regionMultiplier) / maxY) * chartHeight
    const yTarget =
      paddingTop + chartHeight - ((d.target * regionMultiplier) / maxY) * chartHeight
    return { ...d, x, yActual, yTarget }
  })

  // Path generator for Actuals line
  const actualPathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.yActual}` : `${acc} L ${p.x} ${p.yActual}`
  }, '')

  // Area Path for Actuals gradient fill
  const areaPathD = `${actualPathD} L ${points[points.length - 1].x} ${
    paddingTop + chartHeight
  } L ${points[0].x} ${paddingTop + chartHeight} Z`

  // Path generator for SBTi Target line
  const targetPathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.yTarget}` : `${acc} L ${p.x} ${p.yTarget}`
  }, '')

  // Circular gauge calculations
  const gaugeRadius = 42
  const gaugeCircumference = 2 * Math.PI * gaugeRadius
  const gaugeOffset = gaugeCircumference * (1 - completionPercentage / 100)

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1.65fr 1fr' },
        gap: 2.5,
        mb: 3,
      }}
    >
      {/* CARD 1: Emissions Trajectory vs Target */}
      <Card
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          borderColor: '#e2e8f0',
          bgcolor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Card Header & Legend */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'flex-start' },
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontSize: { xs: '1rem', sm: '1.125rem' },
                lineHeight: 1.3,
              }}
            >
              Emissions Trajectory vs Target
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3, fontSize: '0.8125rem' }}>
              Consolidated monthly actuals in MT CO₂e against FY SBTi benchmark
            </Typography>
          </Box>

          {/* Legend */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2.5,
              flexShrink: 0,
            }}
          >
            {/* Actuals Legend */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 3,
                  bgcolor: '#047857',
                  borderRadius: 1,
                }}
              />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8125rem' }}
              >
                Actuals
              </Typography>
            </Box>

            {/* SBTi Target Legend */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 16,
                  height: 0,
                  borderTop: '2px dashed #0d9488',
                }}
              />
              <Typography
                variant="caption"
                sx={{ fontWeight: 500, color: '#64748b', fontSize: '0.8125rem' }}
              >
                SBTi Target
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Responsive Line Chart SVG */}
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Box sx={{ minWidth: { xs: 520, sm: '100%' }, position: 'relative' }}>
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            >
              <defs>
                {/* Gradient for Actuals Area Fill */}
                <linearGradient id="emissionsActualsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#047857" stopOpacity="0.14" />
                  <stop offset="70%" stopColor="#047857" stopOpacity="0.04" />
                  <stop offset="100%" stopColor="#047857" stopOpacity="0.00" />
                </linearGradient>
              </defs>

              {/* Horizontal Dashed Gridlines & Y-Axis Labels */}
              {[60000, 40000, 20000, 0].map((val) => {
                const y =
                  paddingTop + chartHeight - ((val * regionMultiplier) / maxY) * chartHeight
                const label = val === 0 ? '0' : `${val / 1000}k`

                return (
                  <g key={val}>
                    {val > 0 && (
                      <line
                        x1={paddingLeft}
                        y1={y}
                        x2={svgWidth - paddingRight}
                        y2={y}
                        stroke="#f1f5f9"
                        strokeDasharray="4 4"
                        strokeWidth="1.2"
                      />
                    )}
                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      textAnchor="end"
                      fill="#94a3b8"
                      fontSize="11"
                      fontFamily="Inter, Roboto, sans-serif"
                      fontWeight="500"
                    >
                      {label}
                    </text>
                  </g>
                )
              })}

              {/* Area Under Actuals Curve */}
              <path d={areaPathD} fill="url(#emissionsActualsGradient)" />

              {/* SBTi Target Line (Dashed) */}
              <path
                d={targetPathD}
                fill="none"
                stroke="#0d9488"
                strokeWidth="2"
                strokeDasharray="5 5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Actuals Line (Solid Dark Green) */}
              <path
                d={actualPathD}
                fill="none"
                stroke="#047857"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Month X-Axis Labels & Hover Interaction Columns */}
              {points.map((p, index) => {
                const isHovered = hoveredIndex === index

                return (
                  <g
                    key={p.month}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Hover vertical guideline */}
                    {isHovered && (
                      <line
                        x1={p.x}
                        y1={paddingTop}
                        x2={p.x}
                        y2={paddingTop + chartHeight}
                        stroke="#cbd5e1"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                    )}

                    {/* Data circle for Actuals */}
                    <circle
                      cx={p.x}
                      cy={p.yActual}
                      r={isHovered ? 6 : 4.5}
                      fill="#ffffff"
                      stroke="#047857"
                      strokeWidth={isHovered ? 3 : 2.5}
                      style={{ transition: 'all 0.15s ease' }}
                    />

                    {/* Month Label */}
                    <text
                      x={p.x}
                      y={svgHeight - 10}
                      textAnchor="middle"
                      fill={isHovered ? '#047857' : '#64748b'}
                      fontSize="11"
                      fontFamily="Inter, Roboto, sans-serif"
                      fontWeight={isHovered ? '700' : '500'}
                    >
                      {p.month}
                    </text>

                    {/* Invisible hover trigger area for smooth UX */}
                    <rect
                      x={p.x - 18}
                      y={paddingTop}
                      width={36}
                      height={chartHeight + 20}
                      fill="transparent"
                    />
                  </g>
                )
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredIndex !== null && points[hoveredIndex] && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 16,
                  bgcolor: '#0f172a',
                  color: '#ffffff',
                  py: 0.8,
                  px: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  pointerEvents: 'none',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  zIndex: 2,
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', color: '#94a3b8' }}>
                  {points[hoveredIndex].month}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10b981' }} />
                  <Typography sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                    Actual:{' '}
                    {Math.round(points[hoveredIndex].actual * regionMultiplier).toLocaleString()}{' '}
                    MT
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#2dd4bf' }} />
                  <Typography sx={{ color: '#cbd5e1', fontSize: '0.75rem' }}>
                    Target:{' '}
                    {Math.round(points[hoveredIndex].target * regionMultiplier).toLocaleString()}{' '}
                    MT
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Card>

      {/* CARD 2: Filing Readiness */}
      <Card
        variant="outlined"
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          borderColor: '#e2e8f0',
          bgcolor: '#ffffff',
          boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Card Header & All Reports Link */}
        <Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                color: '#0f172a',
                fontSize: { xs: '1rem', sm: '1.125rem' },
                lineHeight: 1.3,
              }}
            >
              Filing Readiness
            </Typography>

            <Button
              size="small"
              onClick={onOpenReports}
              endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: '0.95rem !important' }} />}
              sx={{
                color: '#047857',
                fontWeight: 700,
                fontSize: '0.8125rem',
                textTransform: 'none',
                p: 0,
                minWidth: 'auto',
                '&:hover': {
                  bgcolor: 'transparent',
                  color: '#065f46',
                  textDecoration: 'underline',
                },
              }}
            >
              All Reports
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: '#64748b', mt: 0.3, fontSize: '0.8125rem' }}>
            {totalSites} Total Project Site Submissions
          </Typography>
        </Box>

        {/* Center Section: Circular Progress Donut Gauge + Status Legend */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            my: { xs: 2.5, sm: 2 },
            gap: { xs: 2, sm: 3 },
          }}
        >
          {/* Circular Donut Gauge */}
          <Box
            sx={{
              position: 'relative',
              width: 110,
              height: 110,
              flexShrink: 0,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <svg width="110" height="110" viewBox="0 0 110 110">
              {/* Background Track */}
              <circle
                cx="55"
                cy="55"
                r={gaugeRadius}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="10"
              />
              {/* Progress Stroke */}
              <circle
                cx="55"
                cy="55"
                r={gaugeRadius}
                fill="none"
                stroke="#047857"
                strokeWidth="10"
                strokeDasharray={gaugeCircumference}
                strokeDashoffset={gaugeOffset}
                strokeLinecap="round"
                transform="rotate(-90 55 55)"
                style={{
                  transition: 'stroke-dashoffset 0.5s ease',
                }}
              />
            </svg>

            {/* Inner Gauge Text */}
            <Box
              sx={{
                position: 'absolute',
                textAlign: 'center',
                lineHeight: 1,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: '1.45rem',
                  color: '#0f172a',
                  lineHeight: 1.1,
                }}
              >
                {completionPercentage}%
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#64748b',
                  mt: 0.2,
                }}
              >
                Complete
              </Typography>
            </Box>
          </Box>

          {/* Breakdown Items List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: 1 }}>
            {/* Audited & Signed */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleRoundedIcon sx={{ color: '#059669', fontSize: 18 }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}
                >
                  Audited & Signed
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}
              >
                {auditedSites}{' '}
                <Typography
                  component="span"
                  sx={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}
                >
                  / {totalSites}
                </Typography>
              </Typography>
            </Box>

            {/* In Verification */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HourglassEmptyRoundedIcon sx={{ color: '#d97706', fontSize: 18 }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}
                >
                  In Verification
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}
              >
                {inVerificationSites}{' '}
                <Typography
                  component="span"
                  sx={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}
                >
                  / {totalSites}
                </Typography>
              </Typography>
            </Box>

            {/* Pending Submission */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RadioButtonUncheckedRoundedIcon sx={{ color: '#94a3b8', fontSize: 18 }} />
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}
                >
                  Pending Submission
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.85rem' }}
              >
                {pendingSites}{' '}
                <Typography
                  component="span"
                  sx={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}
                >
                  / {totalSites}
                </Typography>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Bottom Banner: SEBI BRSR Core Assurance */}
        <Box sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 0.8,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <ShieldOutlinedIcon sx={{ color: '#047857', fontSize: 18 }} />
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: '#0f172a', fontSize: '0.8125rem' }}
              >
                SEBI BRSR Core Assurance
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: '#047857', fontSize: '0.8125rem' }}
            >
              {sebiAssurancePercentage}% Compliant
            </Typography>
          </Box>

          {/* Progress Bar */}
          <Box
            sx={{
              width: '100%',
              height: 6,
              bgcolor: '#e2e8f0',
              borderRadius: 3,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${sebiAssurancePercentage}%`,
                height: '100%',
                bgcolor: '#047857',
                borderRadius: 3,
                transition: 'width 0.5s ease',
              }}
            />
          </Box>
        </Box>
      </Card>
    </Box>
  )
}
