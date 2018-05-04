import Length from '../Length';

const SIDES = ['top-left', 'top-right', 'bottom-right', 'bottom-left'];

export const parseBorderRadius = (style) =>
  SIDES.map((side) => {
    const value = style.getPropertyValue(`border-${side}-radius`);
    const [horizontal, vertical] = value.split(' ').map(Length.create);
    return typeof vertical === 'undefined'
      ? [horizontal, horizontal]
      : [horizontal, vertical];
  });
