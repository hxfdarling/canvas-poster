import { SMALL_IMAGE } from '../utils';

const SAMPLE_TEXT = 'Hidden Text';
function parseMetrics(font) {
  const container = document.createElement('div');
  const img = document.createElement('img');
  const span = document.createElement('span');

  const { body } = document;
  if (!body) {
    throw new Error('No document found for font metrics');
  }

  container.style.visibility = 'hidden';
  container.style.fontFamily = font.fontFamily;
  container.style.fontSize = font.fontSize;
  container.style.margin = '0';
  container.style.padding = '0';

  body.appendChild(container);

  img.src = SMALL_IMAGE;
  img.width = 1;
  img.height = 1;

  img.style.margin = '0';
  img.style.padding = '0';
  img.style.verticalAlign = 'baseline';

  span.style.fontFamily = font.fontFamily;
  span.style.fontSize = font.fontSize;
  span.style.margin = '0';
  span.style.padding = '0';

  span.appendChild(document.createTextNode(SAMPLE_TEXT));
  container.appendChild(span);
  container.appendChild(img);
  const baseline = img.offsetTop - span.offsetTop + 2;

  container.removeChild(span);
  container.appendChild(document.createTextNode(SAMPLE_TEXT));

  container.style.lineHeight = 'normal';
  img.style.verticalAlign = 'super';

  const middle = img.offsetTop - container.offsetTop + 2;

  body.removeChild(container);

  return { baseline, middle };
}

export class FontMetrics {
  constructor() {
    this._data = {};
  }
  getMetrics(font) {
    const key = `${font.fontFamily} ${font.fontSize}`;
    if (this._data[key] === undefined) {
      this._data[key] = parseMetrics(font);
    }

    return this._data[key];
  }
}
