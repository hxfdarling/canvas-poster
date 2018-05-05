import { renderDom } from './src/index';

window.renderDom = renderDom;
renderDom(document.querySelector('#test-dom'), {}).then((poster) => {
  document.querySelector('#test').src = poster.getImageData();
});
