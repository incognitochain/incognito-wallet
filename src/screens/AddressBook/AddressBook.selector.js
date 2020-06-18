import { createSelector } from 'reselect';

export const addressBookSelector = createSelector(
  (state) => state.addressBook,
  (addressBook) => {
    const { data, ...rest } = addressBook;
    return {
      ...rest,
      data: [...Object.keys(data).map((key) => ({ ...data[key] }))].sort(
        (a, b) => a?.name.localeCompare(b?.name),
      ),
    };
  },
);

export const addressBookByIdSelector = createSelector(
  (state) => state?.addressBook?.data || {},
  (data) => (id) => data[id] || null,
);
