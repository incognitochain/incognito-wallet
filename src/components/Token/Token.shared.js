import React from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-native';
import incognito from '@assets/images/new-icons/incognito.png';
// import ImageCached from '@src/components/ImageCached';

export const Icon = React.memo((props) => {
  const { iconUrl, style } = props;
  return (
    <Image
      style={[{ width: 20, height: 20 }, style]}
      source={{ uri: iconUrl }}
      defaultSource={incognito}
    />
  );
  // return (
  //   <ImageCached
  //     style={[{ width: 20, height: 20 }, style]}
  //     uri={iconUrl}
  //     defaultImage={incognito}
  //   />
  // );
});

Icon.defaultProps = {
  style: null,
};

Icon.propTypes = {
  iconUrl: PropTypes.string.isRequired,
  style: PropTypes.any,
};
