import React, { useEffect } from 'react';
import { ExHandler } from '@services/exception';
import { MESSAGES } from '@src/constants';
import { useDispatch, useSelector } from 'react-redux';
import {
  actionChangeInputText,
  actionUpdateLoadingPair,
  actionUpdatePairData,
} from '@screens/DexV2/components/Trade/TradeV2/Trade.actions';
import { getPairsData } from '@screens/DexV2/components/DexV2.utils';
import { tradeSelector } from '@screens/DexV2/components/Trade/TradeV2/Trade.selector';
import { accountSelector } from '@src/redux/selectors';
import { walletSelector } from '@src/redux/selectors/wallet';
import { accountServices } from '@src/services/wallet';

const withPairs = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const { inputText, isERC20 } = useSelector(tradeSelector);
  const defaultAccount = useSelector(accountSelector.defaultAccountSelector);
  const wallet = useSelector(walletSelector);
  const loadPairs = async () => {
    try {
      const account = accountServices.getAccount(defaultAccount, wallet);
      /** Load new trading fee if isERC20 when pull refresh */
      if (inputText && inputText !== '0' && !isERC20) {
        dispatch(actionChangeInputText(inputText));
      }
      dispatch(actionUpdateLoadingPair(true));
      const payload = await getPairsData({ account });
      dispatch(actionUpdatePairData(payload));
    } catch (error) {
      new ExHandler(error, MESSAGES.CAN_NOT_GET_PDEX_DATA).showErrorToast();
    } finally {
      dispatch(actionUpdateLoadingPair(false));
    }
  };
  useEffect(() => {
    loadPairs();
  }, []);
  return (
    <WrappedComp
      {...{
        ...props,

        onLoadPairs: loadPairs,
      }}
    />
  );
};

export default withPairs;
