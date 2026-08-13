export function normalizeIndianPhone(value: unknown) {
  if (typeof value !== 'string') return null;

  const digits = value.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '');
  return /^[6-9]\d{9}$/.test(digits) ? `91${digits}` : null;
}
