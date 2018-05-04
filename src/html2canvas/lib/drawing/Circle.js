import { PATH } from './Path';

export default class Circle {
  constructor(x, y, radius) {
    this.type = PATH.CIRCLE;
    this.x = x;
    this.y = y;
    this.radius = radius;
  }
}
