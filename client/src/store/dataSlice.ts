import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BrsrFullDossier } from '@my-app/common'
import {
  api,
  type EsgRecord,
  type Site,
  type MetricTotal,
  type AuditEvent,
  type PublicSite,
  type PublicSubsidiary,
  type PendingApprovalUser,
  type PublishedForm,
} from './api'
import { signOut } from './authSlice'

const CACHE_KEY = 'esg-data-cache-v1'

export interface DataState {
  records: EsgRecord[]
  sites: Site[]
  forms: PublishedForm[]
  metrics: Record<string, MetricTotal[]>
  pendingApprovals: PendingApprovalUser[]
  publicSites: PublicSite[]
  publicSubsidiaries: PublicSubsidiary[]
  brsrReport: BrsrFullDossier | null
  auditLogs: Record<string, AuditEvent[]>
  lastSync: Record<string, number>
}

// Helper to safely load cached state from localStorage for instantaneous 0ms startup
const loadInitialCachedData = (): Partial<DataState> => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return {
      records: Array.isArray(parsed.records) ? parsed.records : [],
      sites: Array.isArray(parsed.sites) ? parsed.sites : [],
      forms: Array.isArray(parsed.forms) ? parsed.forms : [],
      metrics: typeof parsed.metrics === 'object' && parsed.metrics !== null ? parsed.metrics : {},
      pendingApprovals: Array.isArray(parsed.pendingApprovals) ? parsed.pendingApprovals : [],
      publicSites: Array.isArray(parsed.publicSites) ? parsed.publicSites : [],
      publicSubsidiaries: Array.isArray(parsed.publicSubsidiaries) ? parsed.publicSubsidiaries : [],
      brsrReport: parsed.brsrReport || null,
      lastSync: typeof parsed.lastSync === 'object' && parsed.lastSync !== null ? parsed.lastSync : {},
    }
  } catch {
    return {}
  }
}

// Helper to safely persist data state to localStorage without breaking on quota
const saveCachedData = (state: DataState) => {
  try {
    const payload = JSON.stringify({
      records: state.records.slice(0, 500),
      sites: state.sites,
      forms: state.forms,
      metrics: state.metrics,
      pendingApprovals: state.pendingApprovals,
      publicSites: state.publicSites,
      publicSubsidiaries: state.publicSubsidiaries,
      brsrReport: state.brsrReport,
      lastSync: state.lastSync,
    })
    localStorage.setItem(CACHE_KEY, payload)
  } catch {
    // QuotaExceededError or disabled storage fallback - memory state persists
  }
}

const initialCached = loadInitialCachedData()

const initialState: DataState = {
  records: initialCached.records ?? [],
  sites: initialCached.sites ?? [],
  forms: initialCached.forms ?? [],
  metrics: initialCached.metrics ?? {},
  pendingApprovals: initialCached.pendingApprovals ?? [],
  publicSites: initialCached.publicSites ?? [],
  publicSubsidiaries: initialCached.publicSubsidiaries ?? [],
  brsrReport: initialCached.brsrReport ?? null,
  auditLogs: {},
  lastSync: initialCached.lastSync ?? {},
}

