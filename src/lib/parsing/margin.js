import Length from '../Length';

const SIDES = ['top', 'right', 'bottom', 'left'];

export const parseMargin = (style) =>
  SIDES.map((side) => new Length(style.getPropertyValue(`margin-${side}`)));
