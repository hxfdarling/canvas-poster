import Color from '../Color';

export const BACKGROUND_CLIP = {
  BORDER_BOX: 0,
  PADDING_BOX: 1,
  CONTENT_BOX: 2,
};
export const parseBackground = (style) => {
  return {
    backgroundColor: new Color(style.backgroundColor),
  };
};
export const calculateBackgroungPaintingArea = (curves, clip) => {
  switch (clip) {
    case BACKGROUND_CLIP.BORDER_BOX:
      return calculateBorderBoxPath(curves);
    case BACKGROUND_CLIP.PADDING_BOX:
    default:
      return calculatePaddingBoxPath(curves);
  }
};

export const calculateBorderBoxPath = (curves) => [
  curves.topLeftOuter,
  curves.topRightOuter,
  curves.bottomRightOuter,
  curves.bottomLeftOuter,
];

export const calculatePaddingBoxPath = (curves) => [
  curves.topLeftInner,
  curves.topRightInner,
  curves.bottomRightInner,
  curves.bottomLeftInner,
];
