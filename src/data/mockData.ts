import { Drug, PHCFacility, InventoryItem, OutbreakEvent, FederatedClientNode, FederatedLearningMetrics, TransferRecommendation } from '../types';

export const ESSENTIAL_DRUGS: Drug[] = [
  {
    id: 'DRUG-01',
    name: 'Paracetamol 500mg',
    genericName: 'Paracetamol Tablet IP 500 mg',
    category: 'ANTIPYRETIC',
    dosageForm: 'Tablets (Blister of 10)',
    unit: 'Tablets',
    criticalThresholdDays: 7,
    requiresColdChain: false,
    standardBatchSize: 1000,
    unitCostINR: 0.85,
    description: 'First-line antipyretic & analgesic for viral fevers, dengue and chikungunya symptomatic care.'
  },
  {
    id: 'DRUG-02',
    name: 'Oral Rehydration Salts (ORS)',
    genericName: 'Oral Rehydration Salts IP (WHO Low Osmolarity)',
    category: 'REHYDRATION',
    dosageForm: '21.8g Sachet for 1 Litre',
    unit: 'Sachets',
    criticalThresholdDays: 10,
    requiresColdChain: false,
    standardBatchSize: 500,
    unitCostINR: 5.20,
    description: 'Life-saving oral rehydration formulation for acute diarrhoeal diseases & heatstroke.'
  },
  {
    id: 'DRUG-03',
    name: 'IV Normal Saline 0.9%',
    genericName: 'Sodium Chloride Injection IP 0.9% w/v 500ml',
    category: 'REHYDRATION',
    dosageForm: '500ml Polyethylene FFS Bottle',
    unit: 'Bottles',
    criticalThresholdDays: 7,
    requiresColdChain: false,
    standardBatchSize: 200,
    unitCostINR: 19.50,
    description: 'Crucial fluid replacement in Dengue shock syndrome, severe gastroenteritis, and trauma.'
  },
  {
    id: 'DRUG-04',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate Capsule IP 500 mg',
    category: 'ANTIBIOTIC',
    dosageForm: 'Capsule (Strip of 10)',
    unit: 'Capsules',
    criticalThresholdDays: 8,
    requiresColdChain: false,
    standardBatchSize: 500,
    unitCostINR: 2.40,
    description: 'Broad spectrum beta-lactam for bacterial respiratory tract and ENT infections.'
  },
  {
    id: 'DRUG-05',
    name: 'Artemether-Lumefantrine (ACT)',
    genericName: 'Artemether 80mg + Lumefantrine 480mg Tablets',
    category: 'ANTIMALARIAL',
    dosageForm: 'Tablet Strip (6 tablets/course)',
    unit: 'Treatment Courses',
    criticalThresholdDays: 12,
    requiresColdChain: false,
    standardBatchSize: 100,
    unitCostINR: 48.00,
    description: 'First-line Artemisinin Combination Therapy for acute Plasmodium falciparum malaria.'
  },
  {
    id: 'DRUG-06',
    name: 'Anti-Rabies Vaccine (ARV)',
    genericName: 'Purified Chick Embryo Cell / Vero Cell Rabies Vaccine 2.5 IU',
    category: 'VACCINE',
    dosageForm: 'Vial with 1ml Diluent',
    unit: 'Vials',
    criticalThresholdDays: 14,
    requiresColdChain: true,
    idealTemperatureRange: '2°C to 8°C (Strict Cold Chain)',
    standardBatchSize: 50,
    unitCostINR: 320.00,
    description: 'Zero-tolerance emergency post-exposure rabies prophylaxis. Temperature-sensitive.'
  },
  {
    id: 'DRUG-07',
    name: 'Oxytocin Injection 10 IU',
    genericName: 'Oxytocin Injection IP 10 IU/ml',
    category: 'MATERNAL',
    dosageForm: '1ml Glass Ampoule',
    unit: 'Ampoules',
    criticalThresholdDays: 14,
    requiresColdChain: true,
    idealTemperatureRange: '2°C to 8°C (Strict Cold Chain)',
    standardBatchSize: 100,
    unitCostINR: 18.00,
    description: 'Prevention and control of Post-Partum Haemorrhage (PPH) during institutional deliveries.'
  },
  {
    id: 'DRUG-08',
    name: 'Metformin 500mg',
    genericName: 'Metformin Hydrochloride Tablets IP 500 mg',
    category: 'NCD',
    dosageForm: 'Tablet (Blister of 10)',
    unit: 'Tablets',
    criticalThresholdDays: 14,
    requiresColdChain: false,
    standardBatchSize: 1000,
    unitCostINR: 0.95,
    description: 'Essential chronic management tablet for Type 2 Diabetes Mellitus under NPCDCS.'
  },
  {
    id: 'DRUG-09',
    name: 'Iron & Folic Acid (IFA)',
    genericName: 'Iron and Folic Acid Tablets IP (Large, 100mg elemental Iron)',
    category: 'MATERNAL',
    dosageForm: 'Sugar-coated red tablet',
    unit: 'Tablets',
    criticalThresholdDays: 14,
    requiresColdChain: false,
    standardBatchSize: 2000,
    unitCostINR: 0.40,
    description: 'Anemia Mukt Bharat program staple for pregnant mothers and adolescent girls.'
  },
  {
    id: 'DRUG-10',
    name: 'Zinc Sulphate 20mg Dispersible',
    genericName: 'Zinc Sulphate Dispersible Tablets USP 20 mg',
    category: 'PEDIATRIC',
    dosageForm: 'Dispersible Tablet',
    unit: 'Tablets',
    criticalThresholdDays: 10,
    requiresColdChain: false,
    standardBatchSize: 500,
    unitCostINR: 1.10,
    description: 'Coadjuvant therapy with ORS for pediatric diarrhoeal episodes to reduce recurrence.'
  }
];

