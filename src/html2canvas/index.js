/**
 *
 * 需要处理的场景
 * 背景色
 * 文本:颜色、换行、字体、样式线、省略号
 * 图片
 * 圆角
 * z-index：static,absolute,relative
 */

async function drawDom(poster, dom) {
  dom.children.forEach(() => {});
}
async function drawHtml(poster, html) {
  const dom = document.createElement('div');
  dom.innerHTML = html;
  document.body.appendChild(dom);
  await drawDom(poster, dom);
  document.body.removeChild(dom);
}

export default async function(poster, dom) {
  if (typeof dom === 'string') {
    await drawHtml(poster, dom);
  } else {
    await drawDom(poster, dom);
  }
}
