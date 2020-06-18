import React from 'react';
import { ButtonBasic } from '@src/components/Button';
import { useSelector } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { addressBookSelector } from './AddressBook.selector';
import { isExistByField } from './AddressBook.utils';

const styled = StyleSheet.create({
  container: {
    marginTop: 50,
  },
});

export const useBtnSaveAddressBook = (props) => {
  const { data } = useSelector(addressBookSelector);
  const { onSaveAddressBook, address } = props;
  const navigation = useNavigation();
  let btnSaveAddressBook;
  const handleSaveAddressBook = async () => {
    navigation.navigate(routeNames.AddressBookForm, {
      params: { address, isUpdate: false },
    });
    if (typeof onSaveAddressBook === 'function') {
      onSaveAddressBook();
    }
  };
  const isExist = isExistByField('address', address, data);
  if (!isExist) {
    btnSaveAddressBook = (
      <ButtonBasic
        title="Save to address book"
        onPress={handleSaveAddressBook}
        btnStyle={styled.container}
      />
    );
  }
  return [btnSaveAddressBook];
};

useBtnSaveAddressBook.defaultProps = {
  onSaveAddressBook: null,
};

useBtnSaveAddressBook.propTypes = {
  onSaveAddressBook: PropTypes.func,
  address: PropTypes.string.isRequired,
};
