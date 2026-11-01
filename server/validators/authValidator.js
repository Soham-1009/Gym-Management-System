const validateRegister = (data) => {
  const errors = [];
  if (!data.name || data.name.trim().length === 0) errors.push('Name is required');
  if (!data.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) errors.push('A valid email is required');
  if (!data.password || data.password.length < 6) errors.push('Password must be at least 6 characters');
  if (data.role && !['admin', 'trainer', 'member'].includes(data.role)) errors.push('Role must be admin, trainer, or member');
  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateLogin = (data) => {
  const errors = [];
  if (!data.email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.email)) errors.push('Valid email is required');
  if (!data.password) errors.push('Password is required');
  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateRegister,
  validateLogin,
};
