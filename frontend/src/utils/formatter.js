/**
 * Centralized Currency Formatter for Indian Rupees (₹)
 * Formats numbers into Indian Numbering System (e.g. 1,00,000 instead of 100,000)
 */
export const formatCurrency = (val) => {
  if (val === undefined || val === null || isNaN(parseFloat(val))) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(val);
};
