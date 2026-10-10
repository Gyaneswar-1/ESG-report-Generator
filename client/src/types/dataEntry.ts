export type DataEntryTab = 'energy' | 'water' | 'waste' | 'social' | 'other'

export interface EvidenceFile {
  name: string
  size: string
  type: string
  uploadedAt: string
  hash: string
  url?: string
}

export interface EnergyFormData {
  metric: string
  quantity: number | string
  unit: string
  evidence: EvidenceFile | null
}

export interface WaterFormData {
  metric: string
  totalWaterGenerated: number | string
  recycledWaste: number | string
  evidence: EvidenceFile | null
}

export interface WasteFormData {
  metric: string
  totalWasteGenerated: number | string
  divertedWaste: number | string
  evidence: EvidenceFile | null
}

export interface SocialFormData {
  metric: string
  value: number | string
  unit: string
  evidence: EvidenceFile | null
}

export interface OtherFormData {
  metricName: string
  category: string
  value: number | string
  unit: string
  evidence: EvidenceFile | null
}

export interface SubmissionItem {
  id: string
  site: string
  category: 'Energy' | 'Water' | 'Waste' | 'Social' | 'Other'
  metric: string
  period: string
  valueDisplay: string
  rawQuantity: number
  unit: string
  normalizedValue?: string
  evidence: EvidenceFile
  status: 'Pending' | 'Approved' | 'Rejected'
  submittedAt: string
  submittedBy: string
}

export type PortalRole = 'CSO_ADMIN' | 'SITE_ENGINEER' | 'SUBSIDIARY_HEAD' | 'AUDITOR'