export const INITIAL_FACILITIES: PHCFacility[] = [
  // --- KERALA (State A - Wayanad & Kozhikode) ---
  {
    id: 'PHC-KRL-01',
    name: 'Meppadi 24x7 PHC',
    facilityCode: 'KRL-WYND-MEP-01',
    type: 'PHC',
    state: 'KERALA',
    district: 'Wayanad',
    block: 'Vythiri Block',
    lat: 11.5542,
    lng: 76.1265,
    populationCovered: 28400,
    totalBeds: 12,
    occupiedBeds: 11, // High occupancy due to viral fever
    totalStaff: 8,
    presentStaff: 7,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '25 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-KRL-02',
    name: 'Chundale Model PHC',
    facilityCode: 'KRL-WYND-CHU-02',
    type: 'PHC',
    state: 'KERALA',
    district: 'Wayanad',
    block: 'Vythiri Block',
    lat: 11.5973,
    lng: 76.0592,
    populationCovered: 19500,
    totalBeds: 8,
    occupiedBeds: 7,
    totalStaff: 6,
    presentStaff: 5,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '42 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-KRL-03',
    name: 'Mananthavady Tribal PHC',
    facilityCode: 'KRL-WYND-MAN-03',
    type: 'PHC',
    state: 'KERALA',
    district: 'Wayanad',
    block: 'Mananthavady Block',
    lat: 11.8025,
    lng: 76.0034,
    populationCovered: 34200,
    totalBeds: 14,
    occupiedBeds: 13,
    totalStaff: 9,
    presentStaff: 8,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '10 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-KRL-04',
    name: 'Sulthan Bathery CHC & First Referral',
    facilityCode: 'KRL-WYND-SB-04',
    type: 'CHC',
    state: 'KERALA',
    district: 'Wayanad',
    block: 'Sulthan Bathery Block',
    lat: 11.6628,
    lng: 76.2570,
    populationCovered: 62000,
    totalBeds: 30,
    occupiedBeds: 16, // Healthy buffer
    totalStaff: 18,
    presentStaff: 17,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '5 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-KRL-05',
    name: 'Kalpetta District Drug Warehouse (KMSCL)',
    facilityCode: 'KRL-WYND-DWH-00',
    type: 'DISTRICT_WAREHOUSE',
    state: 'KERALA',
    district: 'Wayanad',
    block: 'District HQ',
    lat: 11.6103,
    lng: 76.0829,
    populationCovered: 185000,
    totalBeds: 0,
    occupiedBeds: 0,
    totalStaff: 12,
    presentStaff: 12,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: 'Just now',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-KRL-06',
    name: 'Thiruvambady PHC',
    facilityCode: 'KRL-KOZ-THI-06',
    type: 'PHC',
    state: 'KERALA',
    district: 'Kozhikode',
    block: 'Koduvally Block',
    lat: 11.3934,
    lng: 76.0125,
    populationCovered: 24000,
    totalBeds: 10,
    occupiedBeds: 4,
    totalStaff: 7,
    presentStaff: 6,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '1 hour ago',
    isSilent: false,
    dataQualityIssues: []
  },

  // --- ODISHA (State B - Koraput & Puri) ---
  {
    id: 'PHC-ODS-01',
    name: 'Jeypore Sub-Divisional CHC',
    facilityCode: 'ODS-KRP-JEY-01',
    type: 'CHC',
    state: 'ODISHA',
    district: 'Koraput',
    block: 'Jeypore Block',
    lat: 18.8687,
    lng: 82.5684,
    populationCovered: 74000,
    totalBeds: 35,
    occupiedBeds: 21,
    totalStaff: 22,
    presentStaff: 19,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '15 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-ODS-02',
    name: 'Kotpad Tribal PHC',
    facilityCode: 'ODS-KRP-KOT-02',
    type: 'PHC',
    state: 'ODISHA',
    district: 'Koraput',
    block: 'Kotpad Block',
    lat: 19.1415,
    lng: 82.3275,
    populationCovered: 26000,
    totalBeds: 10,
    occupiedBeds: 8,
    totalStaff: 6,
    presentStaff: 5,
    hasColdChainEquipment: false,
    connectivityStatus: 'SMS_FALLBACK',
    lastReportedTimestamp: '3 hours ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-ODS-03',
    name: 'Sunabeda Sector 2 PHC',
    facilityCode: 'ODS-KRP-SUN-03',
    type: 'PHC',
    state: 'ODISHA',
    district: 'Koraput',
    block: 'Semiliguda Block',
    lat: 18.7238,
    lng: 82.8122,
    populationCovered: 31000,
    totalBeds: 12,
    occupiedBeds: 5,
    totalStaff: 8,
    presentStaff: 8,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '45 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-ODS-04',
    name: 'Pipili Coastal PHC',
    facilityCode: 'ODS-PRI-PIP-04',
    type: 'PHC',
    state: 'ODISHA',
    district: 'Puri',
    block: 'Pipili Block',
    lat: 20.1187,
    lng: 85.8344,
    populationCovered: 38000,
    totalBeds: 16,
    occupiedBeds: 9,
    totalStaff: 11,
    presentStaff: 10,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '30 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-ODS-05',
    name: 'Koraput OSMCL Central Warehouse',
    facilityCode: 'ODS-KRP-OSMCL-00',
    type: 'DISTRICT_WAREHOUSE',
    state: 'ODISHA',
    district: 'Koraput',
    block: 'Koraput Sadar',
    lat: 18.8126,
    lng: 82.7108,
    populationCovered: 240000,
    totalBeds: 0,
    occupiedBeds: 0,
    totalStaff: 14,
    presentStaff: 13,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: 'Just now',
    isSilent: false,
    dataQualityIssues: []
  },

  // --- BIHAR (State C - Muzaffarpur & Vaishali) ---
  {
    id: 'PHC-BHR-01',
    name: 'Kanti Community Health Centre',
    facilityCode: 'BHR-MUZ-KAN-01',
    type: 'CHC',
    state: 'BIHAR',
    district: 'Muzaffarpur',
    block: 'Kanti Block',
    lat: 26.2084,
    lng: 85.2931,
    populationCovered: 89000,
    totalBeds: 30,
    occupiedBeds: 28, // Floods & pediatric gastroenteritis
    totalStaff: 20,
    presentStaff: 16,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '2 hours ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-BHR-02',
    name: 'Motipur Rural PHC',
    facilityCode: 'BHR-MUZ-MOT-02',
    type: 'PHC',
    state: 'BIHAR',
    district: 'Muzaffarpur',
    block: 'Motipur Block',
    lat: 26.2847,
    lng: 85.1856,
    populationCovered: 45000,
    totalBeds: 12,
    occupiedBeds: 12, // 100% capacity
    totalStaff: 8,
    presentStaff: 7,
    hasColdChainEquipment: false,
    connectivityStatus: 'OFFLINE_CACHED',
    lastReportedTimestamp: '49 hours ago',
    isSilent: true, // Flagged for silent PHC
    dataQualityIssues: ['Silent PHC: No upload in >48h; queued locally']
  },
  {
    id: 'PHC-BHR-03',
    name: 'Lalganj Primary Health Centre',
    facilityCode: 'BHR-VAI-LAL-03',
    type: 'PHC',
    state: 'BIHAR',
    district: 'Vaishali',
    block: 'Lalganj Block',
    lat: 25.8672,
    lng: 85.1764,
    populationCovered: 52000,
    totalBeds: 14,
    occupiedBeds: 10,
    totalStaff: 9,
    presentStaff: 8,
    hasColdChainEquipment: true,
    connectivityStatus: 'SMS_FALLBACK',
    lastReportedTimestamp: '1 hour ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-BHR-04',
    name: 'Muzaffarpur BMSICL Regional Depot',
    facilityCode: 'BHR-MUZ-BMSICL-00',
    type: 'DISTRICT_WAREHOUSE',
    state: 'BIHAR',
    district: 'Muzaffarpur',
    block: 'Muzaffarpur Sadar',
    lat: 26.1209,
    lng: 85.3647,
    populationCovered: 380000,
    totalBeds: 0,
    occupiedBeds: 0,
    totalStaff: 16,
    presentStaff: 15,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: 'Just now',
    isSilent: false,
    dataQualityIssues: []
  },

  // --- TAMIL NADU (TNMSC) ---
  {
    id: 'PHC-TND-01',
    name: 'Gudalur Taluk Hospital & CHC',
    facilityCode: 'TND-NIL-GUD-01',
    type: 'CHC',
    state: 'TAMIL_NADU',
    district: 'Nilgiris',
    block: 'Gudalur',
    lat: 11.5034,
    lng: 76.4925,
    populationCovered: 65000,
    totalBeds: 60,
    occupiedBeds: 48,
    totalStaff: 24,
    presentStaff: 21,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '15 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-TND-02',
    name: 'Ooty Model Primary Health Centre',
    facilityCode: 'TND-NIL-OOT-02',
    type: 'PHC',
    state: 'TAMIL_NADU',
    district: 'Nilgiris',
    block: 'Udhagamandalam',
    lat: 11.4102,
    lng: 76.6950,
    populationCovered: 24000,
    totalBeds: 12,
    occupiedBeds: 9,
    totalStaff: 8,
    presentStaff: 8,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '35 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-TND-03',
    name: 'Coimbatore TNMSC District Warehouse',
    facilityCode: 'TND-CBE-TNMSC-00',
    type: 'DISTRICT_WAREHOUSE',
    state: 'TAMIL_NADU',
    district: 'Coimbatore',
    block: 'Urban',
    lat: 11.0168,
    lng: 76.9558,
    populationCovered: 520000,
    totalBeds: 0,
    occupiedBeds: 0,
    totalStaff: 20,
    presentStaff: 19,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: 'Just now',
    isSilent: false,
    dataQualityIssues: []
  },

  // --- KARNATAKA (KSMSCL) ---
  {
    id: 'PHC-KAR-01',
    name: 'Gundlupet Community Health Centre',
    facilityCode: 'KAR-CHA-GUN-01',
    type: 'CHC',
    state: 'KARNATAKA',
    district: 'Chamarajanagar',
    block: 'Gundlupet',
    lat: 11.8084,
    lng: 76.6908,
    populationCovered: 54000,
    totalBeds: 50,
    occupiedBeds: 34,
    totalStaff: 18,
    presentStaff: 16,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '20 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-KAR-02',
    name: 'Mysuru Regional KSMSCL Warehouse',
    facilityCode: 'KAR-MYS-KSMSCL-00',
    type: 'DISTRICT_WAREHOUSE',
    state: 'KARNATAKA',
    district: 'Mysuru',
    block: 'Industrial Area',
    lat: 12.2958,
    lng: 76.6394,
    populationCovered: 480000,
    totalBeds: 0,
    occupiedBeds: 0,
    totalStaff: 18,
    presentStaff: 17,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: 'Just now',
    isSilent: false,
    dataQualityIssues: []
  },

  // --- MAHARASHTRA (HBPCL) ---
  {
    id: 'PHC-MAH-01',
    name: 'Dahanu Sub-District Hospital',
    facilityCode: 'MAH-PAL-DAH-01',
    type: 'CHC',
    state: 'MAHARASHTRA',
    district: 'Palghar',
    block: 'Dahanu',
    lat: 19.9703,
    lng: 72.7300,
    populationCovered: 88000,
    totalBeds: 100,
    occupiedBeds: 82,
    totalStaff: 32,
    presentStaff: 29,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '10 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-MAH-02',
    name: 'Thane Central Medical Store',
    facilityCode: 'MAH-THA-CMS-00',
    type: 'DISTRICT_WAREHOUSE',
    state: 'MAHARASHTRA',
    district: 'Thane',
    block: 'Wagle Estate',
    lat: 19.2183,
    lng: 72.9781,
    populationCovered: 620000,
    totalBeds: 0,
    occupiedBeds: 0,
    totalStaff: 22,
    presentStaff: 21,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: 'Just now',
    isSilent: false,
    dataQualityIssues: []
  },

  // --- RAJASTHAN (RMSCL) ---
  {
    id: 'PHC-RAJ-01',
    name: 'Kotputli Community Health Centre',
    facilityCode: 'RAJ-JAI-KOT-01',
    type: 'CHC',
    state: 'RAJASTHAN',
    district: 'Jaipur Rural',
    block: 'Kotputli',
    lat: 27.7025,
    lng: 76.2008,
    populationCovered: 72000,
    totalBeds: 75,
    occupiedBeds: 56,
    totalStaff: 26,
    presentStaff: 24,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '30 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-RAJ-02',
    name: 'Jaipur Central Medical Store Depot',
    facilityCode: 'RAJ-JAI-RMSCL-00',
    type: 'DISTRICT_WAREHOUSE',
    state: 'RAJASTHAN',
    district: 'Jaipur',
    block: 'Sanganer',
    lat: 26.9124,
    lng: 75.7873,
    populationCovered: 580000,
    totalBeds: 0,
    occupiedBeds: 0,
    totalStaff: 25,
    presentStaff: 23,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: 'Just now',
    isSilent: false,
    dataQualityIssues: []
  },

  // --- UTTAR PRADESH (UPMSCL) ---
  {
    id: 'PHC-UPR-01',
    name: 'Malihabad Community Health Centre',
    facilityCode: 'UPR-LUK-MAL-01',
    type: 'CHC',
    state: 'UTTAR_PRADESH',
    district: 'Lucknow',
    block: 'Malihabad',
    lat: 26.9200,
    lng: 80.7100,
    populationCovered: 85000,
    totalBeds: 60,
    occupiedBeds: 49,
    totalStaff: 22,
    presentStaff: 19,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '20 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-UPR-02',
    name: 'Lucknow Regional UPMSCL Warehouse',
    facilityCode: 'UPR-LUK-UPMSCL-00',
    type: 'DISTRICT_WAREHOUSE',
    state: 'UTTAR_PRADESH',
    district: 'Lucknow',
    block: 'Transport Nagar',
    lat: 26.8500,
    lng: 80.9200,
    populationCovered: 750000,
    totalBeds: 0,
    occupiedBeds: 0,
    totalStaff: 28,
    presentStaff: 26,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: 'Just now',
    isSilent: false,
    dataQualityIssues: []
  },

  // --- WEST BENGAL (WBMSCL) ---
  {
    id: 'PHC-WBG-01',
    name: 'Baruipur Sub-Divisional Hospital',
    facilityCode: 'WBG-S24-BAR-01',
    type: 'CHC',
    state: 'WEST_BENGAL',
    district: 'South 24 Parganas',
    block: 'Baruipur',
    lat: 22.3654,
    lng: 88.4325,
    populationCovered: 95000,
    totalBeds: 80,
    occupiedBeds: 71,
    totalStaff: 30,
    presentStaff: 28,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '40 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-WBG-02',
    name: 'Kolkata Central Medical Stores',
    facilityCode: 'WBG-KOL-WBMSCL-00',
    type: 'DISTRICT_WAREHOUSE',
    state: 'WEST_BENGAL',
    district: 'Kolkata',
    block: 'Hastings',
    lat: 22.5726,
    lng: 88.3639,
    populationCovered: 890000,
    totalBeds: 0,
    occupiedBeds: 0,
    totalStaff: 32,
    presentStaff: 30,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: 'Just now',
    isSilent: false,
    dataQualityIssues: []
  },

  // --- DELHI (CPA) ---
  {
    id: 'PHC-DEL-01',
    name: 'Alipur Poly Clinic & CHC',
    facilityCode: 'DEL-NDL-ALI-01',
    type: 'CHC',
    state: 'DELHI',
    district: 'North Delhi',
    block: 'Alipur',
    lat: 28.7981,
    lng: 77.1325,
    populationCovered: 60000,
    totalBeds: 50,
    occupiedBeds: 42,
    totalStaff: 20,
    presentStaff: 18,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: '15 mins ago',
    isSilent: false,
    dataQualityIssues: []
  },
  {
    id: 'PHC-DEL-02',
    name: 'Central Procurement Agency Depot',
    facilityCode: 'DEL-CDL-CPA-00',
    type: 'DISTRICT_WAREHOUSE',
    state: 'DELHI',
    district: 'Central Delhi',
    block: 'Daryaganj',
    lat: 28.6469,
    lng: 77.2410,
    populationCovered: 650000,
    totalBeds: 0,
    occupiedBeds: 0,
    totalStaff: 24,
    presentStaff: 23,
    hasColdChainEquipment: true,
    connectivityStatus: 'ONLINE',
    lastReportedTimestamp: 'Just now',
    isSilent: false,
    dataQualityIssues: []
  }
];

