import React from 'react';
import { View, Text } from 'react-native';
import Header from '@src/components/Header';
import { useDispatch } from 'react-redux';
import { ScrollView, TouchableOpacity } from '@src/components/core';
import { BtnDelete } from '@src/components/Button';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import Swipeout from 'react-native-swipeout';
import PropTypes from 'prop-types';
import { styled, itemStyled } from './AddressBook.styled';
import withAddressBook from './AddressBook.enhance';
import { actionDelete } from './AddressBook.actions';

const Item = ({ id, name, address, disabledSwipe, isLastChild, ...rest }) => {
  const dispatch = useDispatch();
  const handleDeleteAddressBook = async () => await dispatch(actionDelete(id));
  return (
    <Swipeout
      style={{
        backgroundColor: 'transparent',
      }}
      disabled={disabledSwipe}
      close
      autoClose
      right={[
        {
          component: (
            <BtnDelete showIcon={false} onPress={handleDeleteAddressBook} />
          ),
        },
      ]}
    >
      <View
        style={[
          itemStyled.container,
          isLastChild ? itemStyled.lastChild : null,
        ]}
      >
        <TouchableOpacity {...rest}>
          <View style={itemStyled.hook}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={itemStyled.name}
            >
              {name}
            </Text>
            <Text
              style={itemStyled.address}
              ellipsizeMode="middle"
              numberOfLines={1}
            >
              {address}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Swipeout>
  );
};

export const List = ({ data, disabledSwipe }) => {
  const navigation = useNavigation();
  const { onSelectedAddress } = useNavigationParam('params') || {};
  return (
    <ScrollView>
      {Object.keys(data).map((id) => {
        const item = data[id];
        return (
          <Item
            key={id}
            {...{
              ...item,
              disabledSwipe,
            }}
            onPress={() => {
              if (typeof onSelectedAddress === 'function') {
                return onSelectedAddress(item);
              }
              navigation.navigate(routeNames.AddressBookForm, {
                params: {
                  isUpdate: true,
                  id: item?.id,
                },
              });
            }}
          />
        );
      })}
    </ScrollView>
  );
};

const AddressBook = (props) => {
  const { data } = props;
  return (
    <View style={styled.container}>
      <Header title="Address book" canSearch style={styled.header} />
      <View style={styled.wrapper}>
        <List data={data} />
      </View>
    </View>
  );
};

AddressBook.propTypes = {
  data: PropTypes.array.isRequired,
};

List.defaultProps = {
  disabledSwipe: false,
};

List.propTypes = {
  data: PropTypes.array.isRequired,
  disabledSwipe: PropTypes.bool,
};

Item.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  disabledSwipe: PropTypes.bool.isRequired,
  isLastChild: PropTypes.bool.isRequired,
};

export default withAddressBook(AddressBook);
