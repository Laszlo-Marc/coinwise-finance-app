export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(Math.max(percentage, 0), 100);
}

export function formatCurrency(
  amount: number,
  currency = "RON",
  locale = "ro-RO"
): string {
  if (typeof amount !== "number" || isNaN(amount)) return "";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