// Initial inventory state across all PHCs and drugs
export function generateInitialInventory(facilities: PHCFacility[], drugs: Drug[]): InventoryItem[] {
  const items: InventoryItem[] = [];

  for (const facility of facilities) {
    for (const drug of drugs) {
      // Create baseline consumption tailored to facility type
      const isWarehouse = facility.type === 'DISTRICT_WAREHOUSE';
      const isCHC = facility.type === 'CHC';
      
      let baseDaily = isWarehouse ? 350 : isCHC ? 65 : 24;
      if (drug.id === 'DRUG-01') baseDaily *= 1.8; // Paracetamol high volume
      if (drug.id === 'DRUG-02') baseDaily *= 1.4; // ORS
      if (drug.id === 'DRUG-06' || drug.id === 'DRUG-07') baseDaily *= 0.25; // Cold chain specific

      // Specific conditions for Demo Storyline:
      // State A (Wayanad PHC 01 & 02) will face imminent Dengue surge & Paracetamol/IV Saline depletion
      let currentStock = Math.round(baseDaily * 18);
      let expiryMonths = 14;

      if (facility.id === 'PHC-KRL-01') {
        if (drug.id === 'DRUG-01') {
          // Paracetamol critical!
          currentStock = 120; // Only ~2.8 days of cover!
          expiryMonths = 8;
        } else if (drug.id === 'DRUG-03') {
          // IV Saline critical!
          currentStock = 18; // Only 2.2 days!
          expiryMonths = 11;
        }
      } else if (facility.id === 'PHC-KRL-02') {
        if (drug.id === 'DRUG-01') {
          currentStock = 190; // ~4.1 days cover
        } else if (drug.id === 'DRUG-03') {
          currentStock = 28; // ~3.5 days cover
        }
      } else if (facility.id === 'PHC-KRL-04') {
        // Sulthan Bathery CHC has surplus Paracetamol & IV fluids, but shelf life is 3 months! (FEFO candidate!)
        if (drug.id === 'DRUG-01') {
          currentStock = 3800; // 38 days cover!
          expiryMonths = 3.5; // Expiring soon! Must redistribute to avoid expiry wastage
        } else if (drug.id === 'DRUG-03') {
          currentStock = 450; // 25 days cover
          expiryMonths = 4.0;
        }
      } else if (facility.id === 'PHC-KRL-05') {
        // Warehouse has deep safety reserves
        if (drug.id === 'DRUG-01') currentStock = 24000;
        if (drug.id === 'DRUG-03') currentStock = 3200;
      } else if (facility.id === 'PHC-BHR-01') {
        // Bihar CHC has severe ORS & Zinc depletion due to flood diarrhea
        if (drug.id === 'DRUG-02') currentStock = 210; // ~2.2 days
        if (drug.id === 'DRUG-10') currentStock = 140; // ~3 days
      } else if (facility.id === 'PHC-ODS-01') {
        // Odisha CHC has abundant ACT & Paracetamol thanks to robust monsoon pre-positioning
        if (drug.id === 'DRUG-05') {
          currentStock = 780;
          expiryMonths = 6.0;
        }
      }

      const dailyAvg = Math.max(1, Math.round(baseDaily));
      const past7d = dailyAvg * 7;
      const daysOfCover = Math.round((currentStock / dailyAvg) * 10) / 10;

      // Forecast next 7 & 14 days
      const forecast7d = Math.round(dailyAvg * 7 * 1.15);
      const forecast14d = Math.round(dailyAvg * 14 * 1.22);

      // Stockout risk percentages
      let risk7 = 0;
      let risk14 = 0;
      let risk30 = 0;

      if (daysOfCover < 4) {
        risk7 = 94;
        risk14 = 99;
        risk30 = 100;
      } else if (daysOfCover < 7) {
        risk7 = 68;
        risk14 = 92;
        risk30 = 98;
      } else if (daysOfCover < 14) {
        risk7 = 18;
        risk14 = 62;
        risk30 = 85;
      } else if (daysOfCover < 21) {
        risk7 = 3;
        risk14 = 22;
        risk30 = 48;
      } else {
        risk7 = 0;
        risk14 = 4;
        risk30 = 12;
      }

      items.push({
        id: `INV-${facility.id}-${drug.id}`,
        phcId: facility.id,
        drugId: drug.id,
        currentStock,
        consumptionLast7Days: past7d,
        dailyAvgConsumption: dailyAvg,
        daysOfCover,
        batchNumber: `BAT-2026-${drug.id.slice(-2)}-${Math.floor(100 + Math.random() * 900)}`,
        expiryDate: new Date(Date.now() + expiryMonths * 30 * 86400000).toISOString().split('T')[0],
        monthsToExpiry: expiryMonths,
        stockoutRisk7d: risk7,
        stockoutRisk14d: risk14,
        stockoutRisk30d: risk30,
        forecastNext7d: forecast7d,
        forecastNext14d: forecast14d,
        predictionIntervalLower7d: Math.round(forecast7d * 0.82),
        predictionIntervalUpper7d: Math.round(forecast7d * 1.34)
      });
    }
  }

  return items;
}

