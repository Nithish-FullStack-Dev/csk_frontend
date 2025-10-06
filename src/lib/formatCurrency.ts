export function formatIndianCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIndianCurrencyShort(amount: number): string {
  if (amount >= 10000000) {
    // 1 crore or more
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    // 1 lakh or more
    return `₹${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    // 1 thousand or more
    return `₹${(amount / 1000).toFixed(1)}K`;
  } else {
    return `₹${amount}`;
  }
}
