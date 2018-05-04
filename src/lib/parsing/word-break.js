export const WORD_BREAK = {
  NORMAL: 'normal',
  BREAK_ALL: 'break-all',
  KEEP_ALL: 'keep-all',
};

export const parseWordBreak = (wordBreak) => {
  switch (wordBreak) {
    case 'break-all':
      return WORD_BREAK.BREAK_ALL;
    case 'keep-all':
      return WORD_BREAK.KEEP_ALL;
    case 'normal':
    default:
      return WORD_BREAK.NORMAL;
  }
};
