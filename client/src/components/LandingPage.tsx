import React from 'react'
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined'
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined'
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined'
import type { UserRole } from '../store/authSlice'

interface LandingPageProps {
  onSelectRole: (role: UserRole) => void
  onOpenAuth: () => void
}

const roleCards: {
  role: UserRole
  title: string
  subtitle: string
  icon: React.ReactNode
  tag: string
  points: string[]
}[] = [
  {
    role: 'engineer',
    title: 'Site Engineer',
    subtitle: 'Single-Site Data Entry & Bill Uploads',
    icon: <EngineeringOutlinedIcon sx={{ fontSize: 28, color: '#0284c7' }} />,
    tag: 'Leaf Node',
    points: [
      'Input raw metrics (diesel, electricity, water, waste)',
      'Mandatory PDF / Image bill evidence uploads',
      'View submissions in familiar site units with normalization tag',
    ],
  },
  {
    role: 'subsidiary_head',
    title: 'Subsidiary Head',
    subtitle: 'Regional Oversight & Form Publishing',
    icon: <SupervisorAccountOutlinedIcon sx={{ fontSize: 28, color: '#0d9488' }} />,
    tag: 'Approver & Publisher',
    points: [
      'Review & approve/reject newly registered Site Engineers',
      'Publish custom project forms with file upload access',
      'Review monthly project data submissions across sites',
    ],
  },
  {
    role: 'executive',
    title: 'CSO / Super Admin',
    subtitle: 'Enterprise Roll-Up & Statutory Filing',
    icon: <SecurityOutlinedIcon sx={{ fontSize: 28, color: '#4f46e5' }} />,
    tag: 'Executive Scope',
    points: [
      'Review & approve newly registered Subsidiary Heads',
      'Dynamic real-time SUM() aggregation across 250+ sites',
      'Slide-over audit drawer & SEBI Annexure-I PDF filing',
    ],
  },
  {
    role: 'auditor',
    title: 'Independent Auditor',
    subtitle: 'Assurance Vault & Hash Verification',
    icon: <PolicyOutlinedIcon sx={{ fontSize: 28, color: '#d97706' }} />,
    tag: 'Read-Only Assurance',
    points: [
      'Inspect immutable cryptographic SHA-256 evidence hashes',
      'Examine mathematical conversion formulas and audit logs',
      'Verify physical utility bills in the evidence vault',
    ],
  },
]

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectRole, onOpenAuth }) => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 64,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', lineHeight: 1.1 }}>
                  MEIL Sustainability Cloud
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                  Statutory ESG Reporting & Intelligence Platform
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Chip
                icon={<VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />}
                label="SEBI BRSR Core Ready"
                size="small"
                color="success"
                variant="outlined"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              />
              <Button variant="contained" size="small" onClick={onOpenAuth} sx={{ fontWeight: 700, px: 2 }}>
                Access Portal
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 6, md: 9 },
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 840, mx: 'auto', textAlign: 'center' }}>
            <Chip
              label="Enterprise ESG Intelligence & SEBI Compliance Automation"
              size="small"
              sx={{
                bgcolor: '#dcfce7',
                color: '#15803d',
                fontWeight: 600,
                mb: 2.5,
                px: 1,
              }}
            />
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 850,
                color: '#0f172a',
                letterSpacing: '-0.025em',
                lineHeight: 1.18,
                fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
                mb: 2.5,
              }}
            >
              Statutory ESG Reporting with Mathematical Assurance & Evidence Traceability
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: '#475569',
                fontSize: { xs: '1rem', md: '1.15rem' },
                lineHeight: 1.6,
                mb: 4,
              }}
            >
              Enforce strict role-based data capture across sites, automated unit normalization into SEBI
              standards, immutable SHA-256 evidence hashing with Cloudinary vaulting, and multi-tier
              executive verification.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'center', alignItems: 'center' }}
            >
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={onOpenAuth}
                sx={{ minHeight: 48, px: 3.5, fontWeight: 700, bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
              >
                Sign In to Your Workspace
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  const section = document.getElementById('role-selection-section')
                  section?.scrollIntoView({ behavior: 'smooth' })
                }}
                sx={{ minHeight: 48, px: 3, fontWeight: 600 }}
              >
                Explore Role Portals
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Core Architectural Pillars */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 6 }}>
          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: '#eff6ff', display: 'grid', placeItems: 'center', mb: 2 }}>
                <AccountTreeOutlinedIcon color="primary" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                1. Leaf-Node Site Entry
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Data (kWh, Liters, kg) is strictly entered at the site facility level. Corporate roll-ups are dynamically
                calculated via SQL SUM() across linked subsidiaries to prevent double-counting.
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: '#f0fdf4', display: 'grid', placeItems: 'center', mb: 2 }}>
                <CalculateOutlinedIcon color="success" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                2. Normalization Math Engine
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Site engineers input raw native units. The backend interceptor converts them into SEBI standards (MT CO2e,
                kL, kWh, t) while preserving raw inputs for site-level transparency.
              </Typography>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: '#fdf4ff', display: 'grid', placeItems: 'center', mb: 2 }}>
                <ShieldOutlinedIcon sx={{ color: '#c026d3' }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                3. Evidence Vault & Hashing
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Every metric is hard-linked to a physical utility receipt or calibration sheet. Documents are hashed via
                SHA-256 and vaulted into Cloudinary for tamper-evident assurance.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Role Portals Grid */}
        <Box id="role-selection-section" sx={{ pt: 2, pb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mb: 1 }}>
              Select Your Role to Access Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Strict role-based segregation ensures data integrity and statutory oversight.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5 }}>
            {roleCards.map((card) => (
              <Card
                key={card.role}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => onSelectRole(card.role)}
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                >
                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ p: 1, borderRadius: 2, bgcolor: '#f1f5f9' }}>{card.icon}</Box>
                      <Chip label={card.tag} size="small" variant="outlined" sx={{ fontSize: '0.675rem', fontWeight: 600 }} />
                    </Box>

                    <Typography variant="h6" sx={{ fontWeight: 750, mb: 0.5 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', minHeight: 32 }}>
                      {card.subtitle}
                    </Typography>

                    <Box sx={{ borderTop: '1px solid #f1f5f9', pt: 1.5, mt: 'auto' }}>
                      <Stack spacing={0.75}>
                        {card.points.map((pt, idx) => (
                          <Typography key={idx} variant="caption" sx={{ color: '#475569', display: 'flex', gap: 0.75 }}>
                            <span style={{ color: '#0284c7' }}>•</span> {pt}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>

                    <Button
                      size="small"
                      variant="text"
                      endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                      sx={{ mt: 2, alignSelf: 'flex-start', fontWeight: 700, p: 0 }}
                    >
                      Enter Portal
                    </Button>
                  </CardContent>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ mt: 'auto', py: 3, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="caption" color="text.secondary">
            © 2026 MEIL Sustainability Cloud · Designed for Statutory SEBI BRSR Core & GRI Disclosures
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}
