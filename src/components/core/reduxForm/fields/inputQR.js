import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { TextInput, View, TouchableOpacity } from '@src/components/core';
import { openQrScanner } from '@src/components/QrCodeScanner';
import { AddressBookIcon } from '@src/components/Icons';
import { generateTestId } from '@utils/misc';
import { SEND } from '@src/constants/elements';
import { BtnScanQrCode } from '@src/components/Button';
import createField from './createField';

const styled = StyleSheet.create({
  prepend: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  line: {
    width: 1,
    height: 20,
    marginHorizontal: 5,
  },
  btn: {
    width: 32,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const renderCustomField = ({
  input,
  onOpenAddressBook,
  showNavAddrBook,
  oldVersion,
  shouldStandardized,
  ...props
}) => {
  const { onChange, onBlur, onFocus, value, ...rest } = input;
  return (
    <TextInput
      {...{ ...props, ...rest }}
      onChangeText={(t) => input.onChange(t)}
      onBlur={onBlur}
      onFocus={onFocus}
      returnKeyType="done"
      oldVersion={oldVersion && oldVersion}
      defaultValue={value}
      prependView={(
        <View style={styled.prepend}>
          {showNavAddrBook && (
            <>
              <TouchableOpacity
                style={styled.btn}
                onPress={onOpenAddressBook}
                {...generateTestId(SEND.ADDRESS_BOOK_ICON)}
              >
                <AddressBookIcon />
              </TouchableOpacity>
              <View style={styled.line} />
            </>
          )}
          <BtnScanQrCode
            style={styled.btn}
            onPress={() => {
              openQrScanner((data) => {
                input.onChange(data);
              });
            }}
          />
        </View>
      )}
    />
  );
};

renderCustomField.propTypes = {
  input: PropTypes.object,
  onOpenAddressBook: PropTypes.func,
  showNavAddrBook: PropTypes.bool,
  oldVersion: PropTypes.bool,
  shouldStandardized: PropTypes.bool,
};

renderCustomField.defaultProps = {
  input: null,
  onOpenAddressBook: () => null,
  showNavAddrBook: false,
  oldVersion: false,
  shouldStandardized: false,
};

const InputQRField = createField({
  fieldName: 'InputQRField',
  render: renderCustomField,
});

export default InputQRField;
