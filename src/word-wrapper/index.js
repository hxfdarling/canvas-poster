/* eslint-disable
no-param-reassign,
no-plusplus
 */

// copy from https://github.com/mattdesl/word-wrapper/blob/master/index.js
// add feature to support break all

const newline = /\n/;
const newlineChar = '\n';
const whitespace = /\s/;

export default function(text, opt) {
  const lines = wordWrap(text, opt);
  return lines.map((line) => text.substring(line.start, line.end)).join('\n');
}

export function wordWrap(text, opt) {
  opt = opt || {};

  // zero width results in nothing visible
  if (opt.width === 0 && opt.mode !== 'nowrap') return [];

  text = text || '';
  const width = typeof opt.width === 'number' ? opt.width : Number.MAX_VALUE;
  const start = Math.max(0, opt.start || 0);
  const end = typeof opt.end === 'number' ? opt.end : text.length;
  const { mode } = opt;

  const measure = opt.measure || monospace;
  if (mode === 'pre') return pre(measure, text, start, end, width);
  return greedy(measure, text, start, end, width, mode);
}

function idxOf(text, chr, start, end) {
  const idx = text.indexOf(chr, start);
  if (idx === -1 || idx > end) return end;
  return idx;
}

function isWhitespace(chr) {
  return whitespace.test(chr);
}

function pre(measure, text, start, end, width) {
  const lines = [];
  let lineStart = start;
  for (let i = start; i < end && i < text.length; i++) {
    const chr = text.charAt(i);
    const isNewline = newline.test(chr);

    // If we've reached a newline, then step down a line
    // Or if we've reached the EOF
    if (isNewline || i === end - 1) {
      const lineEnd = isNewline ? i : i + 1;
      const measured = measure(text, lineStart, lineEnd, width);
      lines.push(measured);

      lineStart = i + 1;
    }
  }
  return lines;
}

function greedy(measure, text, start, end, width, mode) {
  // A greedy word wrapper based on LibGDX algorithm
  // https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
  const lines = [];

  let testWidth = width;
  // if 'nowrap' is specified, we only wrap on newline chars
  if (mode === 'nowrap') testWidth = Number.MAX_VALUE;
  const breakAll = mode === 'breakAll';
  while (start < end && start < text.length) {
    // get next newline position
    const newLine = idxOf(text, newlineChar, start, end);

    // eat whitespace at start of line
    while (start < newLine) {
      if (!isWhitespace(text.charAt(start))) break;
      start++;
    }

    // determine visible # of glyphs for the available width
    const measured = measure(text, start, newLine, testWidth);

    let lineEnd = start + (measured.end - measured.start);
    let nextStart = lineEnd + newlineChar.length;

    // if we had to cut the line before the next newline...
    if (lineEnd < newLine) {
      if (!breakAll) {
        // find char to break on
        while (lineEnd > start) {
          if (isWhitespace(text.charAt(lineEnd))) break;
          lineEnd--;
        }
      }
      if (lineEnd === start) {
        if (nextStart > start + newlineChar.length) nextStart--;
        // If no characters to break, show all.
        lineEnd = nextStart;
      } else {
        nextStart = lineEnd;
        // eat whitespace at end of line
        while (lineEnd > start) {
          if (!isWhitespace(text.charAt(lineEnd - newlineChar.length))) break;
          lineEnd--;
        }
      }
    }
    if (lineEnd >= start) {
      const result = measure(text, start, lineEnd, testWidth);
      lines.push(result);
    }
    start = nextStart;
  }
  return lines;
}

// determines the visible number of glyphs within a given width
function monospace(text, start, end, width) {
  const glyphs = Math.min(width, end - start);
  return {
    start,
    end: start + glyphs,
  };
}
