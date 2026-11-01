const validatePayment = (data) => {
  const errors = [];
  if (!data.member) errors.push('Member ID is required');
  if (!data.membershipPlan) errors.push('Membership plan ID is required');
  if (data.amount === undefined || data.amount === null || isNaN(data.amount) || Number(data.amount) < 0) {
    errors.push('Valid positive payment amount is required');
  }
  if (!data.paymentMethod || !['cash', 'upi', 'card', 'bank_transfer'].includes(data.paymentMethod)) {
    errors.push('Payment method must be cash, upi, card, or bank_transfer');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validatePayment,
};
