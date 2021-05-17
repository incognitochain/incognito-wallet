import React, { useMemo } from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { groupBy, forEach } from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { receiversSelector } from '@src/redux/selectors/receivers';
import { selectedPrivacySelector, accountSelector } from '@src/redux/selectors';
import { CONSTANT_KEYS } from '@src/constants';
import { isIOS } from '@src/utils/platform';
import { View, KeyboardAvoidingView } from 'react-native';
import { useSearchBox } from '@src/components/Header';
import { useNavigationParam, useFocusEffect } from 'react-navigation-hooks';
import { actionRemoveSelectedReceiver } from '@src/redux/actions/receivers';
import { listAllMasterKeyAccounts } from '@src/redux/selectors/masterKey';
import accountService from '@services/wallet/accountService';
import { filterAddressByKey } from './FrequentReceivers.utils';

const enhance = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const accounts = useSelector(listAllMasterKeyAccounts);
  const defaultAccount = useSelector(accountSelector?.defaultAccountSelector);
  const filterBySelectedPrivacy = !!useNavigationParam(
    'filterBySelectedPrivacy',
  );
  const { receivers: incognitoAddress } = useSelector(receiversSelector)[
    CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK
  ];
  const { receivers: externalAddress } = useSelector(receiversSelector)[
    CONSTANT_KEYS.REDUX_STATE_RECEIVERS_OUT_NETWORK
  ];
  const incognitoAddresses = incognitoAddress.filter(
    (item) => item?.address !== defaultAccount?.paymentAddress,
  );
  const extAddrFilBySelPrivacy = [
    ...externalAddress.filter((item) =>
      filterBySelectedPrivacy
        ? item?.rootNetworkName === selectedPrivacy?.rootNetworkName
        : true,
    ),
  ];

  // eslint-disable-next-line no-unused-vars
  const [_, keySearch] = useSearchBox({
    data: [],
    handleFilter: () => filterAddressByKey([], keySearch),
  });

  const accountGroupByMasterKey = useMemo(() =>
    groupBy(accounts, item => item.MasterKeyName),
  [accounts]);

  const receivers = [];
  forEach(accountGroupByMasterKey, (accounts, masterKeyName) => {
    const keychainsAddresses = accounts
      .filter(
        (account) => accountService.getPaymentAddress(account) !== accountService.getPaymentAddress(defaultAccount),
      )
      .map((item) => ({
        name: accountService.getAccountName(item),
        address: accountService.getPaymentAddress(item),
      }));
    const [_keychainsAddresses] = useSearchBox({
      data: keychainsAddresses,
      handleFilter: () => filterAddressByKey(keychainsAddresses, keySearch),
    });

    if (_keychainsAddresses.length > 0) {
      receivers.push({
        data: _keychainsAddresses,
        label: masterKeyName,
        keySave: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK,
      });
    }
  });

  const [_incognitoAddress] = useSearchBox({
    data: incognitoAddresses,
    handleFilter: () => filterAddressByKey(incognitoAddress, keySearch),
  });
  const [_externalAddress] = useSearchBox({
    data: extAddrFilBySelPrivacy,
    handleFilter: () => filterAddressByKey(extAddrFilBySelPrivacy, keySearch),
  });

  receivers.push(...[
    {
      data: _incognitoAddress,
      label: 'Incognito addresses',
      keySave: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK,
    },
    {
      data: _externalAddress,
      label: 'External addresses',
      keySave: CONSTANT_KEYS.REDUX_STATE_RECEIVERS_OUT_NETWORK,
    },
  ]);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(actionRemoveSelectedReceiver());
    }, []),
  );

  const isEmpty = receivers.length === 0;
  const isPlatformIOS = isIOS();
  const Wrapper = isPlatformIOS ? KeyboardAvoidingView : View;
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, Wrapper, isEmpty, receivers }} />
    </ErrorBoundary>
  );
};

export default enhance;
