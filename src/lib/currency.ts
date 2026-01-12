export function formatCurrency(value: number, lang: string = 'fr-CA'): string {
  const locale = lang === 'fr-CA' ? 'fr-CA' : 'en-CA';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
