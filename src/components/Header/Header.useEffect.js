import React from 'react';
import { formValueSelector } from 'redux-form';
import { searchBoxConfig } from '@src/components/Header/Header.searchBox';
import { useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import lowerCase from 'lodash/lowerCase';

export const useSearchBox = props => {
  const { data, handleFilter } = props;
  const initialState = {
    result: [],
  };
  const selector = formValueSelector(searchBoxConfig.form);
  const keySearch = lowerCase(
    (
      useSelector(state => selector(state, searchBoxConfig.searchBox)) || ''
    ).trim(),
  );
  const [state, setState] = React.useState(initialState);
  const { result } = state;
  const initData = async () =>
    await setState({ ...initialState, result: [...data] });
  const filterData = async () => {
    if (!isEmpty(keySearch)) {
      return await setState({ ...initialState, result: handleFilter() });
    }
    await initData();
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

// const initData = async () =>
//   await setState({ ...initialState, result: [...data].slice(0, limit) });
// const onScrollToEnd = async () =>
//   loading || oversize || !isEmpty(keySearch)
//     ? null
//     : await setState({ ...state, page: page + 1, loading: true });
// const onScrollToEnd = () => null;
// const fetchData = async () => {
//   if (oversize) {
//     return;
//   }
//   const start = (page - 1) * limit;
//   const end = page * limit;
//   const nextResult = data.slice(start, end);
//   const newResult = [...result, ...nextResult];
//   const oversize = nextResult.length < limit;
//   await setState({
//     ...state,
//     result: [...newResult],
//     loading: false,
//     oversize,
//   });
// };
// React.useEffect(() => {
//   if (page !== 1) {
//     fetchData();
//   }
// }, [page]);
