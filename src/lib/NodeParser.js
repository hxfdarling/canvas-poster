/* eslint-disable
no-plusplus */

import StackingContext from './StackingContext';
import Node from './Node';
import Text from './Text';

const TYPE_TEXT = 3;
export const NodeParser = (node) => {
  let index = 0;
  const container = new Node(node, null, index++);
  const stack = new StackingContext(container, null, true);

  parseNodeTree(node, container, stack, index);

  return stack;
};
const IGNORED_NODE_NAMES = [
  'SCRIPT',
  'HEAD',
  'TITLE',
  'OBJECT',
  'BR',
  'OPTION',
];

const parseNodeTree = (node, parent, stack, index) => {
  for (
    let childNode = node.firstChild, nextNode;
    childNode;
    childNode = nextNode
  ) {
    nextNode = childNode.nextSibling;
    if (childNode.nodeType === TYPE_TEXT) {
      if (childNode.data.trim().length > 0) {
        parent.childNodes.push(Text.fromTextNode(childNode, parent));
      }
    } else if (childNode instanceof HTMLElement) {
      if (IGNORED_NODE_NAMES.indexOf(childNode.nodeName) === -1) {
        const container = new Node(childNode, parent, index++);
        if (container.isVisible()) {
          const treatAsRealStackingContext = createsRealStackingContext(
            container,
            childNode
          );
          if (treatAsRealStackingContext || createsStackingContext(container)) {
            // for treatAsRealStackingContext:false, any positioned descendants and descendants
            // which actually create a new stacking context should be considered part of the parent stacking context
            const parentStack =
              treatAsRealStackingContext || container.isPositioned()
                ? stack.getRealParentStackingContext()
                : stack;
            const childStack = new StackingContext(
              container,
              parentStack,
              treatAsRealStackingContext
            );
            parentStack.contexts.push(childStack);
            parseNodeTree(childNode, container, childStack, index);
          } else {
            stack.children.push(container);
            parseNodeTree(childNode, container, stack, index);
          }
        }
      }
    } else {
      throw new Error(`not support ${node.tagName}`);
    }
  }
};

const createsRealStackingContext = (container, node) =>
  container.isRootElement() ||
  container.isPositionedWithZIndex() ||
  container.style.opacity < 1 ||
  container.isTransformed() ||
  isBodyWithTransparentRoot(container, node);

const createsStackingContext = (container) => container.isPositioned();

const isBodyWithTransparentRoot = (container, node) =>
  node.nodeName === 'BODY' &&
  container.parent instanceof Node &&
  container.parent.style.background.backgroundColor.isTransparent();
