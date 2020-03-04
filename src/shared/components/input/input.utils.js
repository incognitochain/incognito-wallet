import isEmpty from 'lodash/isEmpty';

const noError = {
  error: false,
  message: '',
};

export const validateNotEmpty = value => {
  if (isEmpty(value)) {
    return {
      error: true,
      message: 'Required!',
    };
  }
  return noError;
};
