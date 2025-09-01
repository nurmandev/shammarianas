// Utility function for merging class names
export function cn(...inputs) {
  return inputs
    .filter(Boolean)
    .map(input => {
      if (typeof input === 'string') return input;
      if (typeof input === 'object' && input !== null) {
        return Object.entries(input)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
}

// Compute final price safely given a price and optional discount percentage
// - Coerces undefined/null/empty values to 0
// - Clamps discount to [0, 100]
// - Returns a finite non-negative number
export function getFinalPrice(price, discount) {
  const p = Number(price ?? 0);
  const d = Number(discount ?? 0);

  const safePrice = Number.isFinite(p) && p > 0 ? p : p === 0 ? 0 : 0;
  const safeDiscount = Number.isFinite(d) ? Math.min(100, Math.max(0, d)) : 0;

  const final = safePrice - (safePrice * safeDiscount) / 100;
  if (!Number.isFinite(final) || final < 0) return 0;
  return final;
}

// Format a number as a price label or Free
export function formatPriceLabel(value) {
  const v = Number(value ?? 0);
  if (!Number.isFinite(v) || v <= 0) return 'Free';
  return `$${v.toFixed(2)}`;
}
