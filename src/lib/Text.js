import { parseTextBounds } from './TextBounds';

export default class Text {
  constructor(text, parent, bounds) {
    this.text = text;
    this.parent = parent;
    this.bounds = bounds;
  }

  static fromTextNode(node, parent) {
    return new Text(
      node.data,
      parent,
      parseTextBounds(node.data, parent, node)
    );
  }
}
