/* eslint-disable
no-param-reassign
 */

import assign from 'object-assign';
import dprop from 'dprop';

import { wordWrap } from '../word-wrapper';

import renderText from './lib/render';

import {
  getBlockLength,
  computeAttributeGlyphs,
  setFontParams,
  indexOfAttribute,
  composeBuffer,
  getMaxAttrHeight,
} from './lib/util';

const baseSettings = {
  baseline: 'alphabetic',
  align: 'left',
  fillStyle: '#000',
  style: 'normal',
  variant: 'normal',
  weight: 'normal',
  family: 'sans-serif',
  size: 32,
};

export default function createStyledText(context, chunks, opts) {
  if (!context) {
    throw new TypeError(
      'must specify a CanvasRenderingContext2D as first parameter'
    );
  }

  let fullText = '';
  let maxLineWidth = 0;
  let height = 0;
  let data;
  let lines = [];
  let fonts = [];
  const defaultOpts = assign({}, opts);

  const stlyedText = {
    render,
    update,
    layout,
  };

  // some read-only values
  Object.defineProperties(stlyedText, {
    lines: dprop(() => lines),

    fonts: dprop(() => fonts),

    width: dprop(() => maxLineWidth),

    height: dprop(() => height),
  });

  update(chunks, opts);

  function update(newChunks, newOpts) {
    opts = assign({}, baseSettings, defaultOpts, newOpts);

    // accept array or single element for string data
    if (!Array.isArray(newChunks)) {
      newChunks = [newChunks || ''];
    }

    chunks = newChunks;

    // run an initial layout by default
    if (opts.layout !== false) {
      layout();
    }
  }

  function layout() {
    // copy data to avoid mutating user objects
    data = chunks.map((attrib) => {
      if (typeof attrib === 'string') {
        attrib = { text: attrib };
      }

      attrib = assign({}, opts, attrib);

      attrib.text = attrib.text || '';
      attrib.font = getFontStyle(attrib, opts);

      // approximate line height from pixel size
      if (typeof attrib.lineHeight === 'undefined') {
        attrib.lineHeight = getLineHeight(attrib.size);
      }

      return attrib;
    });

    fonts = data.map((attrib) => attrib.font);

    fullText = composeBuffer(data);
    lines = wordWrap(fullText, {
      width: opts.width,
      mode: opts.wordWrap,
      measure,
    });

    const lineSpacing = opts.lineSpacing || 0;
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      line.height = getMaxAttrHeight(data, line.start, line.end);
      line.height += lineSpacing;
    }

    maxLineWidth = lines.reduce((prev, line) => Math.max(line.width, prev), 0);
    // 居右处理
    if (opts.width) {
      maxLineWidth = Math.max(maxLineWidth, opts.width);
    }
    height = lines.reduce((prev, line) => prev + line.height, 0);
  }

  function render(originX, originY, renderFunc) {
    let cursorX = 0;
    let cursorY = lines.length > 0 ? lines[0].height : 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const { end } = line;
      let { start } = line;
      const lineWidth = line.width;
      const maxAttrHeight = line.height;

      while (start < end) {
        // find next attribute chunk for this string char
        const attribIdx = indexOfAttribute(data, start);
        if (attribIdx === -1) {
          break;
        }

        // for each attribute in this range ...
        const attrib = data[attribIdx];
        const length = getBlockLength(attrib, start, end);

        const text = fullText.substring(start, start + length);
        const { lineHeight } = attrib;

        let x = originX + cursorX;
        const y = originY + cursorY - lineHeight;
        if (opts.align === 'right') {
          x += maxLineWidth - lineWidth;
        } else if (opts.align === 'center') {
          x += (maxLineWidth - lineWidth) / 2;
        }

        setFontParams(context, attrib);
        const textWidth = context.measureText(text).width;
        cursorX += textWidth;

        if (renderFunc) {
          renderFunc(context, text, x, y, textWidth, lineHeight, attrib, i);
        } else {
          renderText(context, text, x, y, textWidth, lineHeight, attrib, i);
        }

        // skip to next chunk
        start += Math.max(1, length);
      }
      cursorX = 0;

      const next = lines[i + 1];
      if (next) {
        cursorY += next.height;
      } else {
        cursorY += maxAttrHeight;
      }
    }
  }

  function measure(text, start, end, width) {
    let availableGlyphs = 0;
    const first = start;
    let totalWidth = 0;

    while (start < end) {
      // find next attribute chunk for this string char
      const attribIdx = indexOfAttribute(data, start);
      if (attribIdx === -1) {
        break;
      }

      // for each attribute in this range ...
      const attrib = data[attribIdx];

      const result = computeAttributeGlyphs(
        context,
        fullText,
        totalWidth,
        attrib,
        start,
        end,
        width
      );
      availableGlyphs += result.available;
      totalWidth += result.width;

      // skip to next attribute
      start = attrib.index + attrib.text.length;
    }

    return {
      width: totalWidth,
      start: first,
      end: first + availableGlyphs,
    };
  }
  return stlyedText;
}

function getFontStyle(opt, defaults) {
  const style = opt.style || defaults.style;
  const variant = opt.variant || defaults.variant;
  const weight = String(opt.weight || defaults.weight);
  const family = opt.family || defaults.family;
  const fontSize = typeof opt.size === 'number' ? opt.size : defaults.size;
  const fontStyle = [style, variant, weight, `${fontSize}px`, family].join(' ');
  return fontStyle;
}

function getLineHeight(fontSize) {
  return fontSize + 1;
}
