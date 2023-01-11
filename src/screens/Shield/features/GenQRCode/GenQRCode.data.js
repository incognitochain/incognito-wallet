import {
  actionFetch as fetchDataShield,
  actionPortalFetch as fetchPortalDataShield,
  actionReset,
} from '@screens/Shield/Shield.actions';
import {
  shieldDataSelector,
  shieldSelector,
} from '@screens/Shield/Shield.selector';
import { wcProviderOptionals } from '@screens/Wallet/features/BridgeConnect';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { setChildSelectedPrivacy } from '@src/redux/actions/childSelectedPrivacy';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import { actionAddFollowToken } from '@src/redux/actions/token';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { getDefaultAccountWalletSelector } from '@src/redux/selectors/shared';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';
import WalletConnectProvider from '@walletconnect/react-native-dapp';
import React from 'react';
import { useNavigationParam } from 'react-navigation-hooks';
import { batch, useDispatch } from 'react-redux';
import SelectedPrivacy from '@models/selectedPrivacy';

const enhance = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const account = useDebounceSelector(defaultAccountSelector);
  const accountWallet = useDebounceSelector(getDefaultAccountWalletSelector);
  const token =  useNavigationParam('tokenShield') || {};
  const tokenShield = token?.isSelectedPrivacyModal ? token : new SelectedPrivacy(
    account,
    {},
      token,
      token.tokenId,
  );

  const parentTokenShield = useNavigationParam('parentTokenShield') || {};
  const tokenSymbol = tokenShield?.externalSymbol || tokenShield?.symbol;
  const { tokenId } = tokenShield;
  const { decentralized } = useDebounceSelector(shieldDataSelector);
  const { isFetching, isFetched, isFetchFailed, isPortalCompatible, data } =
    useDebounceSelector(shieldSelector);
  const handleShield = async () => {
    const isPortalToken = await accountWallet.handleCheckIsPortalToken({
      tokenID: tokenId,
    });
    if (isPortalToken) {
      dispatch(
        fetchPortalDataShield({
          tokenID: tokenId,
          selectedPrivacy: tokenShield,
          account,
          accountWallet,
        }),
      );
    } else {
      dispatch(
        fetchDataShield({ tokenId, selectedPrivacy: tokenShield, account }),
      );
    }
  };

  const handleUpdateTokenSelector = () => {
    batch(() => {
      dispatch(setSelectedPrivacy(parentTokenShield?.tokenId));
      dispatch(setChildSelectedPrivacy(tokenShield));
      dispatch(actionAddFollowToken(parentTokenShield?.tokenId));
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
