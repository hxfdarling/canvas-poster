import { parseBorder } from './parsing/border';
import { parseBorderRadius } from './parsing/borderRadius';
import { parseBackground } from './parsing/background';
import { parseFont } from './parsing/font';
import { parseLetterSpacing } from './parsing/letterSpacing';
import { parseLineBreak } from './parsing/lineBreak';
import { parseOverflow, OVERFLOW } from './parsing/overflow';
import { parseOverflowWrap } from './parsing/overflowWrap';
import { parsePadding } from './parsing/padding';
import { parsePosition, POSITION } from './parsing/position';
import { parseTextDecoration } from './parsing/textDecoration';
import { parseVisibility, VISIBILITY } from './parsing/visibility';
import { parseWordBreak } from './parsing/word-break';
import { parseZIndex } from './parsing/zIndex';

import Color from './Color';
import {
  parseBounds,
  parseBoundCurves,
  calculatePaddingBoxPath,
} from './Bounds';

export default class Node {
  constructor(node, parent, resourceLoader, index) {
    this.node = node;
    this.parent = parent;
    this.tagName = node.tagName;
    this.index = index;
    this.childNodes = [];
    this.listItems = [];
    if (typeof node.start === 'number') {
      this.listStart = node.start;
    }
    this.parseStyle();

    // TODO move bound retrieval for all nodes to a later stage?
    if (node.tagName === 'IMG') {
      node.addEventListener('load', () => {
        this.parseBounds();
      });
      this.image = resourceLoader.loadImage(node.src);
    }
    this.parseBounds();

    if (process.env.NODE_ENV !== 'producation') {
      this.name = `${node.tagName.toLowerCase()}${
        node.id ? `#${node.id}` : ''
      }${node.className
        .toString()
        .split(' ')
        .map((s) => (s.length ? `.${s}` : ''))
        .join('')}`;
    }
  }
  parseBounds() {
    const { node } = this;
    const { defaultView } = node.ownerDocument;
    this.bounds = parseBounds(
      node,
      defaultView.pageXOffset,
      defaultView.pageYOffset
    );
    this.curvedBounds = parseBoundCurves(
      this.bounds,
      this.style.border,
      this.style.borderRadius
    );
  }
  parseStyle() {
    const { node } = this;
    const { defaultView } = node.ownerDocument;

    const style = defaultView.getComputedStyle(node, null);

    const position = parsePosition(style.position);

    this.style = {
      background: parseBackground(style),
      border: parseBorder(style),
      borderRadius: parseBorderRadius(style),
      color: new Color(style.color),
      font: parseFont(style),
      letterSpacing: parseLetterSpacing(style.letterSpacing),
      lineBreak: parseLineBreak(style.lineBreak),
      // margin: parseMargin(style),
      opacity: parseFloat(style.opacity),
      overflow: parseOverflow(style.overflow),
      overflowWrap: parseOverflowWrap(
        style.overflowWrap ? style.overflowWrap : style.wordWrap
      ),
      padding: parsePadding(style),
      position,
      textDecoration: parseTextDecoration(style),
      visibility: parseVisibility(style.visibility),
      wordBreak: parseWordBreak(style.wordBreak),
      zIndex: parseZIndex(position !== POSITION.STATIC ? style.zIndex : 'auto'),
    };
    if (this.isTransformed()) {
      // getBoundingClientRect provides values post-transform, we want them without the transformation
      node.style.transform = 'matrix(1,0,0,1,0,0)';
    }
  }
  getClipPaths() {
    const parentClips = this.parent ? this.parent.getClipPaths() : [];
    const isClipped = this.style.overflow !== OVERFLOW.VISIBLE;

    return isClipped
      ? parentClips.concat([calculatePaddingBoxPath(this.curvedBounds)])
      : parentClips;
  }
  isInFlow() {
    return (
      this.isRootElement() &&
      !this.isFloating() &&
      !this.isAbsolutelyPositioned()
    );
  }
  isVisible() {
    return (
      this.style.opacity > 0 && this.style.visibility === VISIBILITY.VISIBLE
    );
  }
  isAbsolutelyPositioned() {
    return (
      this.style.position !== POSITION.STATIC &&
      this.style.position !== POSITION.RELATIVE
    );
  }
  isPositioned() {
    return this.style.position !== POSITION.STATIC;
  }
  isRootElement() {
    return this.parent === null;
  }
  isTransformed() {
    return this.style.transform !== null;
  }
  isPositionedWithZIndex() {
    return this.isPositioned() && !this.style.zIndex.auto;
  }
}
