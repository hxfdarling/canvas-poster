/* eslint-disable
no-console
*/

import createStyledText from './canvas-text';

import { TEXT_DECORATION_LINE } from './lib/parsing/textDecoration';

import { NodeParser } from './lib/NodeParser';
import { PATH } from './lib/drawing/Path';
import { loadImage } from './utils';
import Renderer from './lib/Renderer';
import ResourceLoader from './lib/ResourceLoader';
import { Bounds } from './lib/Bounds';
import { FontMetrics } from './lib/Font';

export default class Poster {
  constructor(options) {
    this.options = Object.assign(
      {
        width: 200,
        height: 200,
        scale: 2,
        x: 0,
        y: 0,
      },
      options
    );
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.fontMetrics = new FontMetrics();
    this.init();
  }
  init() {
    const { scale, width, height, x, y } = this.options;
    // 高清图绘制
    this.canvas.width = Math.floor(width * scale);
    this.canvas.height = Math.floor(height * scale);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(scale, scale);
    this.ctx.translate(-x, -y);
    this.ctx.textBaseline = 'bottom';
  }
  getImageData() {
    return this.canvas.toDataURL('image/png');
  }

  drawImageBySrc(
    src,
    { left = 0, top = 0, width, height } = { width: '100%' }
  ) {
    const { width: canvasWidth, height: canvasHeight } = this.options;
    return loadImage(src).then((img) => {
      if (width === '100%') {
        width = canvasWidth;
        height = img.height / img.width * width;
      } else if (height === '100%') {
        height = canvasHeight;
        width = img.width / img.height * height;
      } else {
        if (width) {
          height = img.height / img.width * width;
        } else if (height) {
          width = img.width / img.height * height;
        }
        width = width || img.width;
        height = height || img.height;
      }
      this.drawImage(img, {
        left,
        top,
        width,
        height,
      });
    });
  }

  drawTexts(texts, options = {}) {
    const { left = 0, top = 0 } = options;
    const { ctx } = this;
    if (typeof texts === 'string') {
      texts = [{ text: texts }];
    } else if (!(texts instanceof Array)) {
      texts = [texts];
    }
    createStyledText(ctx, texts, options).render(left, top);
  }

  clip(clipPaths, callback = () => {}) {
    if (clipPaths.length) {
      this.ctx.save();
      clipPaths.forEach((path) => {
        this.path(path);
        this.ctx.clip();
      });
    }

    callback();

    if (clipPaths.length) {
      this.ctx.restore();
    }
  }

  drawImage(image, source, destination) {
    if (destination) {
      this.ctx.drawImage(
        image,
        source.left,
        source.top,
        source.width,
        source.height,
        destination.left,
        destination.top,
        destination.width,
        destination.height
      );
    } else {
      this.ctx.drawImage(
        image,
        source.left,
        source.top,
        source.width,
        source.height
      );
    }
  }

  drawShape(path, color) {
    this.path(path);
    this.ctx.fillStyle = color.toString();
    this.ctx.fill();
  }

  fill(color) {
    this.ctx.fillStyle = color.toString();
    this.ctx.fill();
  }

  path(path) {
    this.ctx.beginPath();
    if (Array.isArray(path)) {
      path.forEach((point, index) => {
        const start = point.type === PATH.VECTOR ? point : point.start;
        if (index === 0) {
          this.ctx.moveTo(start.x, start.y);
        } else {
          this.ctx.lineTo(start.x, start.y);
        }

        if (point.type === PATH.BEZIER_CURVE) {
          this.ctx.bezierCurveTo(
            point.startControl.x,
            point.startControl.y,
            point.endControl.x,
            point.endControl.y,
            point.end.x,
            point.end.y
          );
        }
      });
    } else {
      this.ctx.arc(
        path.x + path.radius,
        path.y + path.radius,
        path.radius,
        0,
        Math.PI * 2,
        true
      );
    }

    this.ctx.closePath();
  }

  rectangle(x, y, width, height, color) {
    this.ctx.fillStyle = color.toString();
    this.ctx.fillRect(x, y, width, height);
  }
  setOpacity(opacity) {
    this.ctx.globalAlpha = opacity;
  }
  renderTextNode(textBounds, color, font, textDecoration) {
    this.ctx.font = [
      font.fontStyle,
      font.fontVariant,
      font.fontWeight,
      font.fontSize,
      font.fontFamily,
    ].join(' ');

    textBounds.forEach((text) => {
      this.ctx.fillStyle = color.toString();
      this.ctx.fillText(
        text.text,
        text.bounds.left,
        text.bounds.top + text.bounds.height
      );
      if (textDecoration !== null) {
        this.renderTextDecoration(text, color, font, textDecoration);
      }
    });
  }
  renderTextDecoration(text, color, font, textDecoration) {
    const textDecorationColor = textDecoration.textDecorationColor || color;
    textDecoration.textDecorationLine.forEach((textDecorationLine) => {
      switch (textDecorationLine) {
        case TEXT_DECORATION_LINE.UNDERLINE: {
          // need to take that into account both in position and size // TODO As some browsers display the line as more than 1px if the font-size is big, // Draws a line at the baseline of the font
          const { baseline } = this.fontMetrics.getMetrics(font);
          this.rectangle(
            text.bounds.left,
            Math.round(text.bounds.top + baseline),
            text.bounds.width,
            1,
            textDecorationColor
          );
          break;
        }
        case TEXT_DECORATION_LINE.OVERLINE: {
          this.rectangle(
            text.bounds.left,
            Math.round(text.bounds.top),
            text.bounds.width,
            1,
            textDecorationColor
          );
          break;
        }
        case TEXT_DECORATION_LINE.LINE_THROUGH: {
          // TODO try and find exact position for line-through
          const { middle } = this.fontMetrics.getMetrics(font);
          this.rectangle(
            text.bounds.left,
            Math.ceil(text.bounds.top + middle),
            text.bounds.width,
            1,
            textDecorationColor
          );
          break;
        }
        default:
      }
    });
  }
}
export function renderDom(dom, options = {}) {
  const { width, height, top, left } = Bounds.fromClientRect(
    dom.getBoundingClientRect(),
    window.pageXOffset,
    window.pageYOffset
  );
  const resourceLoader = new ResourceLoader();
  const stack = NodeParser(dom, resourceLoader);
  return resourceLoader.ready().then((imageStore) => {
    options = Object.assign(
      {
        imageStore,
        width,
        height,
        x: left,
        y: top,
      },
      options
    );
    const poster = new Poster(options);
    poster.stack = stack;
    const renderer = new Renderer(poster, options);
    renderer.render(stack);
    return poster;
  });
}
