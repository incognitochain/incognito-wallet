export const isExist = (addressBook, data) =>
  Object.keys(data).some(
    (key) =>
      data[key]?.address === addressBook?.address ||
      data[key]?.name === addressBook?.name,
  );

export const isExistByField = (field, value, data) =>
  Object.keys(data).some((key) => data[key][field] === value);
