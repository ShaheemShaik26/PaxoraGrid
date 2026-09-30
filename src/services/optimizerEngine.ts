import { Drug, InventoryItem, PHCFacility, TransferRecommendation, TransportMode } from '../types';
import { ForecastResult } from './forecastingEngine';

// Haversine distance calculator in KM
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Min-Cost Flow & Multi-Objective Stock Balancing Heuristic
 */
export function generateOptimizedTransfers(
  facilities: PHCFacility[],
  drugs: Drug[],
  inventory: InventoryItem[],
  forecasts: Map<string, ForecastResult>
): TransferRecommendation[] {
  const recommendations: TransferRecommendation[] = [];
  const facilityMap = new Map(facilities.map(f => [f.id, f]));
  const drugMap = new Map(drugs.map(d => [d.id, d]));

  // Group inventory by drug
  const itemsByDrug = new Map<string, InventoryItem[]>();
  for (const item of inventory) {
    if (!itemsByDrug.has(item.drugId)) {
      itemsByDrug.set(item.drugId, []);
    }
    itemsByDrug.get(item.drugId)!.push(item);
  }

  // Iterate over each drug to match deficits with surpluses
  for (const [drugId, items] of itemsByDrug.entries()) {
    const drug = drugMap.get(drugId);
    if (!drug) continue;

    // Identify Deficit Facilities (DOC < critical threshold or high risk 7d)
    const deficits: { item: InventoryItem; facility: PHCFacility; needed: number; urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' }[] = [];
    // Identify Donor Facilities (Surplus or Warehouse)
    const donors: { item: InventoryItem; facility: PHCFacility; availableSurplus: number; monthsToExpiry: number }[] = [];

    for (const item of items) {
      const facility = facilityMap.get(item.phcId);
      const forecast = forecasts.get(`${item.phcId}-${item.drugId}`);
      if (!facility || !forecast) continue;

      if (forecast.status === 'CRITICAL' || forecast.daysOfCover < drug.criticalThresholdDays) {
        // Target 14 days of safety cover
        const targetStock = Math.round(item.dailyAvgConsumption * (forecast.isSurgeAffected ? forecast.surgeMultiplier : 1) * 14);
        const needed = Math.max(10, targetStock - item.currentStock);
        const urgency = forecast.daysOfCover <= 3 ? 'CRITICAL' : forecast.daysOfCover <= 6 ? 'HIGH' : 'MEDIUM';
        deficits.push({ item, facility, needed, urgency });
      } else if (facility.type === 'DISTRICT_WAREHOUSE' || forecast.status === 'SURPLUS' || forecast.daysOfCover > 25) {
        // Safe donor: keep at least 15 days cover for local needs
        const safeLocalBuffer = Math.round(item.dailyAvgConsumption * 15);
        const surplus = Math.max(0, item.currentStock - safeLocalBuffer);
        if (surplus > 10) {
          donors.push({
            item,
            facility,
            availableSurplus: surplus,
            monthsToExpiry: item.monthsToExpiry
          });
        }
      }
    }

    // Sort donors using First-Expired-First-Out (FEFO) + distance heuristic
    donors.sort((a, b) => {
      // Prioritize soon-to-expire batches (< 6 months)
      if (a.monthsToExpiry < 6 && b.monthsToExpiry >= 6) return -1;
      if (b.monthsToExpiry < 6 && a.monthsToExpiry >= 6) return 1;
      return a.monthsToExpiry - b.monthsToExpiry;
    });

    // Match deficits with closest feasible donor
    for (const deficit of deficits) {
      if (deficit.needed <= 0) continue;

      // Find best donor in same state or nearest district
      let bestDonorIndex = -1;
      let minScore = Infinity;

      for (let i = 0; i < donors.length; i++) {
        const donor = donors[i];
        if (donor.facility.id === deficit.facility.id) continue;
        if (donor.availableSurplus <= 0) continue;

        // If drug requires cold chain, both must support it or use refrigerated van
        if (drug.requiresColdChain && !donor.facility.hasColdChainEquipment) continue;

        const distance = calculateDistanceKm(
          donor.facility.lat,
          donor.facility.lng,
          deficit.facility.lat,
          deficit.facility.lng
        );

        // Distance penalty + same state preference + FEFO bonus
        const stateMismatchPenalty = donor.facility.state !== deficit.facility.state ? 800 : 0;
        const fefoBonus = donor.monthsToExpiry < 6 ? -150 : 0;
        const score = distance * 2 + stateMismatchPenalty + fefoBonus;

        if (score < minScore) {
          minScore = score;
          bestDonorIndex = i;
        }
      }

      if (bestDonorIndex !== -1) {
        const selectedDonor = donors[bestDonorIndex];
        const transferQty = Math.min(deficit.needed, selectedDonor.availableSurplus);
        selectedDonor.availableSurplus -= transferQty;
        deficit.needed -= transferQty;

        const distance = calculateDistanceKm(
          selectedDonor.facility.lat,
          selectedDonor.facility.lng,
          deficit.facility.lat,
          deficit.facility.lng
        );

        // Determine transport mode & ETA
        let transportMode: TransportMode = 'DISTRICT_4WD';
        if (drug.requiresColdChain) {
          transportMode = 'REFRIGERATED_VAN';
        } else if (distance < 35 && transferQty < 1500) {
          transportMode = 'NHM_LOGISTICS_BIKE';
        }

        const avgSpeedKmH = transportMode === 'NHM_LOGISTICS_BIKE' ? 32 : 38;
        const estimatedHours = Math.round((distance / avgSpeedKmH) * 10) / 10;

        // Construct plain-language reason
        let reason = '';
        if (selectedDonor.monthsToExpiry < 6) {
          reason = `Move ${transferQty.toLocaleString()} ${drug.unit.toLowerCase()} from ${selectedDonor.facility.name} (${selectedDonor.monthsToExpiry.toFixed(1)} months to expiry, batch prioritized under FEFO) to ${deficit.facility.name} (${deficit.item.daysOfCover} days of cover left). Distance ${distance} km, ETA ~${estimatedHours}h. Prevents expiry wastage while securing critical cover.`;
        } else {
          reason = `Dispatch ${transferQty.toLocaleString()} ${drug.unit.toLowerCase()} from ${selectedDonor.facility.name} to ${deficit.facility.name} (${deficit.item.daysOfCover} days of cover left). Distance ${distance} km, ETA ~${estimatedHours}h via ${transportMode.replace(/_/g, ' ')}.`;
        }

        const patientCount = Math.round(transferQty / (drug.category === 'ANTIPYRETIC' ? 5 : drug.category === 'REHYDRATION' ? 3 : 1));

        recommendations.push({
          id: `REC-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`,
          drugId: drug.id,
          sourcePhcId: selectedDonor.facility.id,
          targetPhcId: deficit.facility.id,
          quantity: transferQty,
          urgency: deficit.urgency,
          reason,
          distanceKm: distance,
          estimatedHours: Math.max(0.5, estimatedHours),
          transportMode,
          coldChainMaintained: drug.requiresColdChain,
          donorMonthsToExpiry: selectedDonor.monthsToExpiry,
          stockoutsAvertedPatientCount: patientCount,
          status: 'PROPOSED'
        });
      }
    }
  }

  return recommendations;
}
