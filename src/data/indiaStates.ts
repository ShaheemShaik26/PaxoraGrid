import { StateId, StateMetadata, PHCFacility } from '../types';

export const ALL_INDIA_STATES: StateMetadata[] = [
  // 28 States
  { id: 'ANDHRA_PRADESH', name: 'Andhra Pradesh', type: 'STATE', capital: 'Amaravati', lat: 15.9129, lng: 79.7400, drugCorporation: 'APMSIDC', facilitiesCount: 1420 },
  { id: 'ARUNACHAL_PRADESH', name: 'Arunachal Pradesh', type: 'STATE', capital: 'Itanagar', lat: 28.2180, lng: 94.7278, drugCorporation: 'APHSCL', facilitiesCount: 380 },
  { id: 'ASSAM', name: 'Assam', type: 'STATE', capital: 'Dispur', lat: 26.2006, lng: 92.9376, drugCorporation: 'AMSCL', facilitiesCount: 1180 },
  { id: 'BIHAR', name: 'Bihar', type: 'STATE', capital: 'Patna', lat: 25.0961, lng: 85.3131, drugCorporation: 'BMSICL', facilitiesCount: 1890 },
  { id: 'CHHATTISGARH', name: 'Chhattisgarh', type: 'STATE', capital: 'Raipur', lat: 21.2787, lng: 81.8661, drugCorporation: 'CGMSC', facilitiesCount: 840 },
  { id: 'GOA', name: 'Goa', type: 'STATE', capital: 'Panaji', lat: 15.2993, lng: 74.1240, drugCorporation: 'GSIDC', facilitiesCount: 110 },
  { id: 'GUJARAT', name: 'Gujarat', type: 'STATE', capital: 'Gandhinagar', lat: 22.2587, lng: 71.1924, drugCorporation: 'GMSCL', facilitiesCount: 1520 },
  { id: 'HARYANA', name: 'Haryana', type: 'STATE', capital: 'Chandigarh', lat: 29.0588, lng: 76.0856, drugCorporation: 'HMSCL', facilitiesCount: 560 },
  { id: 'HIMACHAL_PRADESH', name: 'Himachal Pradesh', type: 'STATE', capital: 'Shimla', lat: 31.1048, lng: 77.1734, drugCorporation: 'HPSIDC', facilitiesCount: 490 },
  { id: 'JHARKHAND', name: 'Jharkhand', type: 'STATE', capital: 'Ranchi', lat: 23.6102, lng: 85.2799, drugCorporation: 'JSMSCL', facilitiesCount: 780 },
  { id: 'KARNATAKA', name: 'Karnataka', type: 'STATE', capital: 'Bengaluru', lat: 15.3173, lng: 75.7139, drugCorporation: 'KSMSCL', facilitiesCount: 2350 },
  { id: 'KERALA', name: 'Kerala', type: 'STATE', capital: 'Thiruvananthapuram', lat: 10.8505, lng: 76.2711, drugCorporation: 'KMSCL', facilitiesCount: 1040 },
  { id: 'MADHYA_PRADESH', name: 'Madhya Pradesh', type: 'STATE', capital: 'Bhopal', lat: 22.9734, lng: 78.6569, drugCorporation: 'MPPHSCL', facilitiesCount: 2100 },
  { id: 'MAHARASHTRA', name: 'Maharashtra', type: 'STATE', capital: 'Mumbai', lat: 19.7515, lng: 75.7139, drugCorporation: 'HBPCL', facilitiesCount: 2890 },
  { id: 'MANIPUR', name: 'Manipur', type: 'STATE', capital: 'Imphal', lat: 24.6637, lng: 93.9063, drugCorporation: 'MMSCL', facilitiesCount: 160 },
  { id: 'MEGHALAYA', name: 'Meghalaya', type: 'STATE', capital: 'Shillong', lat: 25.4670, lng: 91.3662, drugCorporation: 'MMDSL', facilitiesCount: 190 },
  { id: 'MIZORAM', name: 'Mizoram', type: 'STATE', capital: 'Aizawl', lat: 23.1645, lng: 92.9376, drugCorporation: 'MZHSCL', facilitiesCount: 120 },
  { id: 'NAGALAND', name: 'Nagaland', type: 'STATE', capital: 'Kohima', lat: 26.1584, lng: 94.5624, drugCorporation: 'NHAK', facilitiesCount: 140 },
  { id: 'ODISHA', name: 'Odisha', type: 'STATE', capital: 'Bhubaneswar', lat: 20.9517, lng: 85.0985, drugCorporation: 'OSMCL', facilitiesCount: 1350 },
  { id: 'PUNJAB', name: 'Punjab', type: 'STATE', capital: 'Chandigarh', lat: 31.1471, lng: 75.3412, drugCorporation: 'PHSC', facilitiesCount: 620 },
  { id: 'RAJASTHAN', name: 'Rajasthan', type: 'STATE', capital: 'Jaipur', lat: 27.0238, lng: 74.2179, drugCorporation: 'RMSCL', facilitiesCount: 2400 },
  { id: 'SIKKIM', name: 'Sikkim', type: 'STATE', capital: 'Gangtok', lat: 27.5330, lng: 88.5122, drugCorporation: 'SHSCL', facilitiesCount: 70 },
  { id: 'TAMIL_NADU', name: 'Tamil Nadu', type: 'STATE', capital: 'Chennai', lat: 11.1271, lng: 78.6569, drugCorporation: 'TNMSC', facilitiesCount: 2280 },
  { id: 'TELANGANA', name: 'Telangana', type: 'STATE', capital: 'Hyderabad', lat: 18.1124, lng: 79.0193, drugCorporation: 'TGMSIDC', facilitiesCount: 960 },
  { id: 'TRIPURA', name: 'Tripura', type: 'STATE', capital: 'Agartala', lat: 23.9408, lng: 91.9882, drugCorporation: 'THSCL', facilitiesCount: 180 },
  { id: 'UTTAR_PRADESH', name: 'Uttar Pradesh', type: 'STATE', capital: 'Lucknow', lat: 26.8467, lng: 80.9462, drugCorporation: 'UPMSCL', facilitiesCount: 4200 },
  { id: 'UTTARAKHAND', name: 'Uttarakhand', type: 'STATE', capital: 'Dehradun', lat: 30.0668, lng: 79.0193, drugCorporation: 'UKSMSCL', facilitiesCount: 430 },
  { id: 'WEST_BENGAL', name: 'West Bengal', type: 'STATE', capital: 'Kolkata', lat: 22.9868, lng: 87.8550, drugCorporation: 'WBMSCL', facilitiesCount: 1780 },

  // 8 Union Territories
  { id: 'ANDAMAN_NICOBAR', name: 'Andaman & Nicobar Islands', type: 'UT', capital: 'Port Blair', lat: 11.7401, lng: 92.6586, drugCorporation: 'ANIHS', facilitiesCount: 65 },
  { id: 'CHANDIGARH', name: 'Chandigarh', type: 'UT', capital: 'Chandigarh', lat: 30.7333, lng: 76.7794, drugCorporation: 'CHDHS', facilitiesCount: 45 },
  { id: 'DADRA_NAGAR_HAVELI_DAMAN_DIU', name: 'Dadra & Nagar Haveli and Daman & Diu', type: 'UT', capital: 'Daman', lat: 20.4283, lng: 72.8397, drugCorporation: 'DNDHS', facilitiesCount: 38 },
  { id: 'DELHI', name: 'Delhi (NCT)', type: 'UT', capital: 'New Delhi', lat: 28.7041, lng: 77.1025, drugCorporation: 'CPA/DHS', facilitiesCount: 480 },
  { id: 'JAMMU_KASHMIR', name: 'Jammu & Kashmir', type: 'UT', capital: 'Srinagar / Jammu', lat: 33.7782, lng: 76.5762, drugCorporation: 'JKMSCL', facilitiesCount: 710 },
  { id: 'LADAKH', name: 'Ladakh', type: 'UT', capital: 'Leh', lat: 34.1526, lng: 77.5771, drugCorporation: 'LDKHS', facilitiesCount: 85 },
  { id: 'LAKSHADWEEP', name: 'Lakshadweep', type: 'UT', capital: 'Kavaratti', lat: 10.5667, lng: 72.6417, drugCorporation: 'LKHS', facilitiesCount: 22 },
  { id: 'PUDUCHERRY', name: 'Puducherry', type: 'UT', capital: 'Puducherry', lat: 11.9416, lng: 79.8083, drugCorporation: 'PDHS', facilitiesCount: 60 }
];

