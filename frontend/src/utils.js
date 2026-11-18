export const CURRENCY = "KSH. ";

// 1500 -> "Ksh. 1,500.00"
export function formatPrice(value) {
  const number = Number(value) || 0;
  return `${CURRENCY} ${number.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// The API sends a plain array today, but if pagination is switched on later
// it sends { results: [...] }. This handles both.
export function asList(data) {
  if (Array.isArray(data)) return data;
  return data?.results ?? [];
}
