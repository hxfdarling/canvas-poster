/* eslint-disable
no-param-reassign
 */

import createStyledText from './canvasText';

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
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.options.width;
    this.canvas.height = this.options.height;
    this.context = this.canvas.getContext('2d');
  }
  getImageData() {
    return this.canvas.toDataURL('image/png');
  }
  drawImage(src, x, y, w, h) {
    const { context } = this;
    const { scale } = this.options;
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      // This enables CORS
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
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
    createStyledText(context, texts, options).render(x * scale, y * scale);
  }
}
