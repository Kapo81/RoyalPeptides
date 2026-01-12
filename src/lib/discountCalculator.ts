export interface DiscountInfo {
  percentage: number;
  amount: number;
  threshold: number;
  applied: boolean;
}

export function calculateDiscount(subtotal: number): DiscountInfo {
  if (subtotal >= 500) {
    return {
      percentage: 15,
      amount: subtotal * 0.15,
      threshold: 500,
      applied: true
    };
  } else if (subtotal >= 300) {
    return {
      percentage: 10,
      amount: subtotal * 0.10,
      threshold: 300,
      applied: true
    };
  }

  return {
    percentage: 0,
    amount: 0,
    threshold: 0,
    applied: false
  };
}

export function calculateFinalTotal(subtotal: number, shippingCost: number): {
  subtotal: number;
  discount: DiscountInfo;
  shippingCost: number;
  total: number;
} {
  const discount = calculateDiscount(subtotal);
  const discountedSubtotal = subtotal - discount.amount;
  const total = discountedSubtotal + shippingCost;

  return {
    subtotal,
    discount,
    shippingCost,
    total
  };
}
