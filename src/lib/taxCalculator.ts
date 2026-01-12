export interface TaxBreakdown {
  gst: number;
  pst: number;
  hst: number;
  qst: number;
  total: number;
  rate: number;
  label: string;
}

const PROVINCIAL_TAX_RATES: Record<string, { rate: number; label: string; breakdown: { gst?: number; pst?: number; hst?: number; qst?: number } }> = {
  'AB': { rate: 0.05, label: 'GST', breakdown: { gst: 0.05 } },
  'BC': { rate: 0.12, label: 'GST + PST', breakdown: { gst: 0.05, pst: 0.07 } },
  'MB': { rate: 0.12, label: 'GST + PST', breakdown: { gst: 0.05, pst: 0.07 } },
  'NB': { rate: 0.15, label: 'HST', breakdown: { hst: 0.15 } },
  'NL': { rate: 0.15, label: 'HST', breakdown: { hst: 0.15 } },
  'NT': { rate: 0.05, label: 'GST', breakdown: { gst: 0.05 } },
  'NS': { rate: 0.15, label: 'HST', breakdown: { hst: 0.15 } },
  'NU': { rate: 0.05, label: 'GST', breakdown: { gst: 0.05 } },
  'ON': { rate: 0.13, label: 'HST', breakdown: { hst: 0.13 } },
  'PE': { rate: 0.15, label: 'HST', breakdown: { hst: 0.15 } },
  'QC': { rate: 0.14975, label: 'GST + QST', breakdown: { gst: 0.05, qst: 0.09975 } },
  'SK': { rate: 0.11, label: 'GST + PST', breakdown: { gst: 0.05, pst: 0.06 } },
  'YT': { rate: 0.05, label: 'GST', breakdown: { gst: 0.05 } },
};

const DEFAULT_TAX_RATE = { rate: 0.13, label: 'Estimated Taxes (HST)', breakdown: { hst: 0.13 } };

export function calculateTax(subtotal: number, province?: string): TaxBreakdown {
  const taxInfo = province && PROVINCIAL_TAX_RATES[province]
    ? PROVINCIAL_TAX_RATES[province]
    : DEFAULT_TAX_RATE;

  const taxAmount = subtotal * taxInfo.rate;

  return {
    gst: ('gst' in taxInfo.breakdown ? (taxInfo.breakdown.gst || 0) : 0) * subtotal,
    pst: ('pst' in taxInfo.breakdown ? (taxInfo.breakdown.pst || 0) : 0) * subtotal,
    hst: ('hst' in taxInfo.breakdown ? (taxInfo.breakdown.hst || 0) : 0) * subtotal,
    qst: ('qst' in taxInfo.breakdown ? (taxInfo.breakdown.qst || 0) : 0) * subtotal,
    total: taxAmount,
    rate: taxInfo.rate,
    label: taxInfo.label,
  };
}

export function getTaxRate(province?: string): number {
  const taxInfo = province && PROVINCIAL_TAX_RATES[province]
    ? PROVINCIAL_TAX_RATES[province]
    : DEFAULT_TAX_RATE;
  return taxInfo.rate;
}

export function getTaxLabel(province?: string): string {
  const taxInfo = province && PROVINCIAL_TAX_RATES[province]
    ? PROVINCIAL_TAX_RATES[province]
    : DEFAULT_TAX_RATE;
  return taxInfo.label;
}
