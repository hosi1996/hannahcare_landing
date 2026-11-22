const allowedPhoneCharacters = /^\+?[\d\s()-]+$/;

export function isValidUaePhone(value: string) {
  const phone = value.trim();
  if (!allowedPhoneCharacters.test(phone)) return false;

  const digits = phone.replace(/\D/g, '');
  const local = phone.startsWith('+')
    ? digits.startsWith('971') ? digits.slice(3) : ''
    : digits.startsWith('00971')
      ? digits.slice(5)
      : digits.startsWith('971')
        ? digits.slice(3)
        : digits.startsWith('0')
          ? digits.slice(1)
          : '';

  return /^(?:5\d{8}|[2-9]\d{7})$/.test(local);
}
