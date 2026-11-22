const allowedPhoneCharacters = /^\+?[\d\s()-]+$/;

export function isValidPhoneNumber(value: string) {
  const phone = value.trim();
  if (!allowedPhoneCharacters.test(phone)) return false;

  const digits = phone.replace(/\D/g, '');
  if (phone.startsWith('+')) return /^[1-9]\d{9,14}$/.test(digits);
  if (digits.startsWith('00')) return /^00[1-9]\d{9,14}$/.test(digits);

  return /^0\d{8,10}$/.test(digits);
}
