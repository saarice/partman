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
    // Simple URL validation using regex
    const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
    return urlPattern.test(url);
  } catch {
    return false;
  }
};

export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};