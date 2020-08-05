import React from 'react';
import { formValueSelector } from 'redux-form';
import { searchBoxConfig } from '@src/components/Header/Header.searchBox';
import { useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import toLower from 'lodash/toLower';

export const useSearchBox = (props) => {
  const { data, handleFilter } = props;
  const initialState = {
    result: [],
  };
  const selector = formValueSelector(searchBoxConfig.form);
  const keySearch = toLower(
    (
      useSelector((state) => selector(state, searchBoxConfig.searchBox)) || ''
    ).trim(),
  );
  const [state, setState] = React.useState(initialState);
  const { result } = state;
  const initData = async () =>
    await setState({ ...initialState, result: handleFilter() });
  const filterData = async () => {
    if (!isEmpty(keySearch)) {
      return await setState({ ...initialState, result: handleFilter() });
    }
    if (!isEmpty(data)) {
      return await initData();
    }
  };
  React.useEffect(() => {
    filterData();
  }, [keySearch, data]);
  return [result, keySearch];
};

useSearchBox.defaultProps = {};

useSearchBox.propTypes = {
  data: PropTypes.array.isRequired,
  handleFilter: PropTypes.func.isRequired,
};
