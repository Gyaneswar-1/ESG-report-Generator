import React, { useState, useMemo } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded'
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded'
import AttachFileRoundedIcon from '@mui/icons-material/AttachFileRounded'
import type { EsgRecord, Site } from '../../store/api'

interface RecordsLedgerTableProps {
  records: EsgRecord[]
  sites: Site[]
  currentRole: string
  onSelectRecord: (record: EsgRecord) => void
  onInspectEvidence?: (evidenceId: number, record: EsgRecord) => void
  selectedRecordId?: string
  loading?: boolean
}

export const RecordsLedgerTable: React.FC<RecordsLedgerTableProps> = ({
  records,
  sites,
  currentRole,
  onSelectRecord,
  onInspectEvidence,
  selectedRecordId,
  loading = false,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [siteFilter, setSiteFilter] = useState('')

  const isEngineer = currentRole === 'engineer'

  const recordCounts = useMemo(() => {
    return {
      all: records.length,
      pending: records.filter((r) => r.reviewStatus === 'pending').length,
      approved: records.filter((r) => r.reviewStatus === 'approved').length,
      rejected: records.filter((r) => r.reviewStatus === 'rejected').length,
    }
  }, [records])

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (statusFilter !== 'all' && r.reviewStatus !== statusFilter) {
        return false
      }
      if (siteFilter && String(r.siteId) !== siteFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchMetric = r.metric?.toLowerCase().includes(q)
        const matchSite = r.site?.toLowerCase().includes(q)
        const matchUser = r.enteredBy?.toLowerCase().includes(q)
        const matchPeriod = r.period?.toLowerCase().includes(q)
        if (!matchMetric && !matchSite && !matchUser && !matchPeriod) return false
      }
      return true
    })
  }, [records, statusFilter, siteFilter, searchQuery])

  return (
    <Box sx={{ width: '100%' }}>
      {/* Summary Filter Cards (for reviewers & auditors) */}
      {!isEngineer && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 2.5,
          }}
        >
          <Card
            variant="outlined"
            onClick={() => setStatusFilter('all')}
            sx={{
              cursor: 'pointer',
              borderRadius: 2.5,
              border: statusFilter === 'all' ? '2px solid #2563eb' : '1px solid #e2e8f0',
              bgcolor: statusFilter === 'all' ? '#eff6ff' : '#ffffff',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#93c5fd' },
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" sx={{ fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                All Entries
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a', mt: 0.5 }}>
                {recordCounts.all}
              </Typography>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            onClick={() => setStatusFilter('pending')}
            sx={{
              cursor: 'pointer',
              borderRadius: 2.5,
              border: statusFilter === 'pending' ? '2px solid #d97706' : '1px solid #e2e8f0',
              bgcolor: statusFilter === 'pending' ? '#fffbeb' : '#ffffff',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#fcd34d' },
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" sx={{ fontWeight: 650, color: '#d97706', textTransform: 'uppercase' }}>
                Pending Review
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#b45309', mt: 0.5 }}>
                {recordCounts.pending}
              </Typography>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            onClick={() => setStatusFilter('approved')}
            sx={{
              cursor: 'pointer',
              borderRadius: 2.5,
              border: statusFilter === 'approved' ? '2px solid #16a34a' : '1px solid #e2e8f0',
              bgcolor: statusFilter === 'approved' ? '#f0fdf4' : '#ffffff',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#86efac' },
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" sx={{ fontWeight: 650, color: '#16a34a', textTransform: 'uppercase' }}>
                Approved Entries
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#15803d', mt: 0.5 }}>
                {recordCounts.approved}
              </Typography>
            </CardContent>
          </Card>

          <Card
            variant="outlined"
            onClick={() => setStatusFilter('rejected')}
            sx={{
              cursor: 'pointer',
              borderRadius: 2.5,
              border: statusFilter === 'rejected' ? '2px solid #dc2626' : '1px solid #e2e8f0',
              bgcolor: statusFilter === 'rejected' ? '#fef2f2' : '#ffffff',
              transition: 'all 0.15s ease',
              '&:hover': { borderColor: '#fca5a5' },
            }}
          >
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="caption" sx={{ fontWeight: 650, color: '#dc2626', textTransform: 'uppercase' }}>
                Rejected Submissions
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#b91c1c', mt: 0.5 }}>
                {recordCounts.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Main Ledger Card */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(15,23,42,0.04)' }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 750, color: '#0f172a' }}>
                {isEngineer
                  ? 'My Recent Telemetry Submissions'
                  : currentRole === 'subsidiary_head'
                  ? 'Subsidiary Project Submissions Directory'
                  : currentRole === 'auditor'
                  ? 'Statutory Assurance & Evidence Ledger'
                  : 'Enterprise Disclosures & Audit Vault'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredRecords.length} records shown ({records.length} total in current scope)
              </Typography>
            </Box>
          </Box>

          {/* Filter Controls */}
          {!isEngineer && (
            <Box
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                mb: 2.5,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Tabs
                value={statusFilter}
                onChange={(_e, v) => setStatusFilter(v)}
                sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 650 } }}
              >
                <Tab value="all" label={`All (${recordCounts.all})`} />
                <Tab value="pending" label={`Pending (${recordCounts.pending})`} />
                <Tab value="approved" label={`Approved (${recordCounts.approved})`} />
                <Tab value="rejected" label={`Rejected (${recordCounts.rejected})`} />
              </Tabs>

              <Stack direction="row" spacing={1.5} sx={{ py: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                <TextField
                  select
                  size="small"
                  label="Operational Site"
                  value={siteFilter}
                  onChange={(e) => setSiteFilter(e.target.value)}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="">All Assigned Sites</MenuItem>
                  {sites.map((s) => (
                    <MenuItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  size="small"
                  placeholder="Search metric, site, user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ minWidth: 200 }}
                />
              </Stack>
            </Box>
          )}

          {isEngineer && (
            <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
              <strong>Notice:</strong> Field measurements below are displayed with your original entered units alongside the normalized SEBI statutory compliance equivalent.
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : filteredRecords.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              {statusFilter === 'all'
                ? 'No recorded ESG measurements found in this scope.'
                : `No submissions with status "${statusFilter}".`}
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {filteredRecords.slice(0, 100).map((record) => {
                const isSelected = selectedRecordId === record.id
                return (
                  <Box
                    key={record.id}
                    onClick={() => onSelectRecord(record)}
                    sx={{
                      p: 1.75,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: isSelected
                        ? '2px solid #0f766e'
                        : record.reviewStatus === 'pending'
                        ? '1px solid #fde68a'
                        : record.reviewStatus === 'rejected'
                        ? '1px solid #fecaca'
                        : '1px solid #e2e8f0',
                      bgcolor: isSelected
                        ? '#f0fdfa'
                        : record.reviewStatus === 'pending'
                        ? '#fffdf5'
                        : '#ffffff',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 2,
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' },
                    }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                          {record.metric}
                        </Typography>
                        <Chip
                          label={record.pillar?.toUpperCase() || 'ESG'}
                          size="small"
                          variant="outlined"
                          sx={{ height: 18, fontSize: '0.625rem', fontWeight: 600 }}
                        />
                        {record.evidenceHash && (
                          <Chip
                            label="SHA-256 Sealed"
                            size="small"
                            sx={{ height: 18, fontSize: '0.625rem', bgcolor: '#f1f5f9', color: '#475569' }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                        {record.site} · {record.period} · Entered by {record.enteredBy}
                        {record.reviewedBy && <> · Reviewed by <strong>{record.reviewedBy}</strong></>}
                      </Typography>
                    </Box>

                    <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                        {record.rawValue} {record.rawUnit}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#0284c7', display: 'block', fontWeight: 600 }}>
                        SEBI: {record.value} {record.unit}
                      </Typography>

                      <Stack direction="row" spacing={0.75} sx={{ justifyContent: 'flex-end', alignItems: 'center', mt: 0.5 }}>
                        <Chip
                          icon={
                            record.reviewStatus === 'approved' ? (
                              <CheckCircleOutlineRoundedIcon sx={{ fontSize: '12px !important' }} />
                            ) : record.reviewStatus === 'rejected' ? (
                              <HighlightOffRoundedIcon sx={{ fontSize: '12px !important' }} />
                            ) : (
                              <HourglassEmptyRoundedIcon sx={{ fontSize: '12px !important' }} />
                            )
                          }
                          label={
                            record.reviewStatus === 'approved'
                              ? 'Approved'
                              : record.reviewStatus === 'rejected'
                              ? 'Rejected'
                              : 'Pending'
                          }
                          size="small"
                          color={
                            record.reviewStatus === 'approved'
                              ? 'success'
                              : record.reviewStatus === 'rejected'
                              ? 'error'
                              : 'warning'
                          }
                          sx={{ height: 20, fontSize: '0.675rem', fontWeight: 650 }}
                        />

                        {record.evidenceId && onInspectEvidence && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={(e) => {
                              e.stopPropagation()
                              onInspectEvidence(record.evidenceId!, record)
                            }}
                            sx={{ minWidth: 0, p: 0.5, color: '#64748b' }}
                            title="Inspect Proof File"
                          >
                            <AttachFileRoundedIcon sx={{ fontSize: 16 }} />
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                )
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