export const INITIAL_OUTBREAKS: OutbreakEvent[] = [
  {
    id: 'OUTBREAK-DENGUE-01',
    title: 'Pre-Monsoon Dengue & Aedes Vector Surge',
    type: 'DENGUE_SURGE',
    state: 'KERALA',
    districts: ['Wayanad', 'Kozhikode'],
    affectedDrugIds: ['DRUG-01', 'DRUG-03'], // Paracetamol & IV Saline
    demandMultiplier: 2.8,
    description: 'Syndromic surveillance detected a 3.4x spike in platelet count requests and biphasic febrile illness. Federated prior weights borrowed from Odisha vector cycles warned of 9-day impending stockout.',
    detectionSource: 'FEDERATED_TRANSFER_LEARNING',
    confidenceScore: 94.6,
    active: true,
    daysAdvanceNotice: 9
  },
  {
    id: 'OUTBREAK-CHOLERA-02',
    title: 'Post-Inundation Acute Diarrheal Surge',
    type: 'CHOLERA_DIARRHEA',
    state: 'BIHAR',
    districts: ['Muzaffarpur', 'Vaishali'],
    affectedDrugIds: ['DRUG-02', 'DRUG-10'], // ORS & Zinc
    demandMultiplier: 3.1,
    description: 'River Gandak overflow caused water table cross-contamination in Kanti and Motipur blocks. Immediate demand for pediatric ORS & Zinc projected to overwhelm local sub-centres.',
    detectionSource: 'IDSP_SYNDROMIC_SURVEILLANCE',
    confidenceScore: 88.2,
    active: true,
    daysAdvanceNotice: 6
  }
];

