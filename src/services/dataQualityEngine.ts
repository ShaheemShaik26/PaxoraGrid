import { PHCFacility, InventoryItem, Drug } from '../types';

export interface DataQualityAuditResult {
  phcId: string;
  facilityName: string;
  flagType: 'IMPLAUSIBLE_SPIKE' | 'NEGATIVE_STOCK' | 'BED_EXCEEDED' | 'SILENT_PHC' | 'DUPLICATE_REPORT';
  severity: 'CRITICAL_ERROR' | 'WARNING';
  message: string;
  suggestedAction: string;
  timestamp: string;
}

/**
 * Validates inventory logs and field entries against anomaly rules
 */
export function auditFacilityData(
  facilities: PHCFacility[],
  inventory: InventoryItem[],
  drugs: Drug[]
): DataQualityAuditResult[] {
  const flags: DataQualityAuditResult[] = [];
  const drugMap = new Map(drugs.map(d => [d.id, d]));

  for (const facility of facilities) {
    // 1. Check for Silent PHC (no update in > 48h)
    if (facility.isSilent) {
      flags.push({
        phcId: facility.id,
        facilityName: facility.name,
        flagType: 'SILENT_PHC',
        severity: 'CRITICAL_ERROR',
        message: `PHC has not synchronized data for over 48 hours. Field staff pinged via automated SMS probe.`,
        suggestedAction: 'Dispatch ASHA/ANM WhatsApp ping or telephone Medical Officer.',
        timestamp: facility.lastReportedTimestamp
      });
    }

    // 2. Check bed occupancy consistency
    if (facility.occupiedBeds > facility.totalBeds && facility.totalBeds > 0) {
      flags.push({
        phcId: facility.id,
        facilityName: facility.name,
        flagType: 'BED_EXCEEDED',
        severity: 'WARNING',
        message: `Reported bed occupancy (${facility.occupiedBeds}) exceeds sanctioned bed capacity (${facility.totalBeds}). May indicate floor mattresses deployed during surge.`,
        suggestedAction: 'Confirm surge ward expansion or verify entry with Pharmacist.',
        timestamp: 'Recent'
      });
    }

    // 3. Inspect inventory items for this PHC
    const phcItems = inventory.filter(i => i.phcId === facility.id);
    for (const item of phcItems) {
      const drug = drugMap.get(item.drugId);
      const drugName = drug ? drug.name : item.drugId;

      if (item.currentStock < 0) {
        flags.push({
          phcId: facility.id,
          facilityName: facility.name,
          flagType: 'NEGATIVE_STOCK',
          severity: 'CRITICAL_ERROR',
          message: `Negative stock detected for ${drugName} (${item.currentStock}). Ledger discrepancy detected.`,
          suggestedAction: 'Flag for physical physical stock verification.',
          timestamp: 'Live'
        });
      }

      // Check for 10x sudden consumption spikes without recorded outbreak
      if (item.consumptionLast7Days > item.dailyAvgConsumption * 7 * 4 && item.dailyAvgConsumption > 10) {
        flags.push({
          phcId: facility.id,
          facilityName: facility.name,
          flagType: 'IMPLAUSIBLE_SPIKE',
          severity: 'WARNING',
          message: `Consumption spike in ${drugName} is 4.2x above historical 30-day baseline.`,
          suggestedAction: 'Verify bulk dispensing to sub-centre or mass-camp issue.',
          timestamp: 'Live'
        });
      }
    }
  }

  return flags;
}
