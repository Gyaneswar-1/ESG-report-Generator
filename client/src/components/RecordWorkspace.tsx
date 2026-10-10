import { useMemo, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Alert,
  Box,
  Card,
  CardActionArea,
  Chip,
  Container,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded'
import SupervisorAccountOutlinedIcon from '@mui/icons-material/SupervisorAccountOutlined'
import DynamicFormOutlinedIcon from '@mui/icons-material/DynamicFormOutlined'
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined'
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'

import type { RootState, AppDispatch } from '../store'
import { setRegion } from '../store/authSlice'
import { updateRecordStatus } from '../store/dataSlice'
import {
  useGetFormsQuery,
  useGetMetricsQuery,
  useGetRecordAuditQuery,
  useGetRecordsQuery,
  useGetSitesQuery,
  useReviewRecordMutation,
  type EsgRecord,
} from '../store/api'

import { RecordSubmissionForm } from './workspace/RecordSubmissionForm'
import { RecordsLedgerTable } from './workspace/RecordsLedgerTable'
import { FacilityManager } from './workspace/FacilityManager'
import { EvidenceModal } from './workspace/EvidenceModal'
import { AuditHistoryDrawer } from './workspace/AuditHistoryDrawer'
import { PendingApprovalsManager } from './PendingApprovalsManager'
import { PublishedFormsManager } from './PublishedFormsManager'
import { BrsrReportStudio } from './BrsrReportStudio'
import { AuditorAssuranceWorkbench } from './AuditorAssuranceWorkbench'
import { FrameworkMapping } from './FrameworkMapping'

export function RecordWorkspace() {
  const { role, region, token } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  const [workspaceTab, setWorkspaceTab] = useState(0)

  // Redux Cached Data (instant zero-delay rendering)
  const cachedSites = useSelector((state: RootState) => state.data.sites)
  const cachedRecords = useSelector((state: RootState) => state.data.records)
  const cachedForms = useSelector((state: RootState) => state.data.forms)
  const cachedMetrics = useSelector((state: RootState) => state.data.metrics[region || 'all'])

  const { data: siteData } = useGetSitesQuery()
  const { data: recordsData, isLoading: loadingRecordsQuery } = useGetRecordsQuery()
  const { data: formsData } = useGetFormsQuery()
  const { data: metricData } = useGetMetricsQuery(region || undefined, { skip: role !== 'executive' })

  const [reviewRecord, { isLoading: reviewing, error: reviewError }] = useReviewRecordMutation()

  const [selectedRecord, setSelectedRecord] = useState<EsgRecord | null>(null)
  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false)
  const [evidencePreview, setEvidencePreview] = useState<string | null>(null)
  const [hashVerified, setHashVerified] = useState<boolean | null>(null)

  const { data: auditData, isLoading: loadingAudit } = useGetRecordAuditQuery(
    selectedRecord?.id ?? '',
    { skip: !selectedRecord }
  )

  const sites = useMemo(
    () => (cachedSites.length > 0 ? cachedSites : siteData?.data ?? []),
    [cachedSites, siteData?.data]
  )
  const records = useMemo(
    () => (cachedRecords.length > 0 ? cachedRecords : recordsData?.data ?? []),
    [cachedRecords, recordsData?.data]
  )
  const publishedForms = useMemo(
    () => (cachedForms.length > 0 ? cachedForms : formsData?.data ?? []),
    [cachedForms, formsData?.data]
  )
  const regions = useMemo(() => [...new Set(sites.map((site) => site.region))].sort(), [sites])
  const activeMetrics = useMemo(
    () => (cachedMetrics && cachedMetrics.length > 0 ? cachedMetrics : metricData?.data ?? []),
    [cachedMetrics, metricData?.data]
  )

  const loadingRecords = records.length === 0 && loadingRecordsQuery

  // Verify and preview evidence attachment
  const openEvidence = async (evidenceId: number, record?: EsgRecord) => {
    if (record) {
      setSelectedRecord(record)
    }
    setEvidenceModalOpen(true)
    setHashVerified(null)
    setEvidencePreview(null)

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1/'}evidence/${evidenceId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!response.ok) return
      const blob = await response.blob()
      const bytes = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
      const actualHash = [...new Uint8Array(bytes)]
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('')
      setHashVerified(actualHash === response.headers.get('X-Content-SHA256'))
      setEvidencePreview(URL.createObjectURL(blob))
    } catch {
      // preview error handled gracefully
    }
  }

  useEffect(() => {
    return () => {
      if (evidencePreview) {
        URL.revokeObjectURL(evidencePreview)
      }
    }
  }, [evidencePreview])

  // Review action handler
  const handleDecideReview = async (status: 'approved' | 'rejected', note: string) => {
    if (!selectedRecord) return
    const recId = selectedRecord.id
    try {
      dispatch(updateRecordStatus({ id: recId, reviewStatus: status, reviewNote: note }))
      await reviewRecord({ id: recId, status, note }).unwrap()
      setSelectedRecord(null)
    } catch {
      // error handled by reviewError
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
      {/* Executive Multi-Site / Region Toggle & Dynamic Roll-Up Dashboard */}
      {role === 'executive' && (
        <Box sx={{ mb: 4 }}>
          <Stack
            direction="row"
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>
                Executive Roll-Up & Statutory Disclosures
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dynamically aggregated across all reporting leaf nodes (250+ MEIL projects).
              </Typography>
            </Box>

            <TextField
              select
              size="small"
              label="Jurisdiction / Region"
              value={region}
              onChange={(event) => dispatch(setRegion(event.target.value))}
              sx={{ minWidth: 230, bgcolor: '#ffffff' }}
            >
              <MenuItem value="">All MEIL Corporate Projects</MenuItem>
              {regions.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Metric KPI cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 2,
            }}
          >
            {activeMetrics.slice(0, 4).map((metric) => (
              <Card
                key={`${metric.metricCode}-${metric.period}`}
                variant="outlined"
                sx={{
                  borderRadius: 2.5,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
                  },
                }}
              >
                <CardActionArea
                  onClick={() => {
                    const match = records.find((r) => r.metricCode === metric.metricCode)
                    if (match) setSelectedRecord(match)
                  }}
                  sx={{ p: 2 }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {metric.metric} · {metric.period}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', my: 0.5 }}>
                    {metric.total.toLocaleString()}{' '}
                    <Typography component="span" variant="body2" color="text.secondary">
                      {metric.unit}
                    </Typography>
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      From {metric.siteCount} sites
                    </Typography>
                    <Chip label="Audit Vault" size="small" variant="outlined" sx={{ height: 18, fontSize: '0.65rem' }} />
                  </Box>
                </CardActionArea>
              </Card>
            ))}
            {activeMetrics.length === 0 && (
              <Alert severity="info" sx={{ gridColumn: '1 / -1' }}>
                No records found for this regional scope. Switch region or wait for Site Engineer submissions.
              </Alert>
            )}
          </Box>
        </Box>
      )}

      {/* Role Navigation Tabs: Subsidiary Head */}
      {role === 'subsidiary_head' && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={workspaceTab} onChange={(_e, v) => setWorkspaceTab(v)}>
            <Tab
              icon={<ListAltRoundedIcon fontSize="small" />}
              iconPosition="start"
              label="Submissions Directory"
            />
            <Tab
              icon={<SupervisorAccountOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Field Submissions Approvals"
            />
            <Tab
              icon={<DynamicFormOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Published Dynamic Forms"
            />
            <Tab
              icon={<AccountBalanceOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Statutory Framework Crosswalk"
            />
          </Tabs>
        </Box>
      )}

      {/* Role Navigation Tabs: Executive */}
      {role === 'executive' && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={workspaceTab} onChange={(_e, v) => setWorkspaceTab(v)}>
            <Tab
              icon={<ListAltRoundedIcon fontSize="small" />}
              iconPosition="start"
              label="Consolidated ESG Ledger"
            />
            <Tab
              icon={<SupervisorAccountOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Subsidiary Head Approvals"
            />
            <Tab
              icon={<AssessmentOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Operational Facilities"
            />
            <Tab
              icon={<PictureAsPdfOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="SEBI BRSR Annexure-I Report"
            />
            <Tab
              icon={<AccountBalanceOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Statutory Framework Crosswalk"
            />
          </Tabs>
        </Box>
      )}

      {/* Role Navigation Tabs: Auditor */}
      {role === 'auditor' && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={workspaceTab} onChange={(_e, v) => setWorkspaceTab(v)}>
            <Tab
              icon={<FactCheckOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Disclosures & Evidence Ledger"
            />
            <Tab
              icon={<VerifiedUserOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Auditor Assurance Workbench"
            />
            <Tab
              icon={<PictureAsPdfOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="SEBI BRSR Annexure-I Report"
            />
            <Tab
              icon={<AccountBalanceOutlinedIcon fontSize="small" />}
              iconPosition="start"
              label="Statutory Framework Crosswalk"
            />
          </Tabs>
        </Box>
      )}

      {/* VIEW: Engineer Workspace (Split View) */}
      {role === 'engineer' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          <RecordSubmissionForm
            sites={sites}
            publishedForms={publishedForms}
            currentRole={role}
          />
          <RecordsLedgerTable
            records={records}
            sites={sites}
            currentRole={role}
            onSelectRecord={setSelectedRecord}
            onInspectEvidence={(evidenceId, rec) => openEvidence(evidenceId, rec)}
            selectedRecordId={selectedRecord?.id}
            loading={loadingRecords}
          />
        </Box>
      )}

      {/* VIEW: Subsidiary Head Workspace Tabs */}
      {role === 'subsidiary_head' && (
        <>
          {workspaceTab === 0 && (
            <RecordsLedgerTable
              records={records}
              sites={sites}
              currentRole={role}
              onSelectRecord={setSelectedRecord}
              onInspectEvidence={(evidenceId, rec) => openEvidence(evidenceId, rec)}
              selectedRecordId={selectedRecord?.id}
              loading={loadingRecords}
            />
          )}
          {workspaceTab === 1 && <PendingApprovalsManager currentRole={role} />}
          {workspaceTab === 2 && <PublishedFormsManager currentRole={role} />}
          {workspaceTab === 3 && <FrameworkMapping />}
        </>
      )}

      {/* VIEW: Executive Workspace Tabs */}
      {role === 'executive' && (
        <>
          {workspaceTab === 0 && (
            <RecordsLedgerTable
              records={records}
              sites={sites}
              currentRole={role}
              onSelectRecord={setSelectedRecord}
              onInspectEvidence={(evidenceId, rec) => openEvidence(evidenceId, rec)}
              selectedRecordId={selectedRecord?.id}
              loading={loadingRecords}
            />
          )}
          {workspaceTab === 1 && <PendingApprovalsManager currentRole={role} />}
          {workspaceTab === 2 && <FacilityManager sites={sites} />}
          {workspaceTab === 3 && <BrsrReportStudio isEmbedded={true} />}
          {workspaceTab === 4 && <FrameworkMapping />}
        </>
      )}

      {/* VIEW: Auditor Workspace Tabs */}
      {role === 'auditor' && (
        <>
          {workspaceTab === 0 && (
            <RecordsLedgerTable
              records={records}
              sites={sites}
              currentRole={role}
              onSelectRecord={setSelectedRecord}
              onInspectEvidence={(evidenceId, rec) => openEvidence(evidenceId, rec)}
              selectedRecordId={selectedRecord?.id}
              loading={loadingRecords}
            />
          )}
          {workspaceTab === 1 && (
            <AuditorAssuranceWorkbench
              records={records}
              sites={sites}
            />
          )}
          {workspaceTab === 2 && <BrsrReportStudio isEmbedded={true} />}
          {workspaceTab === 3 && <FrameworkMapping />}
        </>
      )}

      {/* Slide-Over Audit Trail & Revisions Drawer */}
      <AuditHistoryDrawer
        open={Boolean(selectedRecord)}
        onClose={() => {
          setSelectedRecord(null)
          setHashVerified(null)
        }}
        record={selectedRecord}
        auditData={auditData}
        loadingAudit={loadingAudit}
        onInspectEvidence={(evidenceId) => openEvidence(evidenceId, selectedRecord!)}
        currentRole={role ?? undefined}
        onDecideReview={handleDecideReview}
        isReviewing={reviewing}
        reviewError={reviewError}
      />

      {/* Cryptographic Evidence File Verification Modal */}
      <EvidenceModal
        open={evidenceModalOpen}
        onClose={() => setEvidenceModalOpen(false)}
        record={selectedRecord}
        previewUrl={evidencePreview}
        hashVerified={hashVerified}
      />
    </Container>
  )
}
