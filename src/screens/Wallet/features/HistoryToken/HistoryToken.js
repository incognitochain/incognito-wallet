import React from 'react';
import PropTypes from 'prop-types';
import HistoryList from '@src/components/HistoryList';
import { useSelector } from 'react-redux';
import { tokenSeleclor } from '@src/redux/selectors';
import withHistoryToken from './HistoryToken.enhance';

const HistoryToken = props => {
  const { histories } = useSelector(tokenSeleclor.historyTokenSelector);
  const { handleCancelEtaHistory } = props;
  return (
    <HistoryList
      histories={histories}
      onCancelEtaHistory={handleCancelEtaHistory}
    />
  );
};

HistoryToken.propTypes = {
  handleCancelEtaHistory: PropTypes.func.isRequired,
};

export default withHistoryToken(HistoryToken);
