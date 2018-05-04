export const LINE_BREAK = {
  NORMAL: 'normal',
  STRICT: 'strict',
};

export const parseLineBreak = (wordBreak) => {
  switch (wordBreak) {
    case 'strict':
      return LINE_BREAK.STRICT;
    case 'normal':
    default:
      return LINE_BREAK.NORMAL;
  }
};
