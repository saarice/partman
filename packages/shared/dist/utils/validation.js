export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
export const isValidPercentage = (value, min = 0, max = 100) => {
    return value >= min && value <= max;
};
export const isValidDealValue = (value) => {
    return value > 0 && value <= 10000000; // Max $10M
};
export const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
};
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
};
export const sanitizeString = (input) => {
    return input.trim().replace(/[<>]/g, '');
};
//# sourceMappingURL=validation.js.map