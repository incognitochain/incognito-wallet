import React from 'react';
import { formValueSelector } from 'redux-form';
import { searchBoxConfig } from '@src/components/Header/Header.searchBox';
import { useSelector } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';
import toLower from 'lodash/toLower';
import { trim } from 'lodash';

export const useSearchBox = (props) => {
  const { data, handleFilter } = props;
  const initialState = {
    result: [],
  };
  const selector = formValueSelector(searchBoxConfig.form);
  const keySearch = trim(
    toLower(
      useSelector((state) => selector(state, searchBoxConfig.searchBox)) || '',
    ),
  );
  const isKeyEmpty = isEmpty(keySearch);
  const [state, setState] = React.useState(initialState);
  const { result } = state;
  React.useEffect(() => {
    if (!isEmpty(keySearch)) {
      return setState({ ...state, result: handleFilter() });
    }
  }, [keySearch]);

  return [isKeyEmpty ? data : result, keySearch];
};

useSearchBox.defaultProps = {};

useSearchBox.propTypes = {
  data: PropTypes.array.isRequired,
  handleFilter: PropTypes.func.isRequired,
};
