import {
  tokenSelector,
  selectedPrivacySelector,
  accountSelector,
} from '@src/redux/selectors';
import { useSelector } from 'react-redux';
import React from 'react';
import PropTypes from 'prop-types';
import { walletSelector } from '@src/redux/selectors/wallet';
import { switchAccountSelector } from '@src/redux/selectors/account';

export const useHistoryList = (props) => {
  const { handleLoadHistory, handleLoadBalance } = props;
  const wallet = useSelector(walletSelector);
  const account = useSelector(accountSelector.defaultAccountSelector);
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const receiveHistory = useSelector(tokenSelector.receiveHistorySelector);
  const switchAccount = useSelector(switchAccountSelector);
  const { notEnoughData, showEmpty, refreshing } = receiveHistory;
  const { histories } = useSelector(tokenSelector.historyTokenSelector);
  React.useEffect(() => {
    if (notEnoughData) {
      handleLoadHistory(false);
    }
  }, [histories, receiveHistory, notEnoughData]);
  React.useEffect(() => {
    if (!switchAccount) {
      handleLoadBalance();
      handleLoadHistory(true);
    }
  }, [selectedPrivacy.tokenId, account.PaymentAddress, wallet, switchAccount]);

  return [showEmpty, refreshing];
};

useHistoryList.propTypes = {
  handleLoadHistory: PropTypes.func.isRequired,
};
