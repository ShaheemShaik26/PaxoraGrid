/**
 * PaxoraGrid - Federated Early-Warning and Redistribution Layer for India's PHC Network
 * Core Type Definitions
 */

export type DrugCategory = 'ANTIPYRETIC' | 'REHYDRATION' | 'ANTIBIOTIC' | 'ANTIMALARIAL' | 'VACCINE' | 'MATERNAL' | 'NCD' | 'PEDIATRIC';

export interface Drug {
  id: string;
  name: string;
  genericName: string;
  category: DrugCategory;
  dosageForm: string;
  unit: string;
  criticalThresholdDays: number; // Alert if Days of Cover (DOC) < this
  requiresColdChain: boolean;
  idealTemperatureRange?: string; // e.g. "2°C to 8°C"
  standardBatchSize: number;
  unitCostINR: number;
  description: string;
}

export type FacilityType = 'PHC' | 'CHC' | 'SUB_CENTRE' | 'DISTRICT_WAREHOUSE';

export type StateId = 
  | 'ALL'
  | 'ANDHRA_PRADESH'
  | 'ARUNACHAL_PRADESH'
  | 'ASSAM'
  | 'BIHAR'
  | 'CHHATTISGARH'
  | 'GOA'
  | 'GUJARAT'
  | 'HARYANA'
  | 'HIMACHAL_PRADESH'
  | 'JHARKHAND'
  | 'KARNATAKA'
  | 'KERALA'
  | 'MADHYA_PRADESH'
  | 'MAHARASHTRA'
  | 'MANIPUR'
  | 'MEGHALAYA'
  | 'MIZORAM'
  | 'NAGALAND'
  | 'ODISHA'
  | 'PUNJAB'
  | 'RAJASTHAN'
  | 'SIKKIM'
  | 'TAMIL_NADU'
  | 'TELANGANA'
  | 'TRIPURA'
  | 'UTTAR_PRADESH'
  | 'UTTARAKHAND'
  | 'WEST_BENGAL'
  | 'ANDAMAN_NICOBAR'
  | 'CHANDIGARH'
  | 'DADRA_NAGAR_HAVELI_DAMAN_DIU'
  | 'DELHI'
  | 'JAMMU_KASHMIR'
  | 'LADAKH'
  | 'LAKSHADWEEP'
  | 'PUDUCHERRY';

export interface StateMetadata {
  id: StateId;
  name: string;
  type: 'STATE' | 'UT';
  capital: string;
  lat: number;
  lng: number;
  drugCorporation: string;
  facilitiesCount: number;
}

export interface PHCFacility {
  id: string;
  name: string;
  facilityCode: string;
  type: FacilityType;
  state: StateId;
  district: string;
  block: string;
  lat: number;
  lng: number;
  populationCovered: number;
  totalBeds: number;
  occupiedBeds: number;
  totalStaff: number;
  presentStaff: number;
  hasColdChainEquipment: boolean;
  connectivityStatus: 'ONLINE' | 'SMS_FALLBACK' | 'OFFLINE_CACHED';
  lastReportedTimestamp: string;
  isSilent: boolean; // Not reported in >48 hrs
  dataQualityIssues: string[];
}

export interface InventoryItem {
  id: string;
  phcId: string;
  drugId: string;
  currentStock: number;
  consumptionLast7Days: number;
  dailyAvgConsumption: number;
  daysOfCover: number;
  batchNumber: string;
  expiryDate: string; // YYYY-MM-DD
  monthsToExpiry: number;
  stockoutRisk7d: number; // 0 to 100%
  stockoutRisk14d: number;
  stockoutRisk30d: number;
  forecastNext7d: number;
  forecastNext14d: number;
  predictionIntervalLower7d: number;
  predictionIntervalUpper7d: number;
}

export type TransferStatus = 'PROPOSED' | 'APPROVED' | 'MODIFIED' | 'DISPATCHED' | 'REJECTED';
export type TransportMode = 'REFRIGERATED_VAN' | 'NHM_LOGISTICS_BIKE' | 'DISTRICT_4WD' | 'RURAL_DRONE';

export interface TransferRecommendation {
  id: string;
  drugId: string;
  sourcePhcId: string;
  targetPhcId: string;
  quantity: number;
  modifiedQuantity?: number;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  reason: string;
  distanceKm: number;
  estimatedHours: number;
  transportMode: TransportMode;
  coldChainMaintained: boolean;
  donorMonthsToExpiry: number;
  stockoutsAvertedPatientCount: number;
  status: TransferStatus;
  approvedAt?: string;
  approvedBy?: string;
  challanNumber?: string;
}

export type OutbreakType = 'DENGUE_SURGE' | 'CHOLERA_DIARRHEA' | 'MALARIA_POST_MONSOON' | 'HEATWAVE_EXHAUSTION';

export interface OutbreakEvent {
  id: string;
  title: string;
  type: OutbreakType;
  state: StateId;
  districts: string[];
  affectedDrugIds: string[];
  demandMultiplier: number;
  description: string;
  detectionSource: 'FEDERATED_TRANSFER_LEARNING' | 'SYNDROMIC_IHIP' | 'IDSP_SYNDROMIC_SURVEILLANCE';
  confidenceScore: number;
  active: boolean;
  daysAdvanceNotice: number;
}

export interface FederatedClientNode {
  stateId: StateId;
  name: string;
  healthMissionName: string;
  phcCount: number;
  localRecordsProcessed: number;
  localWAPE: number;
  gradientUploadSizeKB: number;
  privacyEpsilon: number; // Differential privacy parameter
  status: 'READY' | 'TRAINING_LOCAL' | 'UPLOADING_WEIGHTS' | 'SYNCED';
  lastContributionTimestamp: string;
}

export interface FederatedLearningMetrics {
  currentRound: number;
  maxRounds: number;
  status: 'IDLE' | 'LOCAL_TRAINING' | 'SECURE_AGGREGATION' | 'MODEL_BROADCAST';
  globalWAPE: number;
  localOnlyBaselineWAPE: number;
  centralizedIdealWAPE: number;
  privacyGuarantee: string;
  totalTransferredBytesKB: number;
  crossStateLearnedKnowledge: {
    originState: string;
    benefitingState: string;
    insight: string;
    errorReductionPercent: number;
  }[];
  weightHistory: {
    round: number;
    wape: number;
    loss: number;
  }[];
}

export interface QuickReportEntry {
  phcId: string;
  drugQuantities: Record<string, number>;
  bedsOccupied: number;
  staffPresent: number;
  timestamp: string;
  reportedVia: 'APP_OFFLINE' | 'WHATSAPP_BOT' | 'SMS_GATEWAY' | 'API_SYNC';
  isFlaggedForAudit?: boolean;
  auditNotes?: string;
}
