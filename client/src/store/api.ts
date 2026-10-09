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
      invalidatesTags: ['PendingApprovals', 'CurrentUser'],
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
      invalidatesTags: ['Forms'],
    }),

    toggleFormStatus: build.mutation<{ message: string; data: { id: string; isActive: boolean } }, { id: string; isActive: boolean }>({
      query: ({ id, ...body }) => ({
        url: `forms/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Forms'],
    }),

    // ESG Records
    getRecords: build.query<{ data: EsgRecord[] }, void>({
      query: () => 'records',
      providesTags: ['Records'],
    }),

    createRecord: build.mutation<{ data: EsgRecord }, FormData>({
      query: (body) => ({ url: 'records', method: 'POST', body }),
      invalidatesTags: ['Records'],
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
      invalidatesTags: ['Records'],
    }),

    getRecordAudit: build.query<{ data: AuditEvent[] }, string>({
      query: (id) => `records/${id}/audit`,
      providesTags: ['Records'],
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
      invalidatesTags: ['Sites'],
    }),

    getMetrics: build.query<{ data: MetricTotal[] }, string | void>({
      query: (region) => `metrics${region ? `?region=${encodeURIComponent(region)}` : ''}`,
      providesTags: ['Records'],
    }),

    getBrsrReport: build.query<{ data: BrsrFullDossier }, void>({
      query: () => 'reports/brsr/data',
      providesTags: ['Records', 'Sites'],
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
} = api
