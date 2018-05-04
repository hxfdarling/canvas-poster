import Color from '../Color';

export const TEXT_DECORATION_STYLE = {
  SOLID: 0,
  DOUBLE: 1,
  DOTTED: 2,
  DASHED: 3,
  WAVY: 4,
};

export const TEXT_DECORATION = {
  NONE: null,
};

export const TEXT_DECORATION_LINE = {
  UNDERLINE: 1,
  OVERLINE: 2,
  LINE_THROUGH: 3,
  BLINK: 4,
};

const parseLine = (line) => {
  switch (line) {
    case 'underline':
      return TEXT_DECORATION_LINE.UNDERLINE;
    case 'overline':
      return TEXT_DECORATION_LINE.OVERLINE;
    case 'line-through':
      return TEXT_DECORATION_LINE.LINE_THROUGH;
    default:
      return TEXT_DECORATION_LINE.BLINK;
  }
};

const parseTextDecorationLine = (line) => {
  if (line === 'none') {
    return null;
  }

  return line.split(' ').map(parseLine);
};

const parseTextDecorationStyle = (style) => {
  switch (style) {
    case 'double':
      return TEXT_DECORATION_STYLE.DOUBLE;
    case 'dotted':
      return TEXT_DECORATION_STYLE.DOTTED;
    case 'dashed':
      return TEXT_DECORATION_STYLE.DASHED;
    case 'wavy':
      return TEXT_DECORATION_STYLE.WAVY;
    default:
      return TEXT_DECORATION_STYLE.SOLID;
  }
};

export const parseTextDecoration = (style) => {
  const textDecorationLine = parseTextDecorationLine(
    style.textDecorationLine ? style.textDecorationLine : style.textDecoration
  );
  if (textDecorationLine === null) {
    return TEXT_DECORATION.NONE;
  }

  const textDecorationColor = style.textDecorationColor
    ? new Color(style.textDecorationColor)
    : null;
  const textDecorationStyle = parseTextDecorationStyle(
    style.textDecorationStyle
  );

  return {
    textDecorationLine,
    textDecorationColor,
    textDecorationStyle,
  };
};
