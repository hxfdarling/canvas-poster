import toArray from 'lodash/toArray';

import { Bounds, parseBounds } from './Bounds';
import { TEXT_DECORATION } from './parsing/textDecoration';
import FEATURES from './Feature';

export class TextBounds {
  constructor(text, bounds) {
    this.text = text;
    this.bounds = bounds;
  }
}

export const parseTextBounds = (value, parent, node) => {
  const textList = toArray(value);
  const { length } = textList;
  const defaultView = node.parentNode
    ? node.parentNode.ownerDocument.defaultView
    : null;
  const scrollX = defaultView ? defaultView.pageXOffset : 0;
  const scrollY = defaultView ? defaultView.pageYOffset : 0;
  const textBounds = [];
  let offset = 0;
  for (let i = 0; i < length; i++) {
    const text = textList[i];
    if (
      parent.style.textDecoration !== TEXT_DECORATION.NONE ||
      text.trim().length > 0
    ) {
      if (FEATURES.SUPPORT_RANGE_BOUNDS) {
        textBounds.push(
          new TextBounds(
            text,
            getRangeBounds(node, offset, text.length, scrollX, scrollY)
          )
        );
      } else {
        const replacementNode = node.splitText(text.length);
        textBounds.push(
          new TextBounds(text, getWrapperBounds(node, scrollX, scrollY))
        );
        node = replacementNode;
      }
    } else if (!FEATURES.SUPPORT_RANGE_BOUNDS) {
      node = node.splitText(text.length);
    }
    offset += text.length;
  }
  return textBounds;
};

const getWrapperBounds = (node, scrollX, scrollY) => {
  const wrapper = node.ownerDocument.createElement('html2canvaswrapper');
  wrapper.appendChild(node.cloneNode(true));
  const { parentNode } = node;
  if (parentNode) {
    parentNode.replaceChild(wrapper, node);
    const bounds = parseBounds(wrapper, scrollX, scrollY);
    if (wrapper.firstChild) {
      parentNode.replaceChild(wrapper.firstChild, wrapper);
    }
    return bounds;
  }
  return new Bounds(0, 0, 0, 0);
};

const getRangeBounds = (node, offset, length, scrollX, scrollY) => {
  const range = node.ownerDocument.createRange();
  range.setStart(node, offset);
  range.setEnd(node, offset + length);
  return Bounds.fromClientRect(range.getBoundingClientRect(), scrollX, scrollY);
};
