export const LENGTH_TYPE = {
  PX: 0,
  PERCENTAGE: 1,
};

export default class Length {
  constructor(value) {
    this.type =
      value.substr(value.length - 1) === '%'
        ? LENGTH_TYPE.PERCENTAGE
        : LENGTH_TYPE.PX;
    const parsedValue = parseFloat(value);

    this.value = isNaN(parsedValue) ? 0 : parsedValue;
  }

  isPercentage() {
    return this.type === LENGTH_TYPE.PERCENTAGE;
  }

  getAbsoluteValue(parentLength) {
    return this.isPercentage() ? parentLength * (this.value / 100) : this.value;
  }

  static create(v) {
    return new Length(v);
  }
}

const getRootFontSize = (container) => {
  const { parent } = container;
  return parent
    ? getRootFontSize(parent)
    : parseFloat(container.style.font.fontSize);
};

export const calculateLengthFromValueWithUnit = (container, value, unit) => {
  switch (unit) {
    case 'px':
    case '%':
      return new Length(value + unit);
    case 'em':
    case 'rem': {
      const length = new Length(value);
      length.value *=
        unit === 'em'
          ? parseFloat(container.style.font.fontSize)
          : getRootFontSize(container);
      return length;
    }
    default:
      return new Length('0');
  }
};
