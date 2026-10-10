import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { FormField, BrsrFullDossier } from '@my-app/common'
import type { UserProfile, UserRole } from './authSlice'

export interface EsgRecord {
  id: string
  site: string
  siteId: number
  formId?: number | null
  period: string
  pillar: 'environmental' | 'social' | 'governance'
  metric: string
  metricCode?: string
  value: number // Normalized SEBI value
  unit: string // Normalized SEBI unit
  rawValue: number // Raw value uploaded by site engineer
  rawUnit: string // Raw unit uploaded by site engineer
  formula: string | null
  enteredBy: string
  role: string
  evidence: string
  notes: string
  customData?: Record<string, any> | null
  evidenceId: number
  evidenceHash: string
  evidenceName: string
  cloudinaryUrl?: string
  reviewStatus: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string | null
  reviewNote?: string | null
  reviewedAt?: string | null
  createdAt: string
}

export interface Site {
  id: number
  name: string
  region: string
  subsidiary: string
  subsidiaryId: number
  group: string
}

export interface MetricTotal {
  metricCode: string
  metric: string
  unit: string
  total: number
  siteCount: number
  period: string
}

export interface AuditEvent {
  id: string
  action: string
  rawValue: number
  rawUnit: string
  normalizedValue: number
  normalizedUnit: string
  formula: string | null
  enteredBy: string
  role: string
  createdAt: string
  evidenceId: number
  evidenceHash: string
  evidenceName: string
  cloudinaryUrl?: string
}

export interface AuthSession {
  token: string
  user: UserProfile
}

export interface PublicSite {
  id: number
  name: string
  region: string
  subsidiary?: string
}

export interface PublicSubsidiary {
  id: number
  name: string
  region: string
  subHead?: {
    id: number
    name: string
    email: string
    designation?: string
    department?: string
    isApproved?: boolean
    approvalStatus?: string
  } | null
  subHeadName?: string
  subHeadTitle?: string
  sites?: { id: number; name: string; region: string }[]
}

export interface PendingApprovalUser {
  id: number
  name: string
  email: string
  role: UserRole
  phone: string
  employeeId: string
  department: string
  designation: string
  qualifications: string
  location: string
  organization: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  isApproved?: boolean
  isProfileCompleted?: boolean
  reviewNote?: string
  reviewedAt?: string | null
  createdAt: string
  sites?: { id: number; name: string; region: string }[]
  scopes?: { id: number; name: string; region: string; level: string }[]
  company?: { id: number; name: string; region: string } | null
}

export interface PublishedForm {
  id: string | number
  title: string
  description: string
  fields?: FormField[]
  pillar: 'environmental' | 'social' | 'governance'
  metricCode: string
  defaultUnit: string
  allowedUnits: string[]
  requiresFileUpload: boolean
  fileInstruction: string
  siteId?: number | null
  siteName: string
  subsidiaryId?: number | null
  isActive: boolean
  createdAt: string
  createdByName?: string
}

