import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useSelector, useDispatch, batch } from 'react-redux';
import { ExHandler } from '@src/services/exception';
import { getPTokenList, getInternalTokenList } from '@src/redux/actions/token';
import { actionFree } from '@src/redux/actions/history';
import { actionReloadFollowingToken } from '@src/redux/actions/account';
import { CONSTANT_KEYS } from '@src/constants';
import { useFocusEffect } from 'react-navigation-hooks';
import {
  unShieldStorageDataSelector,
  actionRemoveStorageDataDecentralized,
  actionRemoveStorageDataCentralized,
} from '@src/screens/UnShield';
import { withdraw, updatePTokenFee } from '@src/services/api/withdraw';
import { accountSelector } from '@src/redux/selectors';
import { compose } from 'recompose';
import { withLayout_2 } from '@components/Layout';

export const WalletContext = React.createContext({});

const enhance = (WrappedComp) => (props) => {
  const wallet = useSelector((state) => state?.wallet);
  const unshieldStorage = useSelector(unShieldStorageDataSelector);
  const signPublicKeyEncode = useSelector(
    accountSelector.signPublicKeyEncodeSelector,
  );
  const dispatch = useDispatch();
  const [isReloading, setIsReloading] = React.useState(false);
  const retryLastTxsUnshieldDecentralized = async () => {
    try {
      const keyUnshieldDecentralized =
        CONSTANT_KEYS.UNSHIELD_DATA_DECENTRALIZED;
      const txs = unshieldStorage[keyUnshieldDecentralized]?.txs || [];
      txs &&
        txs.map(async (tx) => {
          if (tx) {
            dispatch(
              actionRemoveStorageDataDecentralized({
                keySave: keyUnshieldDecentralized,
                burningTxId: tx?.burningTxId,
              }),
            );
            withdraw({ ...tx, signPublicKeyEncode });
          }
        });
    } catch (e) {
      console.log('error', e);
    }
  };
  const retryLastTxsUnshieldCentralized = async () => {
    try {
      const keyUnshieldCentralized = CONSTANT_KEYS.UNSHIELD_DATA_CENTRALIZED;
      const txs = unshieldStorage[keyUnshieldCentralized]?.txs || [];
      txs &&
        txs.map(async (tx) => {
          if (tx) {
            dispatch(
              actionRemoveStorageDataCentralized({
                keySave: keyUnshieldCentralized,
                txId: tx?.txId,
              }),
            );
            updatePTokenFee({ ...tx, signPublicKeyEncode });
          }
        });
    } catch (e) {
      console.log('error', e);
    }
  };
  const onRefresh = async () => {
    try {
      await setIsReloading(true);
      batch(() => {
        dispatch(getPTokenList());
        dispatch(getInternalTokenList());
        dispatch(actionReloadFollowingToken(true));
        retryLastTxsUnshieldDecentralized();
        retryLastTxsUnshieldCentralized();
      });
    } catch (error) {
      new ExHandler(error).showErrorToast();
    } finally {
      await setIsReloading(false);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      dispatch(actionFree());
    }, []),
  );
  return (
    <ErrorBoundary>
      <WalletContext.Provider
        value={{
          walletProps: {
            ...props,
            wallet,
            isReloading,
            onRefresh,
          },
        }}
      >
        <WrappedComp
          {...{
            ...props,
            wallet,
            isReloading,
            onRefresh,
          }}
        />
      </WalletContext.Provider>
    </ErrorBoundary>
  );
};

export default compose(
  withLayout_2,
  enhance,
);
