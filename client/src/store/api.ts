import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { UserRole } from './authSlice'

export interface EsgRecord {
  id: string
  site: string
  siteId: number
  period: string
  pillar: 'environmental' | 'social' | 'governance'
  metric: string
  value: number
  unit: string
  rawValue: number
  rawUnit: string
  formula: string | null
  enteredBy: string
  role: string
  evidence: string
  notes: string
  evidenceId: number
  evidenceHash: string
  evidenceName: string
  reviewStatus: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string | null
  reviewNote?: string | null
  reviewedAt?: string | null
  createdAt: string
}

export interface Site { id: number; name: string; region: string; subsidiary: string; subsidiaryId: number; group: string }
export interface MetricTotal { metricCode: string; metric: string; unit: string; total: number; siteCount: number; period: string }
export interface AuditEvent { id: string; action: string; rawValue: number; rawUnit: string; normalizedValue: number; normalizedUnit: string; formula: string | null; enteredBy: string; role: string; createdAt: string; evidenceId: number; evidenceHash: string; evidenceName: string }
export interface AuthSession { token: string; user: { id: number; email: string; name: string; role: UserRole } }

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
  endpoints: (build) => ({
    login: build.mutation<{ data: AuthSession }, { email: string; password: string }>({ query: (body) => ({ url: 'auth/login', method: 'POST', body }) }),
    getCurrentUser: build.query<{ data: AuthSession['user'] }, void>({ query: () => 'auth/me' }),
    createUser: build.mutation<{ data: { id: number; email: string; name: string; role: UserRole } }, { email: string; password: string; name: string; role: UserRole; entityIds: number[] }>({ query: (body) => ({ url: 'auth/users', method: 'POST', body }) }),
    reviewRecord: build.mutation<{ data: { id: string; reviewStatus: string } }, { id: string; status: 'approved' | 'rejected'; note: string }>({
      query: ({ id, ...body }) => ({ url: `records/${id}/review`, method: 'PATCH', body }), invalidatesTags: ['Records'],
    }),
    getHealth: build.query<{ status?: string; message?: string }, void>({ query: () => 'health-check' }),
    getRecords: build.query<{ data: EsgRecord[] }, void>({ query: () => 'records', providesTags: ['Records'] }),
    getRecordAudit: build.query<{ data: AuditEvent[] }, string>({ query: (id) => `records/${id}/audit`, providesTags: ['Records'] }),
    getSites: build.query<{ data: Site[] }, void>({ query: () => 'sites', providesTags: ['Sites'] }),
    createSite: build.mutation<{ data: Site }, { group: string; subsidiary: string; site: string; region: string }>({
      query: (body) => ({ url: 'sites', method: 'POST', body }), invalidatesTags: ['Sites'],
    }),
    getMetrics: build.query<{ data: MetricTotal[] }, string | void>({ query: (region) => `metrics${region ? `?region=${encodeURIComponent(region)}` : ''}` }),
    createRecord: build.mutation<{ data: EsgRecord }, FormData>({
      query: (body) => ({ url: 'records', method: 'POST', body }),
      invalidatesTags: ['Records'],
    }),
  }),
  tagTypes: ['Records', 'Sites'],
})

export const { useLoginMutation, useGetCurrentUserQuery, useCreateUserMutation, useReviewRecordMutation, useGetRecordsQuery, useGetRecordAuditQuery, useGetSitesQuery, useCreateSiteMutation, useGetMetricsQuery, useCreateRecordMutation } = api
