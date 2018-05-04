import Color from '../Color';

export const parseBackground = (style) => {
  return {
    backgroundColor: new Color(style.backgroundColor),
  };
};
