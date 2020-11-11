import {
  tokenSeleclor,
  selectedPrivacySeleclor,
  accountSeleclor,
} from '@src/redux/selectors';
import { useSelector } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { useFocusEffect } from 'react-navigation-hooks';
import { tokensFollowedSelector } from '@src/redux/selectors/token';
import { walletSelector } from '@src/redux/selectors/wallet';

export const useHistoryList = (props) => {
  const { handleLoadHistory } = props;
  const wallet = useSelector(walletSelector);
  const followed = useSelector(tokensFollowedSelector);
  const account = useSelector(accountSeleclor.defaultAccountSelector);
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const receiveHistory = useSelector(tokenSeleclor.receiveHistorySelector);
  const { notEnoughData, showEmpty, refreshing } = receiveHistory;
  const { histories } = useSelector(tokenSeleclor.historyTokenSelector);
  React.useEffect(() => {
    if (notEnoughData) {
      handleLoadHistory(false);
    }
  }, [histories, receiveHistory]);
  useFocusEffect(
    React.useCallback(() => {
      handleLoadHistory(true);
    }, [selectedPrivacy, account, followed, wallet]),
  );
  return [showEmpty, refreshing];
};

useHistoryList.propTypes = {
  handleLoadHistory: PropTypes.func.isRequired,
};
