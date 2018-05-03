/* eslint-disable
no-param-reassign */

function setFontParams(context, opt) {
  context.textAlign = 'left';
  context.textBaseline = opt.baseline || 'alphabetic';
  context.font = opt.font;
}

function getBlockLength(attrib, start, end) {
  const offset = Math.max(0, start - attrib.index);
  return Math.min(attrib.text.length - offset, end - start);
}

function computeAttributeGlyphs(
  context,
  fullText,
  prevWidth,
  attrib,
  start,
  end,
  width
) {
  const length = getBlockLength(attrib, start, end);

  // determine how many chars in this chunk can be shown
  setFontParams(context, attrib);
  for (let off = 0; off < length; off++) {
    const substr = fullText.substring(start, start + (length - off));
    const newWidth = context.measureText(substr).width;
    if (prevWidth + newWidth <= width) {
      return { available: substr.length, width: newWidth };
    }
  }
  return { available: 0, width: 0 };
}

function indexOfAttribute(data, charIndex) {
  // find the first attribute at this character index
  for (let i = 0; i < data.length; i++) {
    const attrib = data[i];
    const { text } = attrib;
    const { length } = text;
    if (charIndex >= attrib.index && charIndex < attrib.index + length) {
      return i;
    }
  }
  return -1;
}

function composeBuffer(data) {
  let buffer = '';
  let previous = 0;
  data.forEach((attrib) => {
    const { text } = attrib;
    buffer += text;
    attrib.index = previous;
    previous = attrib.index + text.length;
  });
  return buffer;
}

function getMaxAttrHeight(data, start, end) {
  let maxAttrHeight = 0;
  // first we need to compute max attribute height for this line
  while (start < end) {
    // find next attribute chunk for this string char
    const attribIdx = indexOfAttribute(data, start);
    if (attribIdx === -1) {
      break;
    }

    // for each attribute in this range ...
    const attrib = data[attribIdx];
    maxAttrHeight = Math.max(attrib.lineHeight, maxAttrHeight);
    start = attrib.index + attrib.text.length;
  }
  return maxAttrHeight;
}
export {
  getBlockLength,
  computeAttributeGlyphs,
  setFontParams,
  indexOfAttribute,
  composeBuffer,
  getMaxAttrHeight,
};
