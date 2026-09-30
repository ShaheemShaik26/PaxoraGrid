import { Drug } from '../types';

export interface ParsedFieldReport {
  success: boolean;
  rawText: string;
  extractedStocks: { drugId: string; drugName: string; quantity: number }[];
  occupiedBeds?: number;
  totalBeds?: number;
  presentStaff?: number;
  confidenceScore: number;
  validationWarnings: string[];
  feedbackMessage: string;
}

export function parseSmsOrWhatsappText(rawText: string, drugs: Drug[]): ParsedFieldReport {
  const text = rawText.trim().toLowerCase();
  const extractedStocks: { drugId: string; drugName: string; quantity: number }[] = [];
  const validationWarnings: string[] = [];

  // Drug keyword mapping for flexible matching (English + Hindi transliterations)
  const drugAliases: { [key: string]: string } = {
    'para': 'DRUG-01',
    'pcm': 'DRUG-01',
    'paracetamol': 'DRUG-01',
    'पैरा': 'DRUG-01',
    'पैरासिटामोल': 'DRUG-01',
    'ors': 'DRUG-02',
    'sachet': 'DRUG-02',
    'ओआरएस': 'DRUG-02',
    'saline': 'DRUG-03',
    'iv': 'DRUG-03',
    'ns': 'DRUG-03',
    'आईवी': 'DRUG-03',
    'सेलाइन': 'DRUG-03',
    'amox': 'DRUG-04',
    'amoxicillin': 'DRUG-04',
    'mox': 'DRUG-04',
    'act': 'DRUG-05',
    'malaria': 'DRUG-05',
    'artemether': 'DRUG-05',
    'arv': 'DRUG-06',
    'rabies': 'DRUG-06',
    'oxy': 'DRUG-07',
    'oxytocin': 'DRUG-07',
    'met': 'DRUG-08',
    'metformin': 'DRUG-08',
    'ifa': 'DRUG-09',
    'iron': 'DRUG-09',
    'zinc': 'DRUG-10'
  };

  const drugMap = new Map(drugs.map(d => [d.id, d]));

  // Match bed occupancy e.g. "beds 8/10", "bed 8", "बेड 6"
  let occupiedBeds: number | undefined;
  let totalBeds: number | undefined;
  const bedRatioMatch = text.match(/(?:bed|beds|बेड)\s*[:=]?\s*(\d+)\s*\/\s*(\d+)/i);
  if (bedRatioMatch) {
    occupiedBeds = parseInt(bedRatioMatch[1], 10);
    totalBeds = parseInt(bedRatioMatch[2], 10);
  } else {
    const singleBedMatch = text.match(/(?:bed|beds|बेड)\s*[:=]?\s*(\d+)/i);
    if (singleBedMatch) {
      occupiedBeds = parseInt(singleBedMatch[1], 10);
    }
  }

  // Match staff e.g. "staff 6", "कर्मचारी 5"
  let presentStaff: number | undefined;
  const staffMatch = text.match(/(?:staff|attendance|कर्मचारी)\s*[:=]?\s*(\d+)/i);
  if (staffMatch) {
    presentStaff = parseInt(staffMatch[1], 10);
  }

  // Match drug items: word followed by number or number followed by word
  for (const [alias, drugId] of Object.entries(drugAliases)) {
    // Pattern 1: "para 350" or "para: 350"
    const regex1 = new RegExp(`(?:^|\\b)${alias}\\s*[:=]?\\s*(\\d+)`, 'i');
    // Pattern 2: "350 para"
    const regex2 = new RegExp(`(\\d+)\\s*(?:strips|tabs|bottles|vials|pkts)?\\s*${alias}\\b`, 'i');

    const match1 = text.match(regex1);
    const match2 = text.match(regex2);

    const qty = match1 ? parseInt(match1[1], 10) : match2 ? parseInt(match2[1], 10) : null;

    if (qty !== null && !extractedStocks.some(s => s.drugId === drugId)) {
      const drug = drugMap.get(drugId);
      if (drug) {
        extractedStocks.push({
          drugId,
          drugName: drug.name,
          quantity: qty
        });
      }
    }
  }

  const success = extractedStocks.length > 0 || occupiedBeds !== undefined || presentStaff !== undefined;

  let feedbackMessage = '';
  if (success) {
    const itemsList = extractedStocks.map(s => `${s.drugName}: ${s.quantity}`).join(', ');
    feedbackMessage = `Parsed ${extractedStocks.length} stock line(s)${itemsList ? ` [${itemsList}]` : ''}${occupiedBeds !== undefined ? `, Beds Occupied: ${occupiedBeds}` : ''}${presentStaff !== undefined ? `, Staff Present: ${presentStaff}` : ''}.`;
  } else {
    feedbackMessage = 'Could not parse entries. Example: "PARA 350 ORS 80 SALINE 30 BEDS 8/10 STAFF 5"';
  }

  return {
    success,
    rawText,
    extractedStocks,
    occupiedBeds,
    totalBeds,
    presentStaff,
    confidenceScore: success ? Math.min(98, 60 + extractedStocks.length * 10) : 0,
    validationWarnings,
    feedbackMessage
  };
}
