export function toNumber(value: any, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value.replace(/[$,]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? fallback : parsed;
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  return fallback;
}

export function money(value: any, fallback: number = 0): string {
  const n = toNumber(value, fallback);
  return n.toFixed(2);
}

export function int(value: any, fallback: number = 0): string {
  const n = toNumber(value, fallback);
  return Math.round(n).toString();
}

export function safeFixed(value: any, digits: number = 2, fallback: number = 0): string {
  const n = toNumber(value, fallback);
  return n.toFixed(digits);
}

export function formatCurrency(value: any, fallback: number = 0): string {
  const n = toNumber(value, fallback);
  return `$${n.toFixed(2)}`;
}

export function formatPercent(value: any, digits: number = 1, fallback: number = 0): string {
  const n = toNumber(value, fallback);
  return `${n.toFixed(digits)}%`;
}
