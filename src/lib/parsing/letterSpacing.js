export const parseLetterSpacing = (letterSpacing) => {
  if (letterSpacing === 'normal') {
    return 0;
  }
  const value = parseFloat(letterSpacing);
  return isNaN(value) ? 0 : value;
};
