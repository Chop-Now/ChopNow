// Impact numbers are estimates, so they are shown rounded and described as
// "about" - never to a false precision. Under 10 keeps one decimal; above
// that whole numbers are plenty.
export const formatImpactNumber = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '0';
  if (n < 10) {
    return (Math.round(n * 10) / 10).toLocaleString(undefined, { maximumFractionDigits: 1 });
  }
  return Math.round(n).toLocaleString();
};

export const formatImpactKg = (value) => `${formatImpactNumber(value)} kg`;
