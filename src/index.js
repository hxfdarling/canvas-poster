/* eslint-disable
no-param-reassign
 */
import createStyledText from './canvas-text';
import html2canvas from './html2canvas';
import { PATH } from './html2canvas/lib/drawing/Path';
import { loadImage } from './utils';

export function testx() {
  return 1;
}

export default class Poster {
  constructor(options) {
    this.options = Object.assign(
      {
        width: 200,
        height: 200,
        scale: 2,
      },
      options
    );
    const { scale, width, height } = this.options;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    // 高清图绘制
    this.canvas.width = Math.floor(width * scale);
    this.canvas.height = Math.floor(height * scale);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.scale(scale, scale);
  }
  getImageData() {
    return this.canvas.toDataURL('image/png');
  }

  async drawImageBySrc(
    src,
    { left = 0, top = 0, width, height } = { width: '100%' }
  ) {
    const { width: canvasWidth, height: canvasHeight } = this.options;
    const img = await loadImage(src);

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

  getTarget() {
    this.canvas.getContext('2d').setTransform(1, 0, 0, 1, 0, 0);
    return Promise.resolve(this.canvas);
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

  drawDom(dom) {
    html2canvas(this, dom);
  }
}
