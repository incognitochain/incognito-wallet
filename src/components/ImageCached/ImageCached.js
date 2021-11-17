import React, { memo } from 'react';
import PropTypes from 'prop-types';
import FastImage from 'react-native-fast-image';
import { ActivityIndicator } from '@components/core';
import { View, StyleSheet, Image } from 'react-native';

const ImageCached = (props) => {
  const { style, uri, defaultImage, ...rest } = props;
  const [{ loading, error }, setState] = React.useState({
    loading: false,
    error: false,
  });
  if (!!error && !!defaultImage) {
    return <Image source={defaultImage} style={style} {...rest} />;
  }
  return (
    <View style={style}>
      <FastImage
        style={style}
        source={{
          uri: uri,
          priority: FastImage.priority.high,
          cache: FastImage.cacheControl.web,
        }}
        resizeMode={FastImage.resizeMode.stretch}
        onLoadStart={() => setState((value) => ({ ...value, loading: true }))}
        onLoadEnd={() => setState((value) => ({ ...value, loading: false }))}
        onError={() => setState({ error: true, loading: false })}
        {...rest}
      />
      {loading && (
        <View style={styled.loading} zIndex={999}>
          <ActivityIndicator />
        </View>
      )}
    </View>
  );
};

const styled = StyleSheet.create({
  loading: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

ImageCached.defaultProps = {
  defaultImage: null,
};

ImageCached.propTypes = {
  style: PropTypes.object.isRequired,
  uri: PropTypes.string.isRequired,
  defaultImage: PropTypes.any,
};

export default ImageCached;
