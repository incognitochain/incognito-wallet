import storage from '@services/storage';

const getKeyStorageError = () => {
  return '$STORAGE_ERROR_LOAD_WALLET';
};

export const getStorageLoadWalletError = async () => {
  const key = getKeyStorageError();
  const result = (await storage.getItem(key)) || '[]';
  return JSON.parse(result);
};

export const setStorageLoadWalletError = async (data) => {
  const key = getKeyStorageError();
  await storage.setItem(key, JSON.stringify(data));
};
