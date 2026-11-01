const validateMember = (data, isUpdate = false) => {
  const errors = [];
  if (!isUpdate && (!data.name || data.name.trim().length === 0)) {
    errors.push('Member name is required');
  }
  if (!isUpdate && (!data.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email))) {
    errors.push('Valid email is required');
  }
  if (data.phone && !/^[0-9+() -]{7,20}$/.test(data.phone)) {
    errors.push('Invalid phone number format');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateMember,
};
