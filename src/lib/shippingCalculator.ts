export interface ShippingRate {
  cost: number;
  estimatedDays: string;
  method: string;
  isFree: boolean;
}

export const CANADIAN_PROVINCES = [
  { code: 'ON', name: 'Ontario' },
  { code: 'QC', name: 'Quebec' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'AB', name: 'Alberta' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'YT', name: 'Yukon' },
  { code: 'NU', name: 'Nunavut' },
];

const BASE_SHIPPING_COST = 25.0;
const QUEBEC_SHIPPING_COST = 20.0;
const FREE_SHIPPING_THRESHOLD = 300;

const DELIVERY_TIMES: Record<string, string> = {
  ON: '2-4',
  QC: '2-4',
  NS: '3-5',
  NB: '3-5',
  PE: '3-5',
  NL: '4-6',
  MB: '3-5',
  SK: '3-5',
  AB: '3-5',
  BC: '4-6',
  NT: '5-10',
  YT: '5-10',
  NU: '7-14',
};

export function calculateShipping(
  vialCount: number,
  province: string,
  orderTotal: number
): ShippingRate {
  if (orderTotal >= FREE_SHIPPING_THRESHOLD) {
    return {
      cost: 0,
      estimatedDays: DELIVERY_TIMES[province] || '2-5',
      method: 'Free Shipping in Canada (Orders over $300)',
      isFree: true,
    };
  }

  const shippingCost = province === 'QC' ? QUEBEC_SHIPPING_COST : BASE_SHIPPING_COST;

  return {
    cost: shippingCost,
    estimatedDays: DELIVERY_TIMES[province] || '2-5',
    method: 'Canada Post Tracked Shipping',
    isFree: false,
  };
}

export function calculateInternationalShipping(vialCount: number): ShippingRate {
  const internationalRate = 20.0;
  const weightSurcharge = vialCount > 10 ? 15.0 : 0;
  const totalCost = BASE_SHIPPING_COST + internationalRate + weightSurcharge;

  return {
    cost: totalCost,
    estimatedDays: '10-21',
    method: 'International Tracked Shipping',
    isFree: false,
  };
}

export function getShippingInfo(
  vialCount: number,
  province: string,
  orderTotal: number,
  isInternational: boolean = false
): ShippingRate {
  if (isInternational) {
    return calculateInternationalShipping(vialCount);
  }

  return calculateShipping(vialCount, province, orderTotal);
}
