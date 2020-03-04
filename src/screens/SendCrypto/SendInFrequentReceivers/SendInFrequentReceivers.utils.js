import LocalDatabase from '@src/utils/LocalDatabase';

export const isFieldExist = async (field = '', value = '', message = '') => {
  const receivers = await LocalDatabase.getFrequentReceivers();
  const isExist = receivers.some(item => item[field] === value);
  if (isExist) {
    return {
      error: true,
      message,
    };
  }
  return {
    error: false,
    message: '',
  };
};