/**
 * Returns complete facilities directory across all 36 States & Union Territories of India.
 * Merges detailed hand-crafted facilities and creates synthetic verified nodes for all remaining states.
 */
export function getAllIndiaFacilities(baseFacilities: PHCFacility[]): PHCFacility[] {
  const existingStateSet = new Set(baseFacilities.map(f => f.state));
  const additional: PHCFacility[] = [];

  for (const stateMeta of ALL_INDIA_STATES) {
    if (existingStateSet.has(stateMeta.id)) continue;

    const cap = stateMeta.capital.split('/')[0].trim();
    const cleanStateId = stateMeta.id.replace(/[^A-Z0-9]/g, '_');

    // 1. State / Regional Drug Warehouse
    additional.push({
      id: `PHC-${cleanStateId}-WH-00`,
      name: `${cap} Central ${stateMeta.drugCorporation} Depot`,
      facilityCode: `${cleanStateId}-${cap.slice(0, 3).toUpperCase()}-WH-00`,
      type: 'DISTRICT_WAREHOUSE',
      state: stateMeta.id,
      district: cap,
      block: 'Central Medical Stores',
      lat: stateMeta.lat,
      lng: stateMeta.lng,
      populationCovered: 450000,
      totalBeds: 0,
      occupiedBeds: 0,
      totalStaff: 24,
      presentStaff: 22,
      hasColdChainEquipment: true,
      connectivityStatus: 'ONLINE',
      lastReportedTimestamp: 'Just now',
      isSilent: false,
      dataQualityIssues: []
    });

    // 2. Community Health Centre (CHC)
    additional.push({
      id: `PHC-${cleanStateId}-CHC-01`,
      name: `${cap} Regional Community Health Centre`,
      facilityCode: `${cleanStateId}-${cap.slice(0, 3).toUpperCase()}-CHC-01`,
      type: 'CHC',
      state: stateMeta.id,
      district: cap,
      block: 'North Block',
      lat: stateMeta.lat + 0.08,
      lng: stateMeta.lng + 0.06,
      populationCovered: 65000,
      totalBeds: 50,
      occupiedBeds: 38,
      totalStaff: 20,
      presentStaff: 18,
      hasColdChainEquipment: true,
      connectivityStatus: 'ONLINE',
      lastReportedTimestamp: '15 mins ago',
      isSilent: false,
      dataQualityIssues: []
    });

    // 3. Primary Health Centre (PHC)
    additional.push({
      id: `PHC-${cleanStateId}-PHC-02`,
      name: `${cap} Model 24x7 PHC`,
      facilityCode: `${cleanStateId}-${cap.slice(0, 3).toUpperCase()}-PHC-02`,
      type: 'PHC',
      state: stateMeta.id,
      district: cap,
      block: 'East Block',
      lat: stateMeta.lat - 0.07,
      lng: stateMeta.lng - 0.05,
      populationCovered: 22000,
      totalBeds: 12,
      occupiedBeds: 9,
      totalStaff: 8,
      presentStaff: 7,
      hasColdChainEquipment: true,
      connectivityStatus: 'ONLINE',
      lastReportedTimestamp: '35 mins ago',
      isSilent: false,
      dataQualityIssues: []
    });
  }

  return [...baseFacilities, ...additional];
}
