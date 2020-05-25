import React from 'react';
import {Image} from 'react-native';
import srcAddressBookIcon from '@src/assets/images/icons/address_book.png';

const AddressBookIcon = props => {
  const defaultStyle = {
    width: 20,
    height: 22,
  };
  const {style, source, ...rest} = props;
  return (
    <Image
      source={srcAddressBookIcon}
      style={[defaultStyle, style]}
      {...rest}
    />
  );
};

export default AddressBookIcon;
