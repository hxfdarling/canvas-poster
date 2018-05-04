import Poster from './src/index';

const img = document.querySelector('#test');
const poster = new Poster({
  width: 750,
  height: 1224,
});
poster.drawDom(document.querySelector('#test-dom'));
img.src = poster.getImageData();
document.body.appendChild(img);
