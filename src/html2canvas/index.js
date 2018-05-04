/* eslint-disable
no-console
*/
/**
 *
 * 需要处理的场景
 * 背景色
 * 文本:颜色、换行、字体、样式线、省略号
 * 图片
 * 圆角
 * z-index：static,absolute,relative
 */
import { NodeParser } from './lib/NodeParser';

export default function drawDom(poster, dom) {
  const stack = NodeParser(dom);
  console.log(stack);
}
