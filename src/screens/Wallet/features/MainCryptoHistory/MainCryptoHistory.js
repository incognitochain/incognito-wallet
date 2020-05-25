import React from 'react';
import HistoryList from '@src/components/HistoryList';
import { useSelector } from 'react-redux';
import { tokenSeleclor } from '@src/redux/selectors';
import withMainCryptoHistory from './MainCryptoHistory.enhance';

const MainCryptoHistory = props => {
  const { histories } = useSelector(tokenSeleclor.historyTokenSelector);
  return <HistoryList histories={histories} />;
};

MainCryptoHistory.propTypes = {};

export default withMainCryptoHistory(MainCryptoHistory);
