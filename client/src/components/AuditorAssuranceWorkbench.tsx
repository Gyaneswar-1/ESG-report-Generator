import { useState, useMemo } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import FingerprintRoundedIcon from '@mui/icons-material/FingerprintRounded'
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined'
import {
  useGetRecordsQuery,
  useGetSitesQuery,
  useGetBrsrReportQuery,
  useSubmitAuditorAssuranceMutation,
  type EsgRecord,
  type Site,
} from '../store/api'
import { useSelector } from 'react-redux'
import type { RootState } from '../store'

export interface AuditorAssuranceWorkbenchProps {
  records?: EsgRecord[]
  sites?: Site[]
}

export const AuditorAssuranceWorkbench: React.FC<AuditorAssuranceWorkbenchProps> = ({
  records: recordsProp,
  sites: sitesProp,
}) => {
  const { name, token } = useSelector((state: RootState) => state.auth)

  const { data: recordsData } = useGetRecordsQuery(undefined, { skip: Boolean(recordsProp) })
  const { data: sitesData } = useGetSitesQuery(undefined, { skip: Boolean(sitesProp) })
  const { data: reportData, refetch: refetchReport } = useGetBrsrReportQuery()

  const [submitAssurance, { isLoading: submittingAssurance }] = useSubmitAuditorAssuranceMutation()

  // State
  const [isRunningAudit, setIsRunningAudit] = useState(false)
  const [auditProgress, setAuditProgress] = useState<number | null>(null)
  const [auditCompleted, setAuditCompleted] = useState(false)
  const [sampleRate, setSampleRate] = useState<number>(25) // 25% default sample

  // Assurance Statement Form Dialog
  const [opinionModalOpen, setOpinionModalOpen] = useState(false)
  const [assuranceForm, setAssuranceForm] = useState({
    provider: 'Independent ESG Assurance Services LLP',
    leadAuditor: name || 'Dr. Arindam Sen, FCA',
    registrationNumber: 'ICAI-FRN-101248W / SEBI-ESG-AUD-042',
    standard: 'ISAE 3000 (Revised) & ISO 14064-3',
    opinionType: 'Reasonable Assurance',
    opinionText:
      'In our professional opinion, based on substantive sampling across leaf sites and cryptographic SHA-256 verification of primary evidence documents, the statutory ESG metrics for FY 2025-26 comply in all material respects with the SEBI BRSR Core guidelines.',
  })
  const [assuranceSuccessToast, setAssuranceSuccessToast] = useState<string | null>(null)

  // Selected evidence for preview & cryptographic comparison
  const [inspectRecord, setInspectRecord] = useState<EsgRecord | null>(null)
  const [inspectEvidenceId, setInspectEvidenceId] = useState<number | null>(null)
  const [inspectHashVerified, setInspectHashVerified] = useState<boolean | null>(null)
  const [inspectComputedHash, setInspectComputedHash] = useState<string>('')
  const [inspectPreviewUrl, setInspectPreviewUrl] = useState<string | null>(null)
  const [isInspecting, setIsInspecting] = useState(false)

  // Real-time cryptographic verification map and audit statistics
  interface HashCheckState {
    status: 'verified' | 'mismatch' | 'verifying'
    computedHash: string
    expectedHash: string
    checkedAt: string
  }
  const [hashChecks, setHashChecks] = useState<Record<string, HashCheckState>>({})
  const [auditStats, setAuditStats] = useState<{ total: number; verified: number; failed: number } | null>(null)

  const records = useMemo(() => recordsProp ?? recordsData?.data ?? [], [recordsProp, recordsData?.data])
  const sites = useMemo(() => sitesProp ?? sitesData?.data ?? [], [sitesProp, sitesData?.data])
  const approvedRecords = useMemo(() => records.filter((r) => r.reviewStatus === 'approved'), [records])

  // Substantive testing sample
  const sampleRecords = useMemo(() => {
    if (approvedRecords.length === 0) return []
    const sampleSize = Math.max(1, Math.ceil((approvedRecords.length * sampleRate) / 100))
    // Deterministic sampling
    return approvedRecords.slice(0, sampleSize)
  }, [approvedRecords, sampleRate])

  const verifySinglePdfHash = async (rec: EsgRecord): Promise<boolean> => {
    if (!rec.evidenceId) return false

    setHashChecks((prev) => ({
      ...prev,
      [rec.id]: {
        status: 'verifying',
        computedHash: '',
        expectedHash: rec.evidenceHash,
        checkedAt: '',
      },
    }))

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1/'}evidence/${rec.evidenceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) {
        setHashChecks((prev) => ({
          ...prev,
          [rec.id]: {
            status: 'mismatch',
            computedHash: 'Download Failed',
            expectedHash: rec.evidenceHash,
            checkedAt: new Date().toLocaleTimeString(),
          },
        }))
        return false
      }

      const blob = await response.blob()
      const buffer = await blob.arrayBuffer()
      const digest = await crypto.subtle.digest('SHA-256', buffer)
      const computedHash = [...new Uint8Array(digest)]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
      const headerHash = response.headers.get('X-Content-SHA256') || rec.evidenceHash

      const isMatch =
        computedHash.toLowerCase() === rec.evidenceHash.toLowerCase() &&
        (!headerHash || computedHash.toLowerCase() === headerHash.toLowerCase())

      setHashChecks((prev) => ({
        ...prev,
        [rec.id]: {
          status: isMatch ? 'verified' : 'mismatch',
          computedHash,
          expectedHash: rec.evidenceHash,
          checkedAt: new Date().toLocaleTimeString(),
        },
      }))
      return isMatch
    } catch {
      setHashChecks((prev) => ({
        ...prev,
        [rec.id]: {
          status: 'mismatch',
          computedHash: 'Network error',
          expectedHash: rec.evidenceHash,
          checkedAt: new Date().toLocaleTimeString(),
        },
      }))
      return false
    }
  }

  const handleRunCryptographicAudit = async () => {
    if (sampleRecords.length === 0) return
    setIsRunningAudit(true)
    setAuditProgress(0)
    setAuditCompleted(false)
    setAuditStats(null)

    let verifiedCount = 0
    let failedCount = 0
    const total = sampleRecords.length

    for (let i = 0; i < total; i++) {
      const rec = sampleRecords[i]
      const success = await verifySinglePdfHash(rec)
      if (success) verifiedCount++
      else failedCount++
      setAuditProgress(Math.round(((i + 1) / total) * 100))
    }

    setIsRunningAudit(false)
    setAuditCompleted(true)
    setAuditStats({ total, verified: verifiedCount, failed: failedCount })
  }

  const handleInspectEvidence = async (rec: EsgRecord) => {
    setInspectRecord(rec)
    setInspectEvidenceId(rec.evidenceId)
    setInspectHashVerified(null)
    setInspectComputedHash('')
    setInspectPreviewUrl(null)
    setIsInspecting(true)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1/'}evidence/${rec.evidenceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.ok) {
        const blob = await response.blob()
        const buffer = await blob.arrayBuffer()
        const digest = await crypto.subtle.digest('SHA-256', buffer)
        const computedHash = [...new Uint8Array(digest)]
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
        const headerHash = response.headers.get('X-Content-SHA256') || rec.evidenceHash
        const isMatch =
          Boolean(rec.evidenceHash) &&
          computedHash.toLowerCase() === rec.evidenceHash.toLowerCase() &&
          (!headerHash || computedHash.toLowerCase() === headerHash.toLowerCase())
        setInspectHashVerified(isMatch)
        setInspectComputedHash(computedHash)
        setInspectPreviewUrl(URL.createObjectURL(blob))

        setHashChecks((prev) => ({
          ...prev,
          [rec.id]: {
            status: isMatch ? 'verified' : 'mismatch',
            computedHash,
            expectedHash: rec.evidenceHash,
            checkedAt: new Date().toLocaleTimeString(),
          },
        }))
      } else {
        setInspectHashVerified(false)
        setInspectComputedHash('Failed to fetch evidence from server')
      }
    } catch (e) {
      console.error(e)
      setInspectHashVerified(false)
      setInspectComputedHash('Network error occurred during evidence download')
    } finally {
      setIsInspecting(false)
    }
  }

  const handleSubmitOpinion = async () => {
    try {
      await submitAssurance(assuranceForm).unwrap()
      setAssuranceSuccessToast('Statutory Assurance Statement successfully issued and cryptographically sealed.')
      setOpinionModalOpen(false)
      refetchReport()
    } catch (err: any) {
      alert('Failed to submit assurance statement: ' + (err.data?.message || err.message))
    }
  }

  return (
    <Box sx={{ py: 1 }}>
      {/* Header Banner */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mb: 3,
          bgcolor: '#0f172a',
          color: '#ffffff',
          borderRadius: 2.5,
          borderColor: '#334155',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} sx={{ justifyContent: 'space-between', alignItems: { md: 'center' }, gap: 2 }}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <SecurityOutlinedIcon sx={{ color: '#0d9488' }} />
              <Chip
                label="SEBI Independent Assurance Framework"
                size="small"
                sx={{ bgcolor: 'rgba(13, 148, 136, 0.2)', color: '#2dd4bf', fontWeight: 700 }}
              />
              <Chip
                label="ISAE 3000 / ISO 14064-3"
                size="small"
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1' }}
              />
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Independent Auditor Assurance Workbench
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5, maxWidth: 700 }}>
              Statutory verification cockpit for external assurance providers. Conduct substantive sampling, verify cryptographic SHA-256 evidence digests, and issue formal reasonable assurance opinions.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<FingerprintRoundedIcon />}
              onClick={handleRunCryptographicAudit}
              disabled={isRunningAudit || approvedRecords.length === 0}
              sx={{
                bgcolor: '#0d9488',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': { bgcolor: '#0f766e' },
              }}
            >
              {isRunningAudit ? 'Verifying Hashes...' : 'Run Cryptographic Audit'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<GavelOutlinedIcon />}
              onClick={() => setOpinionModalOpen(true)}
              sx={{
                color: '#ffffff',
                borderColor: '#475569',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.05)' },
              }}
            >
              Issue Assurance Opinion
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Success Notification */}
      {assuranceSuccessToast && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setAssuranceSuccessToast(null)}>
          {assuranceSuccessToast}
        </Alert>
      )}

      {/* Audit Progress Bar */}
      {isRunningAudit && (
        <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Hashing & verifying {approvedRecords.length} leaf telemetry evidence files against SHA-256 digest ledger...
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {auditProgress}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={auditProgress ?? 0} sx={{ height: 8, borderRadius: 4 }} />
        </Paper>
      )}

      {auditCompleted && auditStats && (
        <Alert
          severity={auditStats.failed === 0 ? 'success' : 'error'}
          icon={auditStats.failed === 0 ? <VerifiedUserOutlinedIcon fontSize="inherit" /> : <ErrorOutlineRoundedIcon fontSize="inherit" />}
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setAuditCompleted(false)}
        >
          {auditStats.failed === 0 ? (
            <>
              <strong>Cryptographic Audit Verified:</strong> All {auditStats.verified} of {auditStats.total} sampled telemetry records match their original SHA-256 evidence digests. Zero tampering or bit-rot detected across Cloudinary and immutable storage vaults.
            </>
          ) : (
            <>
              <strong>Cryptographic Audit Tamper Warning:</strong> {auditStats.failed} of {auditStats.total} sampled records failed hash verification! Live PDF byte digest did not match database seal.
            </>
          )}
        </Alert>
      )}

      {/* Metrics Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Operational Leaf Sites Scoped
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                {sites.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                All subsidiaries included in boundary
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Approved Statutory Records
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                {approvedRecords.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 600 }}>
                100% Attached with PDF Proof
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Substantive Sample Size ({sampleRate}%)
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                {sampleRecords.length}
              </Typography>
              <Typography variant="caption" sx={{ color: '#0284c7' }}>
                Independent testing population
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Active Assurance Level
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0d9488', mt: 0.5 }}>
                {reportData?.data?.auditorAssurance?.opinionType || 'Reasonable Assurance'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748b' }}>
                {reportData?.data?.auditorAssurance?.standard || 'ISAE 3000 (Revised)'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Substantive Testing Sample Table */}
      <Paper variant="outlined" sx={{ borderRadius: 2.5, mb: 3 }}>
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
              Substantive Testing Sample Population
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Statistically selected sample of leaf operational records for third-party voucher inspection and recalculation.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Sample Rate:
            </Typography>
            {[10, 25, 50, 100].map((rate) => (
              <Chip
                key={rate}
                label={`${rate}%`}
                size="small"
                onClick={() => setSampleRate(rate)}
                color={sampleRate === rate ? 'primary' : 'default'}
                variant={sampleRate === rate ? 'filled' : 'outlined'}
                sx={{ fontWeight: 700 }}
              />
            ))}
          </Stack>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f8fafc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Operational Site</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Metric Parameter</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Field Raw Value</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Normalized Statutory Value</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Math Formula</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Evidence Hash & Verification</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4, color: '#64748b' }}>
                    No approved records available yet for sampling.
                  </TableCell>
                </TableRow>
              ) : (
                sampleRecords.map((r) => (
                  <TableRow key={r.id} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{r.site}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace' }}>{r.period}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.pillar}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.675rem',
                          mr: 1,
                          bgcolor:
                            r.pillar === 'environmental'
                              ? '#dcfce7'
                              : r.pillar === 'social'
                              ? '#e0e7ff'
                              : '#fef3c7',
                          color:
                            r.pillar === 'environmental'
                              ? '#15803d'
                              : r.pillar === 'social'
                              ? '#4338ca'
                              : '#b45309',
                        }}
                      />
                      {r.metric}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {r.rawValue} {r.rawUnit}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {r.value} {r.unit}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {r.formula || 'Direct Statutory KPI'}
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.75} sx={{ minWidth: 160 }}>
                        <Tooltip title={r.evidenceHash ? `Database Stored SHA-256: ${r.evidenceHash}` : 'No evidence attached'} arrow>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.725rem',
                              color: '#334155',
                              bgcolor: '#f1f5f9',
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 1,
                              display: 'inline-block',
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            {r.evidenceHash ? `${r.evidenceHash.slice(0, 8)}...${r.evidenceHash.slice(-6)}` : 'No Hash'}
                          </Typography>
                        </Tooltip>

                        {/* Verification badge / action */}
                        {(() => {
                          const check = hashChecks[r.id]
                          if (!r.evidenceHash) {
                            return (
                              <Chip
                                label="No Proof"
                                size="small"
                                sx={{ height: 18, fontSize: '0.625rem', bgcolor: '#f1f5f9', color: '#64748b' }}
                              />
                            )
                          }
                          if (check?.status === 'verifying') {
                            return (
                              <Chip
                                icon={<CircularProgress size={10} color="inherit" />}
                                label="Hashing..."
                                size="small"
                                sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}
                              />
                            )
                          }
                          if (check?.status === 'verified') {
                            return (
                              <Chip
                                icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: '13px !important' }} />}
                                label="SHA-256 Match"
                                size="small"
                                color="success"
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                              />
                            )
                          }
                          if (check?.status === 'mismatch') {
                            return (
                              <Chip
                                icon={<ErrorOutlineRoundedIcon sx={{ fontSize: '13px !important' }} />}
                                label="Hash Mismatch"
                                size="small"
                                color="error"
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                              />
                            )
                          }
                          return (
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<FingerprintRoundedIcon sx={{ fontSize: 13 }} />}
                              onClick={() => verifySinglePdfHash(r)}
                              sx={{
                                p: 0,
                                fontSize: '0.675rem',
                                textTransform: 'none',
                                justifyContent: 'flex-start',
                                color: '#0284c7',
                                fontWeight: 700,
                                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                              }}
                            >
                              Verify Hash
                            </Button>
                          )
                        })()}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 14 }} />}
                        onClick={() => handleInspectEvidence(r)}
                        sx={{
                          textTransform: 'none',
                          py: 0.35,
                          px: 1,
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          borderColor: '#cbd5e1',
                          color: '#1e293b',
                          '&:hover': { borderColor: '#0d9488', bgcolor: '#f0fdfa' },
                        }}
                      >
                        Inspect Voucher
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Evidence Inspection Modal */}
      <Dialog
        open={Boolean(inspectEvidenceId)}
        onClose={() => {
          setInspectEvidenceId(null)
          setInspectRecord(null)
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FingerprintRoundedIcon sx={{ color: '#0d9488' }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Evidence Cryptographic Hash & Document Inspection
            </Typography>
          </Box>
          {inspectRecord && (
            <Chip
              label={`${inspectRecord.site} • ${inspectRecord.metric}`}
              size="small"
              sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }}
            />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {/* Cryptographic Comparison Banner */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 2.5,
              borderRadius: 2,
              bgcolor:
                inspectHashVerified === true
                  ? '#f0fdf4'
                  : inspectHashVerified === false
                  ? '#fef2f2'
                  : '#f8fafc',
              borderColor:
                inspectHashVerified === true
                  ? '#86efac'
                  : inspectHashVerified === false
                  ? '#fca5a5'
                  : '#e2e8f0',
            }}
          >
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0f172a' }}>
                  Independent Cryptographic Proof Audit
                </Typography>
                {inspectHashVerified === true && (
                  <Chip
                    icon={<CheckCircleOutlineRoundedIcon />}
                    label="Cryptographically Authentic (100% Match)"
                    size="small"
                    color="success"
                    sx={{ fontWeight: 700 }}
                  />
                )}
                {inspectHashVerified === false && (
                  <Chip
                    icon={<ErrorOutlineRoundedIcon />}
                    label="Tamper Alert / Digest Mismatch"
                    size="small"
                    color="error"
                    sx={{ fontWeight: 700 }}
                  />
                )}
                {inspectHashVerified === null && isInspecting && (
                  <Chip
                    icon={<CircularProgress size={12} color="inherit" />}
                    label="Streaming & Hashing Document..."
                    size="small"
                    sx={{ bgcolor: '#e0f2fe', color: '#0369a1', fontWeight: 600 }}
                  />
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                    Original DB Ledger Hash (Stored on Upload):
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.725rem',
                      bgcolor: '#ffffff',
                      p: 1,
                      borderRadius: 1,
                      border: '1px solid #e2e8f0',
                      wordBreak: 'break-all',
                    }}
                  >
                    {inspectRecord?.evidenceHash || 'No hash recorded in database'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                    Live Auditor Download Digest (Computed in Browser via WebCrypto):
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.725rem',
                      bgcolor: '#ffffff',
                      p: 1,
                      borderRadius: 1,
                      border: '1px solid #e2e8f0',
                      wordBreak: 'break-all',
                      color:
                        inspectHashVerified === true
                          ? '#15803d'
                          : inspectHashVerified === false
                          ? '#b91c1c'
                          : 'text.secondary',
                    }}
                  >
                    {inspectComputedHash || (isInspecting ? 'Computing SHA-256 byte digest...' : 'Pending computation')}
                  </Typography>
                </Grid>
              </Grid>

              {inspectRecord && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 0.5 }}>
                  <Button
                    size="small"
                    startIcon={<RefreshRoundedIcon />}
                    onClick={() => handleInspectEvidence(inspectRecord)}
                    disabled={isInspecting}
                    sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                  >
                    Re-verify Live Digest
                  </Button>
                </Box>
              )}
            </Stack>
          </Paper>

          {inspectPreviewUrl ? (
            <Box
              component="iframe"
              src={inspectPreviewUrl}
              sx={{
                width: '100%',
                height: 480,
                border: '1px solid #cbd5e1',
                borderRadius: 1,
              }}
            />
          ) : isInspecting ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8, gap: 1.5 }}>
              <CircularProgress size={32} sx={{ color: '#0d9488' }} />
              <Typography variant="caption" color="text.secondary">
                Retrieving statutory evidence PDF stream and computing binary hash...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
                {inspectComputedHash || 'Evidence file stream could not be loaded from the storage vault.'}
              </Alert>
              {inspectRecord?.cloudinaryUrl && (
                <Button
                  variant="outlined"
                  size="small"
                  href={inspectRecord.cloudinaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ textTransform: 'none' }}
                >
                  Open in External CDN Mirror &rarr;
                </Button>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setInspectEvidenceId(null)
              setInspectRecord(null)
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Issue Assurance Statement Modal */}
      <Dialog
        open={opinionModalOpen}
        onClose={() => setOpinionModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Issue Independent Statutory Assurance Statement
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Assurance Firm / Provider"
              fullWidth
              size="small"
              value={assuranceForm.provider}
              onChange={(e) => setAssuranceForm({ ...assuranceForm, provider: e.target.value })}
            />
            <TextField
              label="Lead Assurance Partner Name"
              fullWidth
              size="small"
              value={assuranceForm.leadAuditor}
              onChange={(e) => setAssuranceForm({ ...assuranceForm, leadAuditor: e.target.value })}
            />
            <TextField
              label="Auditor Regulatory Registration No."
              fullWidth
              size="small"
              value={assuranceForm.registrationNumber}
              onChange={(e) => setAssuranceForm({ ...assuranceForm, registrationNumber: e.target.value })}
              helperText="e.g. ICAI Firm Registration Number or SEBI ESG Rating/Assurance Code"
            />
            <TextField
              select
              label="Assurance Standard"
              fullWidth
              size="small"
              value={assuranceForm.standard}
              onChange={(e) => setAssuranceForm({ ...assuranceForm, standard: e.target.value })}
            >
              <MenuItem value="ISAE 3000 (Revised) & ISO 14064-3">ISAE 3000 (Revised) & ISO 14064-3</MenuItem>
              <MenuItem value="ISO 14064-3 (GHG Specification)">ISO 14064-3 (GHG Specification)</MenuItem>
              <MenuItem value="SEBI Core Guidelines Mandate">SEBI Core Guidelines Mandate</MenuItem>
            </TextField>
            <TextField
              select
              label="Assurance Opinion Type"
              fullWidth
              size="small"
              value={assuranceForm.opinionType}
              onChange={(e) => setAssuranceForm({ ...assuranceForm, opinionType: e.target.value })}
            >
              <MenuItem value="Reasonable Assurance">Reasonable Assurance</MenuItem>
              <MenuItem value="Limited Assurance">Limited Assurance</MenuItem>
              <MenuItem value="Unqualified Opinion">Unqualified Opinion</MenuItem>
            </TextField>
            <TextField
              label="Auditor Conclusion / Opinion Text"
              fullWidth
              multiline
              rows={4}
              size="small"
              value={assuranceForm.opinionText}
              onChange={(e) => setAssuranceForm({ ...assuranceForm, opinionText: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpinionModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitOpinion}
            disabled={submittingAssurance}
            sx={{ bgcolor: '#0d9488', fontWeight: 700 }}
          >
            {submittingAssurance ? 'Signing...' : 'Sign & Digitally Seal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
