import {
  Bounds,
  parsePathForBorder,
  calculateContentBox,
  calculatePaddingBoxPath,
} from './Bounds';
import Text from './Text';
import { BORDER_STYLE } from './parsing/border';
import { calculateBackgroungPaintingArea } from './parsing/background';

export default class Renderer {
  constructor(poster, options = {}) {
    this.poster = poster;
    this.options = options;
  }

  renderNode(container) {
    if (container.isVisible()) {
      this.renderBackgroundAndBorders(container);
      this.renderNodeContent(container);
    }
  }

  renderNodeContent(container) {
    const callback = () => {
      if (container.childNodes.length) {
        container.childNodes.forEach((child) => {
          if (child instanceof Text) {
            const { style } = child.parent;
            this.poster.renderTextNode(
              child.bounds,
              style.color,
              style.font,
              style.textDecoration
            );
          } else {
            this.poster.drawShape(child, container.style.color);
          }
        });
      }

      if (container.image) {
        const image = this.options.imageStore.get(container.image);
        if (image) {
          const contentBox = calculateContentBox(
            container.bounds,
            container.style.padding,
            container.style.border
          );
          const width =
            typeof image.width === 'number' && image.width > 0
              ? image.width
              : contentBox.width;
          const height =
            typeof image.height === 'number' && image.height > 0
              ? image.height
              : contentBox.height;
          if (width > 0 && height > 0) {
            this.poster.clip(
              [calculatePaddingBoxPath(container.curvedBounds)],
              () => {
                this.poster.drawImage(
                  image,
                  new Bounds(0, 0, width, height),
                  contentBox
                );
              }
            );
          }
        }
      }
    };
    const paths = container.getClipPaths();
    if (paths.length) {
      this.poster.clip(paths, callback);
    } else {
      callback();
    }
  }
  renderBackgroundAndBorders(container) {
    const HAS_BACKGROUND = !container.style.background.backgroundColor.isTransparent();

    const hasRenderableBorders = container.style.border.some(
      (border) =>
        border.borderStyle !== BORDER_STYLE.NONE &&
        !border.borderColor.isTransparent()
    );

    const callback = () => {
      const backgroundPaintingArea = calculateBackgroungPaintingArea(
        container.curvedBounds,
        container.style.background.backgroundClip
      );

      if (HAS_BACKGROUND) {
        this.poster.clip([backgroundPaintingArea], () => {
          if (!container.style.background.backgroundColor.isTransparent()) {
            this.poster.fill(container.style.background.backgroundColor);
          }
        });
      }

      container.style.border.forEach((border, side) => {
        if (
          border.borderStyle !== BORDER_STYLE.NONE &&
          !border.borderColor.isTransparent()
        ) {
          this.renderBorder(border, side, container.curvedBounds);
        }
      });
    };

    if (HAS_BACKGROUND || hasRenderableBorders) {
      const paths = container.parent ? container.parent.getClipPaths() : [];
      if (paths.length) {
        this.poster.clip(paths, callback);
      } else {
        callback();
      }
    }
  }

  renderBorder(border, side, curvePoints) {
    this.poster.drawShape(
      parsePathForBorder(curvePoints, side),
      border.borderColor
    );
  }

  renderStack(stack) {
    if (stack.container.isVisible()) {
      const opacity = stack.getOpacity();
      if (opacity !== this._opacity) {
        this.poster.setOpacity(stack.getOpacity());
        this._opacity = opacity;
      }

      this.renderStackContent(stack);
    }
  }