export const INITIAL_FEDERATED_NODES: FederatedClientNode[] = [
  {
    stateId: 'KERALA',
    name: 'Kerala State Health Node',
    healthMissionName: 'Arogyakeralam (National Health Mission - Kerala)',
    phcCount: 942,
    localRecordsProcessed: 142850,
    localWAPE: 18.2,
    gradientUploadSizeKB: 142.4,
    privacyEpsilon: 1.2,
    status: 'SYNCED',
    lastContributionTimestamp: '12m ago'
  },
  {
    stateId: 'ODISHA',
    name: 'Odisha State Health Node',
    healthMissionName: 'Odisha State Medical Corporation Ltd (OSMCL)',
    phcCount: 1240,
    localRecordsProcessed: 289400,
    localWAPE: 16.4,
    gradientUploadSizeKB: 142.4,
    privacyEpsilon: 1.2,
    status: 'SYNCED',
    lastContributionTimestamp: '12m ago'
  },
  {
    stateId: 'BIHAR',
    name: 'Bihar State Health Node',
    healthMissionName: 'Bihar Medical Services & Infrastructure Corp (BMSICL)',
    phcCount: 1880,
    localRecordsProcessed: 312000,
    localWAPE: 22.8,
    gradientUploadSizeKB: 142.4,
    privacyEpsilon: 1.2,
    status: 'SYNCED',
    lastContributionTimestamp: '12m ago'
  }
];

