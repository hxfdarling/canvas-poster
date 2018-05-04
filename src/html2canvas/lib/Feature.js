const testRangeBounds = (document) => {
  const TEST_HEIGHT = 123;

  if (document.createRange) {
    const range = document.createRange();
    if (range.getBoundingClientRect) {
      const testElement = document.createElement('boundtest');
      testElement.style.height = `${TEST_HEIGHT}px`;
      testElement.style.display = 'block';
      document.body.appendChild(testElement);

      range.selectNode(testElement);
      const rangeBounds = range.getBoundingClientRect();
      const rangeHeight = Math.round(rangeBounds.height);
      document.body.removeChild(testElement);
      if (rangeHeight === TEST_HEIGHT) {
        return true;
      }
    }
  }

  return false;
};

// iOS 10.3 taints canvas with base64 images unless crossOrigin = 'anonymous'
const testBase64 = (document, src) => {
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  return new Promise((resolve) => {
    // Single pixel base64 image renders fine on iOS 10.3???
    img.src = src;

    const onload = () => {
      try {
        ctx.drawImage(img, 0, 0);
        canvas.toDataURL();
      } catch (e) {
        return resolve(false);
      }

      return resolve(true);
    };

    img.onload = onload;
    img.onerror = () => resolve(false);

    if (img.complete === true) {
      setTimeout(() => {
        onload();
      }, 500);
    }
  });
};

const testCORS = () => typeof new Image().crossOrigin !== 'undefined';

const testResponseType = () =>
  typeof new XMLHttpRequest().responseType === 'string';

const testSVG = (document) => {
  const img = new Image();
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  img.src = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>`;

  try {
    ctx.drawImage(img, 0, 0);
    canvas.toDataURL();
  } catch (e) {
    return false;
  }
  return true;
};

const FEATURES = {
  get SUPPORT_RANGE_BOUNDS() {
    const value = testRangeBounds(document);
    Object.defineProperty(FEATURES, 'SUPPORT_RANGE_BOUNDS', { value });
    return value;
  },
  get SUPPORT_SVG_DRAWING() {
    const value = testSVG(document);
    Object.defineProperty(FEATURES, 'SUPPORT_SVG_DRAWING', { value });
    return value;
  },
  get SUPPORT_BASE64_DRAWING() {
    return (src) => {
      const value = testBase64(document, src);
      Object.defineProperty(FEATURES, 'SUPPORT_BASE64_DRAWING', {
        value: () => value,
      });
      return value;
    };
  },

  get SUPPORT_CORS_IMAGES() {
    const value = testCORS();
    Object.defineProperty(FEATURES, 'SUPPORT_CORS_IMAGES', { value });
    return value;
  },
  get SUPPORT_RESPONSE_TYPE() {
    const value = testResponseType();
    Object.defineProperty(FEATURES, 'SUPPORT_RESPONSE_TYPE', { value });
    return value;
  },
  get SUPPORT_CORS_XHR() {
    const value = 'withCredentials' in new XMLHttpRequest();
    Object.defineProperty(FEATURES, 'SUPPORT_CORS_XHR', { value });
    return value;
  },
};

export default FEATURES;
