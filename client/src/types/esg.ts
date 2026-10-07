export type EsgPillarType = 'environmental' | 'social' | 'governance'

export interface EsgDisclosureItem {
  id: string
  pillar: EsgPillarType
  code: string // e.g. BRSR P6 / GRI 305-1
  title: string
  category: string
  baselineValue: string
  currentValue: string
  change: string
  isImprovement: boolean
  unit: string
  auditProof: string
  status: 'Verified' | 'Compliant' | 'Audited'
}

export interface AuditRecord {
  id: string
  timestamp: string
  metric: string
  sourceDocument: string
  emissionFactor: string
  sourceSystem: string
  verifiedBy: string
  hash: string
}

export interface FrameworkInfo {
  id: string
  name: string
  fullName: string
  regulatoryBody: string
  mandateType: string
  complianceScore: number
  primaryStandard: string
  description: string
}

export interface IngestionPipeline {
  id: string
  name: string
  type: string
  recordsSynced: number
  lastSync: string
  status: 'Connected' | 'Active' | 'Syncing'
}

export interface GeneratedReport {
  id: string
  framework: string
  year: number
  entity: string
  scope: string
  generatedAt: string
  totalScope1: string
  totalScope2: string
  totalScope3: string
  totalEmissions: string
  renewableShare: string
  auditScore: string
  verificationHash: string
}