export const INITIAL_FL_METRICS: FederatedLearningMetrics = {
  currentRound: 14,
  maxRounds: 25,
  status: 'IDLE',
  globalWAPE: 14.8,
  localOnlyBaselineWAPE: 38.6,
  centralizedIdealWAPE: 14.1,
  privacyGuarantee: 'Differential Privacy (ε=1.2, δ=1e-5), Zero Raw Data Transfer',
  totalTransferredBytesKB: 3987,
  crossStateLearnedKnowledge: [
    {
      originState: 'Odisha (OSMCL)',
      benefitingState: 'Kerala (NHM)',
      insight: 'Aedes mosquito post-shower lag weights transferred; Wayanad PHCs detected early febrile surge 9 days before conventional e-Aushadhi thresholds.',
      errorReductionPercent: 24.2
    },
    {
      originState: 'Bihar (BMSICL)',
      benefitingState: 'Odisha (OSMCL)',
      insight: 'Monsoon diarrhoeal epidemic curves fine-tuned coastal Puri block ORS consumption forecasting during sudden rainfall anomalies.',
      errorReductionPercent: 19.5
    },
    {
      originState: 'Kerala (NHM)',
      benefitingState: 'Bihar (BMSICL)',
      insight: 'Geriatric NCD (Metformin / Amlodipine) continuous adherence regression model adapted to North Bihar CHCs.',
      errorReductionPercent: 17.8
    }
  ],
  weightHistory: [
    { round: 10, wape: 21.4, loss: 0.384 },
    { round: 11, wape: 19.1, loss: 0.312 },
    { round: 12, wape: 17.0, loss: 0.264 },
    { round: 13, wape: 15.6, loss: 0.221 },
    { round: 14, wape: 14.8, loss: 0.198 }
  ]
};

