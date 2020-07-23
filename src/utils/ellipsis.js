export const ellipsisCenter = ({ str = '', limit = 10, dots = '...' } = {}) => {
  const size = str.length;
  if (size < limit * 2 + dots.length) {
    return str;
  }
  const leftStr = str.substring(0, limit);
  const rightStr = str.substring(size - limit, size);
  return leftStr + dots + rightStr;
};

export const ellipsisTail = ({ str = '', limit = 10, dots = '...' } = {}) => {
  const size = str.length;
  if (size < limit) {
    return str;
  }
  const result = str.substring(0, limit - dots.length).trimEnd() + dots;
  console.log(result);
  return result;
};
