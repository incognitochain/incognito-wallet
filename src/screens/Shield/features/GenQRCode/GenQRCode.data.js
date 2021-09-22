import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useNavigationParam } from 'react-navigation-hooks';
import { batch, useDispatch, useSelector } from 'react-redux';
import {
  shieldDataSelector,
  shieldSelector,
} from '@screens/Shield/Shield.selector';
import { actionFetch as fetchDataShield, actionPortalFetch as fetchPortalDataShield, actionReset } from '@screens/Shield/Shield.actions';
import { wcProviderOptionals } from '@screens/Wallet/features/BridgeConnect';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import { actionAddFollowToken } from '@src/redux/actions/token';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { getDefaultAccountWalletSelector } from '@src/redux/selectors/shared';

const enhance = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const account = useSelector(defaultAccountSelector);
  const accountWallet = useSelector(getDefaultAccountWalletSelector);
  const tokenShield = useNavigationParam('tokenShield') || {};
  const tokenSymbol = tokenShield?.externalSymbol || tokenShield?.symbol;
  const { tokenId } = tokenShield;
  const { decentralized } = useSelector(shieldDataSelector);
  const { isFetching, isFetched, isFetchFailed, isPortalCompatible, data } = useSelector(shieldSelector);
  const handleShield = async () => {
    const isPortalToken  = await accountWallet.handleCheckIsPortalToken({ tokenID: tokenId});
    if( isPortalToken ){
      dispatch(
        fetchPortalDataShield({ tokenID: tokenId, selectedPrivacy: tokenShield, account, accountWallet }),
      );
    } else {
      dispatch(
        fetchDataShield({ tokenId, selectedPrivacy: tokenShield, account }),
      );
    }
  };
  
  const handleUpdateTokenSelector = () => {
    batch(() => {
      dispatch(setSelectedPrivacy(tokenId));
      dispatch(actionAddFollowToken(tokenId));
    });
  };

  React.useEffect(() => {
    setTimeout(() => {
      handleUpdateTokenSelector();
    }, 1000);

    // reset shield data when unmounting
    return () => {
      dispatch(actionReset());
    };
  }, []);
  return (
    <WalletConnectProvider {...wcProviderOptionals}>
      <ErrorBoundary>
        <WrappedComp
          {...{
            ...props,
            tokenId,
            tokenSymbol,
            selectedPrivacy: tokenShield,
            isFetching,
            isFetched,
            data,
            isFetchFailed,
            decentralized,
            tokenShield,
            handleShield,
            isPortalCompatible,
          }}
        />
      </ErrorBoundary>
    </WalletConnectProvider>
  );
};

export default enhance;
