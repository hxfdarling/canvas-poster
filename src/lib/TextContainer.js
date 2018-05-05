import { parseTextBounds } from './TextBounds';

export default class TextContainer {
  constructor(text, parent, bounds) {
    this.text = text;
    this.parent = parent;
    this.bounds = bounds;
  }

  static fromTextNode(node, parent) {
    return new TextContainer(
      node.data,
      parent,
      parseTextBounds(node.data, parent, node)
    );
  }
}
