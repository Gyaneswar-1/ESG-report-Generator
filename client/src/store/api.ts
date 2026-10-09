import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface EsgRecord {
  id: string
  site: string
  period: string
  pillar: 'environmental' | 'social' | 'governance'
  metric: string
  value: number
  unit: string
  enteredBy: string
  role: string
  evidence: string
  notes: string
  createdAt: string
}

type RecordInput = Omit<EsgRecord, 'id' | 'createdAt'>

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1/' }),
  endpoints: (build) => ({
    getHealth: build.query<{ status?: string; message?: string }, void>({ query: () => 'health-check' }),
    getRecords: build.query<{ data: EsgRecord[] }, void>({ query: () => 'records', providesTags: ['Records'] }),
    createRecord: build.mutation<{ data: EsgRecord }, RecordInput>({
      query: (body) => ({ url: 'records', method: 'POST', body }),
      invalidatesTags: ['Records'],
    }),
  }),
  tagTypes: ['Records'],
})

export const { useGetRecordsQuery, useCreateRecordMutation } = api
