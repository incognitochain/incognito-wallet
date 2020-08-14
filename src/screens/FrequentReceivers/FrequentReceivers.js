import React from 'react';
import { View, Text, Image, KeyboardAvoidingView } from 'react-native';
import PropTypes from 'prop-types';
import { ScrollView, TouchableOpacity } from '@src/components/core';
import Swipeout from 'react-native-swipeout';
import { BtnDelete } from '@src/components/Button';
import Header from '@src/components/Header';
import srcNotFound from '@src/assets/images/icons/not_found_receiver.png';
import { isIOS } from '@src/utils/platform';
import debounce from 'lodash/debounce';
import EmptyList from './FrequentReceivers.empty';
import {
  styledModal as styled,
  listStyled,
  itemStyled,
  notFoundStyled,
} from './FrequentReceivers.styled';
import withModal from './FrequentReceivers.enhance';

export const Item = ({
  name,
  address,
  disabledSwipe,
  _onDelete,
  isLastChild,
  containerStyled,
  ...rest
}) => {
  return (
    <Swipeout
      disabled={disabledSwipe}
      close
      autoClose
      right={[
        {
          component: <BtnDelete showIcon={false} onPress={_onDelete} />,
        },
      ]}
      style={{
        backgroundColor: 'transparent',
      }}
    >
      <TouchableOpacity {...rest}>
        <View style={[itemStyled.hook, containerStyled]}>
          <Text style={itemStyled.name}>{name}</Text>
          <Text
            style={itemStyled.address}
            ellipsizeMode="middle"
            numberOfLines={1}
          >
            {address}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeout>
  );
};

export const List = ({
  onSelectedAddress,
  receivers,
  disabledSwipe,
  onDelete,
  shouldDisabledItem,
  styledContainer = null,
  title = '',
}) => {
  const onPressItem = (item) => debounce(() => onSelectedAddress(item), 300);
  return (
    <View style={[listStyled.container, styledContainer]}>
      {!!title && <Text style={listStyled.title}>{title}</Text>}
      <ScrollView>
        {receivers.map((item, key, arr) => (
          <Item
            key={item?.name || key}
            {...{
              ...item,
              disabledSwipe,
              _onDelete: () => onDelete(item),
            }}
            onPress={onPressItem(item)}
            disabled={shouldDisabledItem}
            isLastChild={arr.length - 1 === key}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export const NotFound = () => {
  return (
    <View style={notFoundStyled.container}>
      <View style={notFoundStyled.hook}>
        <Image source={srcNotFound} style={notFoundStyled.notFoundImg} />
        <Text style={notFoundStyled.notFound}>Not found</Text>
      </View>
    </View>
  );
};

export const Modal = (props) => {
  const {
    data,
    onSelectedAddress,
    disabledSwipe,
    onDelete,
    shouldDisabledItem,
    isEmpty,
  } = props;
  const notFound = data.length === 0;
  const renderList = () => {
    if (isEmpty) {
      return <EmptyList />;
    }
    if (notFound) {
      return <NotFound />;
    }
    return (
      <List
        onSelectedAddress={onSelectedAddress}
        receivers={data}
        disabledSwipe={disabledSwipe}
        onDelete={onDelete}
        shouldDisabledItem={shouldDisabledItem}
        styledContainer={{ flex: 1 }}
      />
    );
  };
  const isPlatformIOS = isIOS();
  const Wrapper = isPlatformIOS ? KeyboardAvoidingView : View;
  return (
    <View style={styled.container}>
      <Header title="Address book" style={styled.header} canSearch={!isEmpty} />
      <Wrapper
        behavior="padding"
        keyboardVerticalOffset={50}
        style={{
          flex: 1,
        }}
      >
        {renderList()}
      </Wrapper>
    </View>
  );
};

Item.defaultProps = {
  disabledSwipe: true,
  onDelete: null,
};

Item.propTypes = {
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  onDelete: PropTypes.func,
  disabledSwipe: PropTypes.bool,
};

List.propTypes = {
  onSelectedAddress: PropTypes.func.isRequired,
  receivers: PropTypes.array.isRequired,
};

Modal.defaultProps = {
  disabledSwipe: true,
  onDelete: null,
};

Modal.propTypes = {
  data: PropTypes.array.isRequired,
  onSelectedAddress: PropTypes.func.isRequired,
  disabledSwipe: PropTypes.bool,
  onDelete: PropTypes.func,
  shouldDisabledItem: PropTypes.bool.isRequired,
  isEmpty: PropTypes.bool.isRequired,
};

export default withModal(Modal);
