export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString) => {
  if (!dateString) return '--:--';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '--:--';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getDaysRemaining = (expiryDate) => {
  if (!expiryDate) return null;
  const d = new Date(expiryDate);
  if (isNaN(d.getTime())) return null;
  const diff = d - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getBMICategory = (bmi) => {
  if (!bmi || isNaN(parseFloat(bmi))) {
    return { label: 'N/A', color: 'text-zinc-600 dark:text-zinc-400', bg: 'bg-zinc-100 dark:bg-white/[0.06]' };
  }
  const val = parseFloat(bmi);
  if (val < 18.5) return { label: 'Underweight', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-500/10' };
  if (val < 25) return { label: 'Normal Weight', color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-50 dark:bg-indigo-500/10' };
  if (val < 30) return { label: 'Overweight', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-500/10' };
  return { label: 'Obese', color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-500/10' };
};
