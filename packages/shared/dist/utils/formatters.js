export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};
export const formatPercentage = (value, decimals = 1) => {
    return `${(value * 100).toFixed(decimals)}%`;
};
export const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
};
export const formatCompactNumber = (value) => {
    return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(value);
};
export const formatUserName = (firstName, lastName) => {
    return `${firstName} ${lastName}`;
};
export const formatInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};
//# sourceMappingURL=formatters.js.map