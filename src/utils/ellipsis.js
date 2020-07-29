import trimEnd from 'lodash/trimEnd';

export const ellipsisCenter = ({ str = '', limit = 10, dots = '...' } = {}) => {
  try {
    const size = str.length;
    if (size < limit * 2 + dots.length) {
      return str;
    }
    const leftStr = str.substring(0, limit);
    const rightStr = str.substring(size - limit, size);
    return leftStr + dots + rightStr;
  } catch {
    return str;
  }
};

export const ellipsisTail = ({ str = '', limit = 10, dots = '...' } = {}) => {
  try {
    const size = str.length;
    if (size < limit) {
      return str;
    }
    const subString = str.substring(0, limit - dots.length);
    const result = trimEnd(subString) + dots;
    return result;
  } catch {
    return str;
  }
};
