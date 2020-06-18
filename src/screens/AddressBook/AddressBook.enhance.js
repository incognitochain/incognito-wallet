import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { compose } from 'recompose';
import { useSearchBox } from '@src/components/Header';
import { useSelector } from 'react-redux';
import includes from 'lodash/includes';
import toLower from 'lodash/toLower';
import { addressBookSelector } from './AddressBook.selector';

const enhance = (WrappedComp) => (props) => {
  const { data } = useSelector(addressBookSelector);
  const [result, keySearch] = useSearchBox({
    data,
    handleFilter: () =>
      data.filter(
        (item) =>
          includes(toLower(item?.name), keySearch) ||
          includes(toLower(item?.address), keySearch),
      ),
  });
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, data: result }} />
    </ErrorBoundary>
  );
};

export default compose(enhance);