  renderStackContent(stack) {
    const [
      negativeZIndex,
      zeroOrAutoZIndexOrTransformedOrOpacity,
      positiveZIndex,
      nonPositionedFloats,
      nonPositionedInlineLevel,
    ] = splitStackingContexts(stack);
    const [inlineLevel, nonInlineLevel] = splitDescendants(stack);

    // https://www.w3.org/TR/css-position-3/#painting-order
    // 1. the background and borders of the element forming the stacking context.
    this.renderBackgroundAndBorders(stack.container);
    // 2. the child stacking contexts with negative stack levels (most negative first).
    negativeZIndex.sort(sortByZIndex).forEach(this.renderStack, this);
    // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
    this.renderNodeContent(stack.container);
    nonInlineLevel.forEach(this.renderNode, this);
    // 4. All non-positioned floating descendants, in tree order. For each one of these,
    // treat the element as if it created a new stacking context, but any positioned descendants and descendants
    // which actually create a new stacking context should be considered part of the parent stacking context,
    // not this new one.
    nonPositionedFloats.forEach(this.renderStack, this);
    // 5. the in-flow, inline-level, non-positioned descendants, including inline tables and inline blocks.
    nonPositionedInlineLevel.forEach(this.renderStack, this);
    inlineLevel.forEach(this.renderNode, this);
    // 6. All positioned, opacity or transform descendants, in tree order that fall into the following categories:
    //  All positioned descendants with 'z-index: auto' or 'z-index: 0', in tree order.
    //  For those with 'z-index: auto', treat the element as if it created a new stacking context,
    //  but any positioned descendants and descendants which actually create a new stacking context should be
    //  considered part of the parent stacking context, not this new one. For those with 'z-index: 0',
    //  treat the stacking context generated atomically.
    //
    //  All opacity descendants with opacity less than 1
    //
    //  All transform descendants with transform other than none
    zeroOrAutoZIndexOrTransformedOrOpacity.forEach(this.renderStack, this);
    // 7. Stacking contexts formed by positioned descendants with z-indices greater than or equal to 1 in z-index
    // order (smallest first) then tree order.
    positiveZIndex.sort(sortByZIndex).forEach(this.renderStack, this);
  }

  render(stack) {
    if (this.options.backgroundColor) {
      this.poster.rectangle(
        this.options.x,
        this.options.y,
        this.options.width,
        this.options.height,
        this.options.backgroundColor
      );
    }
    this.renderStack(stack);
    return this.target;
  }
}

const splitDescendants = (stack) => {
  const inlineLevel = [];
  const nonInlineLevel = [];

  const { length } = stack.children;
  for (let i = 0; i < length; i++) {
    const child = stack.children[i];
    if (child.isInlineLevel()) {
      inlineLevel.push(child);
    } else {
      nonInlineLevel.push(child);
    }
  }
  return [inlineLevel, nonInlineLevel];
};

const splitStackingContexts = (stack) => {
  const negativeZIndex = [];
  const zeroOrAutoZIndexOrTransformedOrOpacity = [];
  const positiveZIndex = [];
  const nonPositionedFloats = [];
  const nonPositionedInlineLevel = [];
  const { length } = stack.contexts;
  for (let i = 0; i < length; i++) {
    const child = stack.contexts[i];
    if (
      child.container.isPositioned() ||
      child.container.style.opacity < 1 ||
      child.container.isTransformed()
    ) {
      if (child.container.style.zIndex.order < 0) {
        negativeZIndex.push(child);
      } else if (child.container.style.zIndex.order > 0) {
        positiveZIndex.push(child);
      } else {
        zeroOrAutoZIndexOrTransformedOrOpacity.push(child);
      }
    } else if (child.container.isFloating()) {
      nonPositionedFloats.push(child);
    } else {
      nonPositionedInlineLevel.push(child);
    }
  }
  return [
    negativeZIndex,
    zeroOrAutoZIndexOrTransformedOrOpacity,
    positiveZIndex,
    nonPositionedFloats,
    nonPositionedInlineLevel,
  ];
};

const sortByZIndex = (a, b) => {
  if (a.container.style.zIndex.order > b.container.style.zIndex.order) {
    return 1;
  } else if (a.container.style.zIndex.order < b.container.style.zIndex.order) {
    return -1;
  }

  return a.container.index > b.container.index ? 1 : -1;
};
