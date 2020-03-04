import React from 'react';
import {Image} from 'react-native';
import srcSearchIcon from '@src/assets/images/icons/search.png';

const SearchIcon = () => {
  return (
    <Image
      source={srcSearchIcon}
      style={{
        width: 24,
        height: 24,
      }}
    />
  );
};

export default SearchIcon;
