/* eslint-disable
no-param-reassign
 */
import createStyledText from './canvas-text';

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
    this.canvas.width = width * scale;
    this.canvas.height = height * scale;
    this.context = this.canvas.getContext('2d');
  }
  getImageData() {
    return this.canvas.toDataURL('image/png');
  }
  drawImage(src, { x = 0, y = 0, w, h } = { w: '100%' }) {
    const { context } = this;
    const { scale, width, height } = this.options;
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      // 在部分老机型上面，无法加载图片
      if (src.indexOf(';base64,') === -1) {
        // This enables CORS
        img.crossOrigin = 'Anonymous';
      }
      img.onload = () => {
        if (w === '100%') {
          w = width;
          h = img.height / img.width * w;
        } else if (h === '100%') {
          h = height;
          w = img.width / img.height * h;
        } else {
          if (w) {
            h = img.height / img.width * w;
          } else if (h) {
            w = img.width / img.height * h;
          }
          w = w || img.width;
          h = h || img.height;
        }
        try {
          context.drawImage(img, x * scale, y * scale, w * scale, h * scale);
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => {
        reject(new Error('image load error'));
      };
      img.src = src;
    });
  }
  drawTexts(texts, x = 0, y = 0, options = {}) {
    const { scale } = this.options;
    const { context } = this;
    if (typeof texts === 'string') {
      texts = [{ text: texts }];
    } else if (!(texts instanceof Array)) {
      texts = [texts];
    }
    texts.forEach((item) => {
      if (item.size) {
        item.size *= scale;
      }
      if (item.lineHeight) {
        item.lineHeight *= scale;
      }
    });
    if (options.width) {
      options.width *= scale;
    }
    createStyledText(context, texts, options).render(x * scale, y * scale);
  }
}
