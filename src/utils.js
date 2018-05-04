export function loop() {}
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    // 在部分老机型上面，无法加载图片
    if (src.indexOf(';base64,') === -1) {
      // This enables CORS
      img.crossOrigin = 'Anonymous';
    }
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject(new Error('image load error'));
    };
    img.src = src;
  });
}
