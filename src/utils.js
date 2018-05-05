export function loop() {}
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    // 在部分老机型上面，无法加载图片
    if (src.indexOf(';base64,') === -1) {
      // This enables CORS
      img.crossOrigin = 'Anonymous';
    }
    img.onload = () => resolve(img);

    img.onerror = () => {
      reject(new Error('image load error'));
    };
    img.src = src;
    if (img.complete === true) {
      // Inline XML images may fail to parse, throwing an Error later on
      setTimeout(() => {
        resolve(img);
      }, 500);
    }
  });
}
export const SMALL_IMAGE =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
