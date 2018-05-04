import { PATH } from './Path';

export default class Vector {
  constructor(x, y) {
    this.type = PATH.VECTOR;
    this.x = x;
    this.y = y;
  }
}
