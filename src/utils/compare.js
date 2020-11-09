import _ from 'lodash';

export const compareTextLowerCase = (text1, text2) => {
  return _.toLower(text1) === _.toLower(text2);
};
