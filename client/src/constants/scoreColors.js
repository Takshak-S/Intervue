// ============================================
// scoreColors.js - Score Color Utility
// ============================================

// Returns a color from the Ocean Blue palette based on score value
// Reference: color-palettes.md (Ocean Blue status colors)
const getScoreColor = (score) => {
  if (score === null || score === undefined) return '#94a3b8';
  if (score >= 70) return '#16a34a'; // Green
  if (score >= 40) return '#d97706'; // Amber
  return '#dc2626'; // Red
};

export default getScoreColor;
