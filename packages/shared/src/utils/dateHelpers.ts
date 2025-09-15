export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
  const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
  return date >= weekStart && date <= weekEnd;
};

export const daysUntil = (date: Date): number => {
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatRelativeDate = (date: Date): string => {
  const days = daysUntil(date);

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  if (days > 0) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
};

export const getWeekStart = (date: Date): Date => {
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

export const getQuarterStart = (date: Date): Date => {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3, 1);
};

export const getQuarterEnd = (date: Date): Date => {
  const quarter = Math.floor(date.getMonth() / 3);
  return new Date(date.getFullYear(), quarter * 3 + 3, 0);
};