import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  LinearProgress,
  Chip,
} from '@mui/material'
import TrendingDownOutlinedIcon from '@mui/icons-material/TrendingDownOutlined'
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'

export const OverviewMetrics: React.FC = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
          Executive ESG Telemetry & Reporting Readiness
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Consolidated performance indicators synthesized across Scope 1-3 greenhouse gas protocols and statutory BRSR / CSRD frameworks.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {/* Metric 1 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Scope 1 & 2 Emissions
                  </Typography>
                  <Box
                    sx={{
                      p: 0.75,
                      borderRadius: 1,
                      bgcolor: '#f1f5f9',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <TrendingDownOutlinedIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    18,480
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    tCO₂e
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Chip
                    label="-26.4% YoY"
                    size="small"
                    sx={{
                      bgcolor: '#f1f5f9',
                      color: '#0f172a',
                      fontWeight: 700,
                      height: 22,
                      fontSize: '0.7rem',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Base: 25,060 tCO₂e
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                    FY26 Net-Zero Target Trajectory
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 600 }}>
                    74% achieved
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={74} sx={{ height: 5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 2 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Renewable Power Ratio
                  </Typography>
                  <Box
                    sx={{
                      p: 0.75,
                      borderRadius: 1,
                      bgcolor: '#f1f5f9',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <BoltOutlinedIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    68.5%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    total mix
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Chip
                    label="+12.1% YoY"
                    size="small"
                    sx={{
                      bgcolor: '#f1f5f9',
                      color: '#0f172a',
                      fontWeight: 700,
                      height: 22,
                      fontSize: '0.7rem',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    PPA + On-site Solar
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Statutory Benchmark (80% by 2028)
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 600 }}>
                    68.5%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={68.5} sx={{ height: 5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 3 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Workforce Equity & Safety
                  </Typography>
                  <Box
                    sx={{
                      p: 0.75,
                      borderRadius: 1,
                      bgcolor: '#f1f5f9',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    98.4%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    parity
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Chip
                    label="Equal Remuneration"
                    size="small"
                    sx={{
                      bgcolor: '#f1f5f9',
                      color: '#0f172a',
                      fontWeight: 700,
                      height: 22,
                      fontSize: '0.7rem',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    LTIR: 0.12
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Gender Diversity in Leadership
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 600 }}>
                    42.0%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={42} sx={{ height: 5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Metric 4 */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Audit Assurance Readiness
                  </Typography>
                  <Box
                    sx={{
                      p: 0.75,
                      borderRadius: 1,
                      bgcolor: '#f1f5f9',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ShieldOutlinedIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
                    100%
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    verified
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Chip
                    label="Clean Opinion"
                    size="small"
                    sx={{
                      bgcolor: '#f1f5f9',
                      color: '#0f172a',
                      fontWeight: 700,
                      height: 22,
                      fontSize: '0.7rem',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Zero Discrepancies
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ pt: 1.5, borderTop: '1px solid #f1f5f9' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Traceable Line-Item Ledger
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 600 }}>
                    100% mapped
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={100} sx={{ height: 5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
