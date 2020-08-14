import React from 'react';
import { View, KeyboardAvoidingView } from 'react-native';
import { useSelector } from 'react-redux';
import {
  sendInReceiversSelector,
  receiversSelector,
} from '@src/redux/selectors/receivers';
import Header, { useSearchBox } from '@src/components/Header';
import { isIOS } from '@src/utils/platform';
import { useNavigationParam } from 'react-navigation-hooks';
import { DropdownMenu, KeyboardAwareScrollView } from '@src/components/core';
import { selectedPrivacySeleclor, accountSeleclor } from '@src/redux/selectors';
import { CONSTANT_KEYS } from '@src/constants';
import PropTypes from 'prop-types';
import { Item } from './FrequentReceivers';
import EmptyList from './FrequentReceivers.empty';
import { styledModal as styled } from './FrequentReceivers.styled';
import { filterAddressByKey } from './FrequentReceivers.utils';

const ListReceivers = (props) => {
  const { receivers, isEmpty } = props;
  const onSelectedItem = useNavigationParam('onSelectedItem');
  const onSelectedAddress = async (receiver = { name: '', address: '' }) => {
    if (typeof onSelectedItem === 'function') {
      return onSelectedItem(receiver);
    }
  };
  if (isEmpty) {
    return <EmptyList />;
  }
  return (
    <KeyboardAwareScrollView
      style={{
        paddingTop: 42,
        paddingBottom: 50,
      }}
    >
      {receivers?.map((receiver, index, arr) => (
        <DropdownMenu
          sections={[receiver]}
          renderItem={({ item, index }) => {
            const firstChild = index === 0;
            let containerStyled = null;
            if (firstChild) {
              containerStyled = {
                marginTop: 15,
              };
            }
            return (
              <Item
                {...{
                  ...item,
                  containerStyled,
                  onPress: () => onSelectedAddress(item),
                }}
              />
            );
          }}
          key={index}
          style={{ marginBottom: 30 }}
        />
      ))}
    </KeyboardAwareScrollView>
  );
};

const ListAllReceivers = () => {
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const accounts = useSelector(accountSeleclor.listAccountSelector);
  const { receivers: sendInReceivers } = useSelector(receiversSelector)[
    CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK
  ];
  const keychainsAddresses = sendInReceivers.filter((receiver) =>
    accounts.some((account) => account?.paymentAddress === receiver?.address),
  );
  const incognitoAddress = sendInReceivers.filter(
    (receiver) =>
      !keychainsAddresses.some(
        (keychainReceiver) => keychainReceiver?.address === receiver?.address,
      ),
  );
  const { receivers: externalAddress } = useSelector(receiversSelector)[
    CONSTANT_KEYS.REDUX_STATE_RECEIVERS_OUT_NETWORK
  ];
  const extAddrFilBySelPrivacy = [
    ...externalAddress.filter(
      (item) => item?.networkName === selectedPrivacy?.networkName,
    ),
  ];
  const [_keychainsAddresses, keySearch] = useSearchBox({
    data: keychainsAddresses,
    handleFilter: () => filterAddressByKey(keychainsAddresses, keySearch),
  });
  const [_incognitoAddress] = useSearchBox({
    data: incognitoAddress,
    handleFilter: () => filterAddressByKey(incognitoAddress, keySearch),
  });
  const [_externalAddress] = useSearchBox({
    data: extAddrFilBySelPrivacy,
    handleFilter: () => filterAddressByKey(extAddrFilBySelPrivacy, keySearch),
  });
  const receivers = [
    {
      data: _keychainsAddresses,
      label: 'Your keychains',
    },
    {
      data: _incognitoAddress,
      label: 'Incognito addresses',
    },
    {
      data: _externalAddress,
      label: 'External addresses',
    },
  ];

  const isEmpty = receivers.length === 0;
  const isPlatformIOS = isIOS();
  const Wrapper = isPlatformIOS ? KeyboardAvoidingView : View;
  return (
    <View style={styled.container}>
      <Header
        title="Search by name or address"
        style={styled.header}
        canSearch
      />
      <Wrapper
        behavior="padding"
        keyboardVerticalOffset={25}
        style={{
          flex: 1,
          marginHorizontal: 25,
        }}
      >
        <ListReceivers {...{ receivers, isEmpty }} />
      </Wrapper>
    </View>
  );
};

ListReceivers.propTypes = {
  receivers: PropTypes.array.isRequired,
  isEmpty: PropTypes.bool.isRequired,
};

export default React.memo(ListAllReceivers);