export const INITIAL_TRANSFER_RECOMMENDATIONS: TransferRecommendation[] = [
  {
    id: 'REC-2026-001',
    drugId: 'DRUG-01', // Paracetamol 500mg
    sourcePhcId: 'PHC-KRL-04', // Sulthan Bathery CHC (Surplus & 3.5 mo expiry)
    targetPhcId: 'PHC-KRL-01', // Meppadi PHC (Critical 2.8 days cover)
    quantity: 1800,
    urgency: 'CRITICAL',
    reason: 'Move 1,800 Paracetamol tablets from Sulthan Bathery CHC (38 days cover, batch expiring in 3.5 months) to Meppadi PHC (2.8 days cover left during dengue surge). Averts imminent stock-out and saves stock from expiry wastage.',
    distanceKm: 27.4,
    estimatedHours: 1.1,
    transportMode: 'DISTRICT_4WD',
    coldChainMaintained: false,
    donorMonthsToExpiry: 3.5,
    stockoutsAvertedPatientCount: 360,
    status: 'PROPOSED'
  },
  {
    id: 'REC-2026-002',
    drugId: 'DRUG-03', // IV Normal Saline
    sourcePhcId: 'PHC-KRL-05', // Kalpetta District Warehouse (Deep reserve)
    targetPhcId: 'PHC-KRL-01', // Meppadi PHC
    quantity: 150,
    urgency: 'CRITICAL',
    reason: 'Dispatch 150 bottles of IV Normal Saline from Kalpetta Warehouse (12 km, 45 mins) to prevent IV fluid exhaustion in Meppadi PHC inpatient emergency bay.',
    distanceKm: 12.2,
    estimatedHours: 0.75,
    transportMode: 'DISTRICT_4WD',
    coldChainMaintained: false,
    donorMonthsToExpiry: 18.0,
    stockoutsAvertedPatientCount: 75,
    status: 'PROPOSED'
  },
  {
    id: 'REC-2026-003',
    drugId: 'DRUG-01', // Paracetamol 500mg
    sourcePhcId: 'PHC-KRL-04', // Sulthan Bathery CHC
    targetPhcId: 'PHC-KRL-02', // Chundale Model PHC
    quantity: 1200,
    urgency: 'HIGH',
    reason: 'Transfer 1,200 Paracetamol tablets from Sulthan Bathery to Chundale Model PHC (4.1 days cover remaining). Balances block-level buffer and utilizes batch with 3.5 months shelf-life remaining.',
    distanceKm: 29.8,
    estimatedHours: 1.2,
    transportMode: 'NHM_LOGISTICS_BIKE',
    coldChainMaintained: false,
    donorMonthsToExpiry: 3.5,
    stockoutsAvertedPatientCount: 240,
    status: 'PROPOSED'
  },
  {
    id: 'REC-2026-004',
    drugId: 'DRUG-06', // Anti-Rabies Vaccine (Strict Cold Chain!)
    sourcePhcId: 'PHC-KRL-05', // Kalpetta District Warehouse
    targetPhcId: 'PHC-KRL-03', // Mananthavady Tribal PHC
    quantity: 25,
    urgency: 'HIGH',
    reason: 'Urgent cold-chain dispatch of 25 ARV vials via ILR-equipped refrigerated van to Mananthavady Tribal PHC. Post-exposure stock dropped below 4 days buffer.',
    distanceKm: 34.0,
    estimatedHours: 1.4,
    transportMode: 'REFRIGERATED_VAN',
    coldChainMaintained: true,
    donorMonthsToExpiry: 12.0,
    stockoutsAvertedPatientCount: 25,
    status: 'PROPOSED'
  },
  {
    id: 'REC-2026-005',
    drugId: 'DRUG-02', // ORS Sachets
    sourcePhcId: 'PHC-BHR-04', // Muzaffarpur BMSICL Depot
    targetPhcId: 'PHC-BHR-01', // Kanti CHC (Flood Diarrhea)
    quantity: 2500,
    urgency: 'CRITICAL',
    reason: 'Transfer 2,500 WHO ORS sachets from Muzaffarpur Regional Depot to Kanti CHC facing acute gastroenteritis influx. Prevents catastrophic stockout in 48 hours.',
    distanceKm: 18.5,
    estimatedHours: 0.9,
    transportMode: 'DISTRICT_4WD',
    coldChainMaintained: false,
    donorMonthsToExpiry: 16.0,
    stockoutsAvertedPatientCount: 620,
    status: 'PROPOSED'
  }
];
