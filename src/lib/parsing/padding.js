import Length from '../Length';

export const PADDING_SIDES = {
  TOP: 0,
  RIGHT: 1,
  BOTTOM: 2,
  LEFT: 3,
};

const SIDES = ['top', 'right', 'bottom', 'left'];

export const parsePadding = (style) =>
  SIDES.map((side) => new Length(style.getPropertyValue(`padding-${side}`)));