export const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setRecords(state, action: PayloadAction<EsgRecord[]>) {
      state.records = action.payload
      state.lastSync['records'] = Date.now()
      saveCachedData(state)
    },
    addRecord(state, action: PayloadAction<EsgRecord>) {
      // Optimistically prepend new record to list
      const exists = state.records.some((r) => r.id === action.payload.id)
      if (!exists) {
        state.records.unshift(action.payload)
      } else {
        state.records = state.records.map((r) => (r.id === action.payload.id ? action.payload : r))
      }
      saveCachedData(state)
    },
    updateRecordStatus(
      state,
      action: PayloadAction<{
        id: string
        reviewStatus: 'pending' | 'approved' | 'rejected'
        reviewedBy?: string | null
        reviewNote?: string | null
        reviewedAt?: string | null
      }>
    ) {
      const idx = state.records.findIndex((r) => r.id === action.payload.id)
      if (idx !== -1) {
        state.records[idx] = {
          ...state.records[idx],
          reviewStatus: action.payload.reviewStatus,
          reviewedBy: action.payload.reviewedBy !== undefined ? action.payload.reviewedBy : state.records[idx].reviewedBy,
          reviewNote: action.payload.reviewNote !== undefined ? action.payload.reviewNote : state.records[idx].reviewNote,
          reviewedAt: action.payload.reviewedAt !== undefined ? action.payload.reviewedAt : new Date().toISOString(),
        }
      }
      saveCachedData(state)
    },

    setSites(state, action: PayloadAction<Site[]>) {
      state.sites = action.payload
      state.lastSync['sites'] = Date.now()
      saveCachedData(state)
    },
    addSite(state, action: PayloadAction<Site>) {
      const exists = state.sites.some((s) => s.id === action.payload.id)
      if (!exists) {
        state.sites.push(action.payload)
      }
      saveCachedData(state)
    },

    setForms(state, action: PayloadAction<PublishedForm[]>) {
      state.forms = action.payload
      state.lastSync['forms'] = Date.now()
      saveCachedData(state)
    },
    addForm(state, action: PayloadAction<PublishedForm>) {
      const exists = state.forms.some((f) => String(f.id) === String(action.payload.id))
      if (!exists) {
        state.forms.unshift(action.payload)
      }
      saveCachedData(state)
    },
    toggleFormStatusLocal(state, action: PayloadAction<{ id: string | number; isActive: boolean }>) {
      const idx = state.forms.findIndex((f) => String(f.id) === String(action.payload.id))
      if (idx !== -1) {
        state.forms[idx].isActive = action.payload.isActive
      }
      saveCachedData(state)
    },

    setMetrics(state, action: PayloadAction<{ region: string; data: MetricTotal[] }>) {
      const key = action.payload.region || 'all'
      state.metrics[key] = action.payload.data
      state.lastSync[`metrics_${key}`] = Date.now()
      saveCachedData(state)
    },

    setPendingApprovals(state, action: PayloadAction<PendingApprovalUser[]>) {
      state.pendingApprovals = action.payload
      state.lastSync['pendingApprovals'] = Date.now()
      saveCachedData(state)
    },
    updateApprovalStatusLocal(
      state,
      action: PayloadAction<{
        id: number
        status: 'approved' | 'rejected' | 'pending'
        note?: string
      }>
    ) {
      const idx = state.pendingApprovals.findIndex((u) => u.id === action.payload.id)
      if (idx !== -1) {
        state.pendingApprovals[idx].approvalStatus = action.payload.status
        state.pendingApprovals[idx].isApproved = action.payload.status === 'approved'
        if (action.payload.note) state.pendingApprovals[idx].reviewNote = action.payload.note
        state.pendingApprovals[idx].reviewedAt = new Date().toISOString()
      }
      saveCachedData(state)
    },

    setPublicSites(state, action: PayloadAction<PublicSite[]>) {
      state.publicSites = action.payload
      saveCachedData(state)
    },
    setPublicSubsidiaries(state, action: PayloadAction<PublicSubsidiary[]>) {
      state.publicSubsidiaries = action.payload
      saveCachedData(state)
    },

    setBrsrReport(state, action: PayloadAction<BrsrFullDossier>) {
      state.brsrReport = action.payload
      state.lastSync['brsrReport'] = Date.now()
      saveCachedData(state)
    },

    setAuditLogs(state, action: PayloadAction<{ recordId: string; data: AuditEvent[] }>) {
      state.auditLogs[action.payload.recordId] = action.payload.data
    },

    clearCachedData(state) {
      state.records = []
      state.sites = []
      state.forms = []
      state.metrics = {}
      state.pendingApprovals = []
      state.publicSites = []
      state.publicSubsidiaries = []
      state.brsrReport = null
      state.auditLogs = {}
      state.lastSync = {}
      try {
        localStorage.removeItem(CACHE_KEY)
      } catch {
        // ignore
      }
    },
  },

  // Extra reducers to automatically sync state whenever RTK Query completes requests in background
  extraReducers: (builder) => {
    // When user signs out, clear cached data
    builder.addCase(signOut, (state) => {
      state.records = []
      state.sites = []
      state.forms = []
      state.metrics = {}
      state.pendingApprovals = []
      state.brsrReport = null
      state.auditLogs = {}
      state.lastSync = {}
      try {
        localStorage.removeItem(CACHE_KEY)
      } catch {
        // ignore
      }
    })

    // Records Query
    builder.addMatcher(api.endpoints.getRecords.matchFulfilled, (state, action) => {
      state.records = action.payload.data
      state.lastSync['records'] = Date.now()
      saveCachedData(state)
    })

    // Create Record Mutation
    builder.addMatcher(api.endpoints.createRecord.matchFulfilled, (state, action) => {
      const exists = state.records.some((r) => r.id === action.payload.data.id)
      if (!exists) {
        state.records.unshift(action.payload.data)
      } else {
        state.records = state.records.map((r) => (r.id === action.payload.data.id ? action.payload.data : r))
      }
      saveCachedData(state)
    })

    // Review Record Mutation
    builder.addMatcher(api.endpoints.reviewRecord.matchFulfilled, (state, action) => {
      const { id, reviewStatus } = action.payload.data
      const idx = state.records.findIndex((r) => r.id === id)
      if (idx !== -1) {
        state.records[idx].reviewStatus = reviewStatus as 'pending' | 'approved' | 'rejected'
        state.records[idx].reviewedAt = new Date().toISOString()
      }
      saveCachedData(state)
    })

    // Sites Query
    builder.addMatcher(api.endpoints.getSites.matchFulfilled, (state, action) => {
      state.sites = action.payload.data
      state.lastSync['sites'] = Date.now()
      saveCachedData(state)
    })

    // Create Site Mutation
    builder.addMatcher(api.endpoints.createSite.matchFulfilled, (state, action) => {
      const exists = state.sites.some((s) => s.id === action.payload.data.id)
      if (!exists) {
        state.sites.push(action.payload.data)
      }
      saveCachedData(state)
    })

    // Forms Query
    builder.addMatcher(api.endpoints.getForms.matchFulfilled, (state, action) => {
      state.forms = action.payload.data
      state.lastSync['forms'] = Date.now()
      saveCachedData(state)
    })

    // Create Form Mutation
    builder.addMatcher(api.endpoints.createForm.matchFulfilled, (state, action) => {
      const exists = state.forms.some((f) => String(f.id) === String(action.payload.data.id))
      if (!exists) {
        state.forms.unshift(action.payload.data)
      }
      saveCachedData(state)
    })

    // Toggle Form Mutation
    builder.addMatcher(api.endpoints.toggleFormStatus.matchFulfilled, (state, action) => {
      const { id, isActive } = action.payload.data
      const idx = state.forms.findIndex((f) => String(f.id) === String(id))
      if (idx !== -1) {
        state.forms[idx].isActive = isActive
      }
      saveCachedData(state)
    })

    // Metrics Query
    builder.addMatcher(api.endpoints.getMetrics.matchFulfilled, (state, action) => {
      const regionArg = (action.meta.arg.originalArgs as string | void) || 'all'
      state.metrics[regionArg] = action.payload.data
      state.lastSync[`metrics_${regionArg}`] = Date.now()
      saveCachedData(state)
    })

    // Pending Approvals Query
    builder.addMatcher(api.endpoints.getPendingApprovals.matchFulfilled, (state, action) => {
      state.pendingApprovals = action.payload.data
      state.lastSync['pendingApprovals'] = Date.now()
      saveCachedData(state)
    })

    // Decide Approval Mutation
    builder.addMatcher(api.endpoints.decideApproval.matchFulfilled, (state, action) => {
      const { id, approvalStatus, isApproved } = action.payload.data
      const idx = state.pendingApprovals.findIndex((u) => u.id === id)
      if (idx !== -1) {
        state.pendingApprovals[idx].approvalStatus = approvalStatus as 'pending' | 'approved' | 'rejected'
        state.pendingApprovals[idx].isApproved = isApproved
        state.pendingApprovals[idx].reviewedAt = new Date().toISOString()
      }
      saveCachedData(state)
    })

    // Public Sites Query
    builder.addMatcher(api.endpoints.getPublicSites.matchFulfilled, (state, action) => {
      state.publicSites = action.payload.data
      saveCachedData(state)
    })

    // Public Subsidiaries Query
    builder.addMatcher(api.endpoints.getPublicSubsidiaries.matchFulfilled, (state, action) => {
      state.publicSubsidiaries = action.payload.data
      saveCachedData(state)
    })

    // BRSR Report Query
    builder.addMatcher(api.endpoints.getBrsrReport.matchFulfilled, (state, action) => {
      state.brsrReport = action.payload.data
      state.lastSync['brsrReport'] = Date.now()
      saveCachedData(state)
    })

    // Audit Event Query
    builder.addMatcher(api.endpoints.getRecordAudit.matchFulfilled, (state, action) => {
      const recordId = action.meta.arg.originalArgs as string
      state.auditLogs[recordId] = action.payload.data
    })
  },
})

export const {
  setRecords,
  addRecord,
  updateRecordStatus,
  setSites,
  addSite,
  setForms,
  addForm,
  toggleFormStatusLocal,
  setMetrics,
  setPendingApprovals,
  updateApprovalStatusLocal,
  setPublicSites,
  setPublicSubsidiaries,
  setBrsrReport,
  setAuditLogs,
  clearCachedData,
} = dataSlice.actions

export default dataSlice.reducer
