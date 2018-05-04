/* eslint-disable
import/prefer-default-export
*/
const parseFontWeight = (weight) => {
  switch (weight) {
    case 'normal':
      return 400;
    case 'bold':
      return 700;
    default:
  }

  const value = parseInt(weight, 10);
  return isNaN(value) ? 400 : value;
};

export const parseFont = (style) => {
  const { fontFamily, fontSize, fontStyle, fontVariant } = style;
  const fontWeight = parseFontWeight(style.fontWeight);

  return {
    fontFamily,
    fontSize,
    fontStyle,
    fontVariant,
    fontWeight,
  };
};
