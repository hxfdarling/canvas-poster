import { loadImage } from '../utils';

export default class ResourceLoader {
  constructor(options) {
    this.options = options;
    this.cache = {};
  }
  loadImage(src) {
    if (!src) {
      return src;
    }
    if (!this.hasResourceInCache(src)) {
      this.cache[src] = loadImage(src);
    }
    return src;
  }
  hasResourceInCache(key) {
    return typeof this.cache[key] !== 'undefined';
  }
  ready() {
    const keys = Object.keys(this.cache);
    const values = keys.map((str) => this.cache[str].catch(() => null));
    return Promise.all(values).then(
      (images) => new ResourceStore(keys, images)
    );
  }
}

export class ResourceStore {
  constructor(keys, resources) {
    this._keys = keys;
    this._resources = resources;
  }

  get(key) {
    const index = this._keys.indexOf(key);
    return index === -1 ? null : this._resources[index];
  }
}
