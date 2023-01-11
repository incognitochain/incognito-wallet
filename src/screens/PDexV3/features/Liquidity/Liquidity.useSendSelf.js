import React from 'react';
import accountService from '@services/wallet/accountService';
import {
  ACCOUNT_CONSTANT,
  PrivacyVersion,
  PRVIDSTR
} from 'incognito-chain-web-js/build/wallet';
import { useSelector } from 'react-redux';
import { walletSelector } from '@src/redux/selectors/wallet';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { MESSAGES } from '@screens/Dex/constants';
import { Text } from '@components/core';
import { CONSTANT_KEYS , CONSTANT_COMMONS } from '@src/constants';
import routeNames from '@routers/routeNames';
import { useNavigation } from 'react-navigation-hooks';
import styled from '@screens/PDexV3/features/Liquidity/Liquidity.styled';
import { ExHandler } from '@services/exception';


const useSendSelf = ({ error, setLoading, setError }) => {
  const wallet = useSelector(walletSelector);
  const account = useSelector(defaultAccountSelector);
  const navigation = useNavigation();

  const handleSendMainCrypto = async () => {
    try {
      setLoading(true);
      const amount = ACCOUNT_CONSTANT.MAX_FEE_PER_TX * 2;
      const fee = ACCOUNT_CONSTANT.MAX_FEE_PER_TX;
      const toAddress = account.paymentAddress;
      const res = await accountService.createAndSendNativeToken({
        wallet,
        account,
        fee,
        info: '',
        prvPayments: [
          {
            PaymentAddress: toAddress,
            Amount: amount,
            Message: 'message',
          },
        ],
        txType: ACCOUNT_CONSTANT.TX_TYPE.SEND,
        version: PrivacyVersion.ver2,
      });
      if (res) {
        const params = {
          ...res,
          originalAmount: amount,
          fee,
          feeUnit: '',
          title: 'Sent.',
          toAddress,
          pDecimals: CONSTANT_COMMONS.PRV?.pDecimals,
          tokenSymbol: CONSTANT_COMMONS.PRV.symbol,
          keySaveAddressBook: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK,
          onGoBack: () => navigation.navigate(routeNames.MainTabBar)
        };
        setTimeout(() => {
          navigation.navigate(routeNames.Receipt, { params });
        }, 1000);
      }
      setLoading(false);
    } catch (e) {
      console.log('[handleSendMainCrypto] ERROR: ', e);
      setError(new ExHandler(error).getMessage(error?.message));
      setLoading(false);
    }
  };

  return React.useMemo(() => {
    let _errorMessage = error || '';
    if (
      typeof _errorMessage === 'string'
      && (_errorMessage.includes('-3001') || _errorMessage.includes('Faucet') || _errorMessage.includes(MESSAGES.NOT_ENOUGH_PRV_NETWORK_FEE))
    ) {
      return (
        <Text style={styled.warning} onPress={handleSendMainCrypto}>
          You need 2 UTXOs to contribute liquidity. Simply tap here to&nbsp;
          <Text style={[styled.warning, { textDecorationLine: 'underline' }]}>split a UTXO.</Text>
        </Text>
      );
    }
    return _errorMessage;
  }, [error]);
};

export default useSendSelf;