export const api = createApi({
  reducerPath: 'api',
  keepUnusedDataFor: 86400, // Retain query cache in Redux for 24 hours to prevent constant re-fetching delays
  refetchOnMountOrArgChange: false, // Serve instant cached data from Redux without forced network delays
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1/',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth?: { token?: string | null } }).auth?.token
      if (token) headers.set('authorization', `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ['Records', 'Sites', 'Forms', 'PendingApprovals', 'CurrentUser'],
  endpoints: (build) => ({
    // Auth & Profile
    login: build.mutation<{ data: AuthSession }, { email: string; password: string; role: UserRole }>({
      query: (body) => ({ url: 'auth/login', method: 'POST', body }),
      invalidatesTags: ['CurrentUser'],
    }),

    signup: build.mutation<
      { message: string; data: AuthSession },
      {
        name: string
        email: string
        password: string
        role: UserRole
        siteIds?: number[]
        subsidiaryIds?: number[]
      }
    >({
      query: (body) => ({ url: 'auth/signup', method: 'POST', body }),
      invalidatesTags: ['CurrentUser'],
    }),

    getCurrentUser: build.query<{ data: UserProfile }, void>({
      query: () => 'auth/me',
      providesTags: ['CurrentUser'],
    }),

    completeProfile: build.mutation<
      { message: string; data: AuthSession },
      {
        phone: string
        employeeId: string
        department: string
        designation: string
        qualifications?: string
        organization?: string
        location?: string
        siteIds?: number[]
        subsidiaryIds?: number[]
      }
    >({
      query: (body) => ({ url: 'auth/profile', method: 'PATCH', body }),
      invalidatesTags: ['CurrentUser', 'PendingApprovals', 'Sites'],
    }),

    // Multi-tier Approvals
    getPendingApprovals: build.query<{ data: PendingApprovalUser[] }, void>({
      query: () => 'auth/pending-approvals',
      providesTags: ['PendingApprovals'],
    }),

    decideApproval: build.mutation<
      { message: string; data: { id: number; approvalStatus: string; isApproved: boolean } },
      { id: number | string; decision: 'approve' | 'reject' | 'pending'; note?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `auth/approvals/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['CurrentUser'],
      async onQueryStarted({ id, decision, note }, { dispatch, queryFulfilled }) {
        // Optimistic Redux state update for zero-latency UI response
        const patchResult = dispatch(
          api.util.updateQueryData('getPendingApprovals', undefined, (draft) => {
            const user = draft.data.find((u) => u.id === Number(id))
            if (user) {
              user.approvalStatus = decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'pending'
              user.isApproved = decision === 'approve'
              if (note) user.reviewNote = note
              user.reviewedAt = new Date().toISOString()
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    // Public scopes for registration
    getPublicSites: build.query<{ data: PublicSite[] }, void>({
      query: () => 'auth/public/sites',
    }),

    getPublicSubsidiaries: build.query<{ data: PublicSubsidiary[] }, void>({
      query: () => 'auth/public/subsidiaries',
    }),

    // Dynamic Forms
    getForms: build.query<{ data: PublishedForm[] }, void>({
      query: () => 'forms',
      providesTags: ['Forms'],
    }),

    createForm: build.mutation<
      { message: string; data: PublishedForm },
      {
        title: string
        description?: string
        pillar: 'environmental' | 'social' | 'governance'
        metricCode: string
        defaultUnit: string
        allowedUnits?: string[]
        requiresFileUpload?: boolean
        fileInstruction?: string
        siteId?: number | null
        fields?: FormField[]
      }
    >({
      query: (body) => ({ url: 'forms', method: 'POST', body }),
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled
          dispatch(
            api.util.updateQueryData('getForms', undefined, (draft) => {
              const exists = draft.data.some((f) => String(f.id) === String(res.data.id))
              if (!exists) draft.data.unshift(res.data)
            })
          )
        } catch {
          // handled
        }
      },
    }),

    toggleFormStatus: build.mutation<{ message: string; data: { id: string; isActive: boolean } }, { id: string; isActive: boolean }>({
      query: ({ id, ...body }) => ({
        url: `forms/${id}/status`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted({ id, isActive }, { dispatch, queryFulfilled }) {
        // Optimistic Redux state update for zero-latency switch toggle
        const patchResult = dispatch(
          api.util.updateQueryData('getForms', undefined, (draft) => {
            const form = draft.data.find((f) => String(f.id) === String(id))
            if (form) {
              form.isActive = isActive
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    // ESG Records
    getRecords: build.query<{ data: EsgRecord[] }, void>({
      query: () => 'records',
      providesTags: ['Records'],
    }),

    createRecord: build.mutation<{ data: EsgRecord }, FormData>({
      query: (body) => ({ url: 'records', method: 'POST', body }),
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled
          dispatch(
            api.util.updateQueryData('getRecords', undefined, (draft) => {
              const exists = draft.data.some((r) => r.id === res.data.id)
              if (!exists) draft.data.unshift(res.data)
            })
          )
        } catch {
          // handled
        }
      },
    }),

    reviewRecord: build.mutation<
      { data: { id: string; reviewStatus: string } },
      { id: string; status: 'approved' | 'rejected'; note: string }
    >({
      query: ({ id, ...body }) => ({
        url: `records/${id}/review`,
        method: 'PATCH',
        body,
      }),
      async onQueryStarted({ id, status, note }, { dispatch, queryFulfilled, getState }) {
        // Optimistic Redux state update for instant verification status change
        const currentUser = (getState() as { auth?: { name?: string } }).auth?.name ?? 'Reviewer'
        const patchResult = dispatch(
          api.util.updateQueryData('getRecords', undefined, (draft) => {
            const record = draft.data.find((r) => r.id === id)
            if (record) {
              record.reviewStatus = status
              record.reviewedBy = currentUser
              record.reviewNote = note
              record.reviewedAt = new Date().toISOString()
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),

    getRecordAudit: build.query<{ data: AuditEvent[] }, string>({
      query: (id) => `records/${id}/audit`,
    }),

    // Sites & Organization
    getSites: build.query<{ data: Site[] }, void>({
      query: () => 'sites',
      providesTags: ['Sites'],
    }),

    createSite: build.mutation<
      { data: Site },
      { group: string; subsidiary: string; site: string; region: string }
    >({
      query: (body) => ({ url: 'sites', method: 'POST', body }),
      async onQueryStarted(_body, { dispatch, queryFulfilled }) {
        try {
          const { data: res } = await queryFulfilled
          dispatch(
            api.util.updateQueryData('getSites', undefined, (draft) => {
              const exists = draft.data.some((s) => s.id === res.data.id)
              if (!exists) draft.data.push(res.data)
            })
          )
        } catch {
          // handled
        }
      },
    }),

    getMetrics: build.query<{ data: MetricTotal[] }, string | void>({
      query: (region) => `metrics${region ? `?region=${encodeURIComponent(region)}` : ''}`,
      providesTags: ['Records'],
    }),

    getBrsrReport: build.query<{ data: BrsrFullDossier }, void>({
      query: () => 'reports/brsr/data',
      providesTags: ['Records', 'Sites'],
    }),

    submitAuditorAssurance: build.mutation<
      { success: boolean; data: any; message: string },
      {
        provider: string
        leadAuditor: string
        registrationNumber: string
        standard: string
        opinionType: string
        opinionText: string
      }
    >({
      query: (body) => ({ url: 'reports/brsr/assurance', method: 'POST', body }),
      invalidatesTags: ['Records'],
    }),
  }),
})

export const {
  useLoginMutation,
  useSignupMutation,
  useGetCurrentUserQuery,
  useCompleteProfileMutation,
  useGetPendingApprovalsQuery,
  useDecideApprovalMutation,
  useGetPublicSitesQuery,
  useGetPublicSubsidiariesQuery,
  useGetFormsQuery,
  useCreateFormMutation,
  useToggleFormStatusMutation,
  useGetRecordsQuery,
  useCreateRecordMutation,
  useReviewRecordMutation,
  useGetRecordAuditQuery,
  useGetSitesQuery,
  useCreateSiteMutation,
  useGetMetricsQuery,
  useGetBrsrReportQuery,
  useSubmitAuditorAssuranceMutation,
} = api
