export const CHART_COLORS = [
  '#6366F1', // Indigo (Primary brand)
  '#0EA5E9', // Sky Blue
  '#F59E0B', // Amber
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#F97316', // Orange
];

export const getChartTooltipProps = (isDark) => ({
  contentStyle: {
    backgroundColor: isDark ? '#18181b' : '#ffffff',
    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : '#e4e4e7',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderRadius: '12px',
    boxShadow: isDark
      ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
      : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)',
    color: isDark ? '#f4f4f5' : '#18181b',
    fontSize: '12px',
    padding: '8px 12px',
  },
  itemStyle: {
    color: isDark ? '#f4f4f5' : '#18181b',
    fontSize: '12px',
    fontWeight: 500,
  },
  labelStyle: {
    color: isDark ? '#a1a1aa' : '#71717a',
    fontWeight: 600,
    marginBottom: '2px',
    fontSize: '12px',
  },
  cursor: {
    stroke: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    strokeWidth: 1,
    fill: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
  },
});
