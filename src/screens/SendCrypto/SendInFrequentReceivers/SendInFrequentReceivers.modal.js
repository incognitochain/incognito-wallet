import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import _ from 'lodash';
import SearchInput from '@src/components/Input/input.search';
import PropTypes from 'prop-types';
import {ExHandler} from '@src/services/exception';
import {useNavigationParam, useNavigation} from 'react-navigation-hooks';
import {Button} from '@src/components/core';
import srcNotFound from '@src/assets/images/icons/not_found_receiver.png';
import ReceiverIcon from '@src/components/Icons/icon.receiver';
import {isIOS} from '@utils/platform';
import {
  styledModal as styled,
  emptyListStyled,
  listStyled,
  itemStyled,
} from './SendInFrequentReceivers.styled';

const Item = ({name, address, ...rest}) => {
  return (
    <TouchableOpacity {...rest}>
      <View style={itemStyled.container}>
        <ReceiverIcon />
        <View style={itemStyled.hook}>
          <Text style={itemStyled.name}>{name}</Text>
          <Text
            style={itemStyled.address}
            ellipsizeMode="middle"
            numberOfLines={1}
          >
            {address}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const List = ({onSelectedAddress, receivers}) => {
  return (
    <View style={listStyled.container}>
      <ScrollView>
        <Text style={listStyled.all}>All</Text>
        {receivers.map((item, key) => (
          <Item
            key={key}
            {...item}
            onPress={() => {
              onSelectedAddress(item?.address);
            }}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const EmptyList = ({onSelectedAddress, address}) => {
  return (
    <View style={emptyListStyled.container}>
      <View style={emptyListStyled.hook}>
        <Image source={srcNotFound} style={emptyListStyled.notFoundImg} />
        <Text style={emptyListStyled.notFound}>Not found</Text>
      </View>
      <Button
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
        }}
        title="Use this address"
        onPress={() => onSelectedAddress(address)}
      />
    </View>
  );
};

const Modal = () => {
  const navigation = useNavigation();
  const [state, setState] = React.useState({
    data: [],
    keySearch: '',
  });
  const receivers = useNavigationParam('receivers');
  const onSelectedItem = useNavigationParam('onSelectedItem');
  const {data, keySearch} = state;
  const initData = async () => {
    try {
      await setState({...state, data: [...receivers]});
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const searchByKey = async () => {
    try {
      const key = keySearch.trim().toLowerCase();
      if (key.length === 0) {
        return await setState({
          ...state,
          data: [...receivers],
        });
      }
      return await setState({
        ...state,
        data: [
          ...receivers.filter(
            item =>
              _.includes(item?.name.toLowerCase(), key) ||
              _.includes(item?.address.toLowerCase(), key),
          ),
        ],
      });
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const onSelectedAddress = address => {
    navigation.goBack();
    onSelectedItem(address);
  };
  const onClearAddress = async () => {
    await setState({
      ...state,
      keySearch: '',
    });
  };
  React.useEffect(() => {
    searchByKey();
  }, [keySearch]);
  React.useEffect(() => {
    initData();
  }, []);
  const isPlatformIOS = isIOS();
  const Wrapper = isPlatformIOS ? KeyboardAvoidingView : View;
  return (
    <View style={styled.container}>
      <SearchInput
        autoFocus
        value={keySearch}
        onChangeText={keySearch => setState({...state, keySearch})}
        placeholder="Type name or address"
        onClearText={onClearAddress}
      />
      <Wrapper
        style={{
          flex: 1,
        }}
        behavior="padding"
        keyboardVerticalOffset={120}
      >
        {data.length > 0 ? (
          <List onSelectedAddress={onSelectedAddress} receivers={data} />
        ) : (
          <EmptyList
            onSelectedAddress={onSelectedAddress}
            address={keySearch}
          />
        )}
      </Wrapper>
    </View>
  );
};

Item.propTypes = {
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
};

List.propTypes = {
  onSelectedAddress: PropTypes.func.isRequired,
  receivers: PropTypes.array.isRequired,
};

Modal.propTypes = {};

export default Modal;
