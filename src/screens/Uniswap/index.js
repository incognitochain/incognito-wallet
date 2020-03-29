import React, { useEffect, useState } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {DEX} from '@utils/dex';
import {ExHandler} from '@services/exception';
import {accountSeleclor, selectedPrivacySeleclor} from '@src/redux/selectors';
import {getAllTradingTokens} from '@services/trading';
import {useNavigation} from 'react-navigation-hooks';
import accountService from '@services/wallet/accountService';
import {addHistory, getHistories, updateHistory, getHistoryStatus} from '@src/redux/actions/uniswap';
import {ActivityIndicator} from '@components/core/index';
import FullScreenLoading from '@components/FullScreenLoading/index';
import Uniswap from './Uniswap';

const UniswapContainer = () => {
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState([]);
  const [dexMainAccount, setDexMainAccount] = useState(null);
  const [dexWithdrawAccount, setDexWithdrawAccount] = useState(null);
  const [scAddress, setScAddress] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const { wallet, account, selectPrivacyByTokenID, histories } = useSelector(state => ({
    account: accountSeleclor.defaultAccount(state),
    wallet: state.wallet,
    selectPrivacyByTokenID: selectedPrivacySeleclor.getPrivacyDataByTokenID(state),
    histories: state.uniswap.histories,
  }));
  const navigation = useNavigation();

  const loadAccount = async () => {
    const accounts = await wallet.listAccount();
    const dexMainAccount = accounts.find(item => item.AccountName === DEX.MAIN_ACCOUNT);
    const dexWithdrawAccount = accounts.find(item => item.AccountName === DEX.WITHDRAW_ACCOUNT);
    setDexMainAccount(dexMainAccount);
    setDexWithdrawAccount(dexWithdrawAccount);
    setAccounts(accounts);

    const scAddress = await accountService.generateIncognitoContractAddress(wallet, dexMainAccount);
    setScAddress(scAddress);
  };

  const loadData = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);
      const tokens = await getAllTradingTokens();
      setTokens(tokens);

      onGetHistories();
    } catch(error) {
      new ExHandler(error).showErrorToast();
    } finally {
      setLoading(false);
    }
  };
  const dispatch = useDispatch();

  const onAddHistory = (history) => {
    dispatch(addHistory(history));
  };

  const onUpdateHistory = (history) => {
    dispatch(updateHistory(history));
  };

  const onGetHistoryStatus = (history) => {
    dispatch(getHistoryStatus(history));
  };

  const onGetHistories = () => {
    dispatch(getHistories());
  };

  useEffect(() => {
    loadAccount();
    loadData();
  }, []);

  if (!dexMainAccount) {
    return <ActivityIndicator size="small" />;
  }

  return (
    <Uniswap
      wallet={wallet}
      navigation={navigation}
      histories={histories}
      onAddHistory={onAddHistory}
      onUpdateHistory={onUpdateHistory}
      onGetHistoryStatus={onGetHistoryStatus}
      onGetHistories={onGetHistories}
      onSelectPrivacyByTokenID={selectPrivacyByTokenID}
      dexMainAccount={dexMainAccount}
      dexWithdrawAccount={dexWithdrawAccount}
      accounts={accounts}
      tokens={tokens}
      onLoadData={loadData}
      isLoading={loading}
      account={account}
      scAddress={scAddress}
    />
  );
};

export default UniswapContainer;
