import React from 'react';
import PropTypes from 'prop-types';
import FastImage from 'react-native-fast-image';
import { AppIcon } from '@components/Icons';

const ImageFastWrapper = (props) => {
  const { style, uri, ...rest } = props;
  const [{ error }, setState] = React.useState({
    loading: false,
    error: false,
  });

  if (!!error || !uri) {
    return <AppIcon style={style} {...rest} />;
  }

  return (
    <FastImage
      style={[style, { borderRadius: 50 }]}
      source={{
        uri: uri,
      }}
      resizeMode={FastImage.resizeMode.cover}
      onLoadStart={() => setState((value) => ({ ...value, loading: true }))}
      onLoadEnd={() => setState((value) => ({ ...value, loading: false }))}
      onError={() => setState({ error: true, loading: false })}
      {...rest}
    />
  );
};

ImageFastWrapper.defaultProps = {};

ImageFastWrapper.propTypes = {
  style: PropTypes.object.isRequired,
  uri: PropTypes.string.isRequired,
};

export default ImageFastWrapper;
