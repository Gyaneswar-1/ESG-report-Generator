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
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import { FRAMEWORKS } from '../data/esgData'

export const FrameworkMapping: React.FC = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#0f172a' }}>
          Statutory Framework Compliance Matrix
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Automated cross-mapping engine: One consolidated enterprise dataset translates directly into all global statutory disclosure formats.
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {FRAMEWORKS.map((fw) => (
          <Grid size={{ xs: 12, md: 6 }} key={fw.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                        <AccountBalanceOutlinedIcon sx={{ fontSize: 18 }} />
                      </Box>
                      <div>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem' }}>
                          {fw.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          {fw.regulatoryBody}
                        </Typography>
                      </div>
                    </Box>

                    <Chip
                      label={fw.mandateType}
                      size="small"
                      variant="outlined"
                      sx={{
                        height: 22,
                        fontSize: '0.675rem',
                        fontWeight: 600,
                        borderColor: '#cbd5e1',
                        color: '#1e293b',
                      }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500, mb: 1, fontSize: '0.8125rem' }}>
                    {fw.fullName}
                  </Typography>

                  <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.8rem', lineHeight: 1.5, mb: 2 }}>
                    {fw.description}
                  </Typography>
                </Box>

                <Box sx={{ pt: 2, borderTop: '1px solid #f1f5f9' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                      Compliance Mapping Completeness
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#0f172a', fontWeight: 700 }}>
                      {fw.complianceScore}% Ready
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={fw.complianceScore}
                    sx={{ height: 6 }}
                  />
                  <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block', fontSize: '0.725rem' }}>
                    Primary Standard: <strong>{fw.primaryStandard}</strong>
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
