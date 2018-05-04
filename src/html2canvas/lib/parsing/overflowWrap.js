/* @flow */

export const OVERFLOW_WRAP = {
  NORMAL: 0,
  BREAK_WORD: 1,
};

export const parseOverflowWrap = (overflow) => {
  switch (overflow) {
    case 'break-word':
      return OVERFLOW_WRAP.BREAK_WORD;
    case 'normal':
    default:
      return OVERFLOW_WRAP.NORMAL;
  }
};
