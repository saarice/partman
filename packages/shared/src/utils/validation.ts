export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPercentage = (value: number, min = 0, max = 100): boolean => {
  return value >= min && value <= max;
};

export const isValidDealValue = (value: number): boolean => {
  return value > 0 && value <= 10000000; // Max $10M
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};