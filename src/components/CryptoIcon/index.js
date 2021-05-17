import _ from 'lodash';
import { Image, View } from '@src/components/core';
import defaultTokenIcon from '@src/assets/images/icons/default_token_icon.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { selectedPrivacySelector } from '@src/redux/selectors';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { connect } from 'react-redux';
import styleSheet from './style';

const getVerifiedFlagStyle = (size) => {
  const verifiedFlagSize = Math.round(size * 0.5);
  const verifiedFlagStyle = {
    borderRadius: Math.round(verifiedFlagSize * 0.5),
    bottom: -Math.round(verifiedFlagSize * 0.25),
    right: -Math.round(verifiedFlagSize * 0.25),
    width: verifiedFlagSize + 1,
    height: verifiedFlagSize + 1
  };

  return [verifiedFlagSize, verifiedFlagStyle];
};

class CryptoIcon extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uri: null,
      imageComponent: null,
      verifiedFlagStyle: null,
      verifiedFlagSize: null
    };
  }

  static getDerivedStateFromProps(nextProps) {
    const { size } = nextProps;

    const [verifiedFlagSize, verifiedFlagStyle] = getVerifiedFlagStyle(size);

    return {
      verifiedFlagStyle,
      verifiedFlagSize
    };
  }

  componentDidMount() {
    const { tokenId, uri } = this.props;

    tokenId && this.getUri(uri);
  }

  componentDidUpdate(prevProps) {
    const { uri, tokenId } = this.props;
    const { uri: oldUri, tokenId: oldTokenId } = prevProps;

    if (uri !== oldUri || tokenId !== oldTokenId) {
      this.getUri(uri);
    }
  }

  getSize = () => {
    const { size } = this.props;

    return { width: Number(size-1.5), height: Number(size-1.5) };
  }

  getUri = async (defaultUri) => {
    const { token, logoStyle } = this.props;
    const components = (defaultUri || token?.iconUrl || '').split('/');
    const lastComponent = _.last(components);

    if (lastComponent && lastComponent.replace) {
      components[components.length - 1] = encodeURIComponent(lastComponent);
    }

    const _uri = components.join('/').toLowerCase();

    this.setState(({ uri }) => uri !== _uri && ({ uri: _uri, imageComponent: (
      <Image
        style={[styleSheet.logo, logoStyle, this.getSize()]}
        source={{ uri: `${_uri}?t=${new Date().getDate()}.${new Date().getHours()}` }}
        onError={this.onLoadError}
        onLoadStart={this.onLoadStart}
        onLoadEnd={this.onLoadEnd}
      />
    ) }));
  };

  onLoadError = () => {
    this.setState({ uri: '' });
  };

  renderDefault = (logoStyle) => (
    <Image
      style={[styleSheet.logo, logoStyle, this.getSize()]}
      source={defaultTokenIcon}
    />
  );

  render() {
    const { uri, imageComponent, verifiedFlagStyle, verifiedFlagSize } = this.state;
    const { containerStyle, logoStyle, size, token, showVerifyFlag } = this.props;
    const { isVerified } = token || {};

    return (
      <View>
        <View style={[styleSheet.container, containerStyle, { borderRadius: size }, this.getSize()]}>
          {
            !uri
              ? this.renderDefault(logoStyle)
              : imageComponent
          }
        </View>
        { showVerifyFlag && isVerified && (
          <View style={[styleSheet.verifiedFlagContainer, verifiedFlagStyle]}>
            <Icons style={[styleSheet.verifiedFlag]} name='check-circle' size={verifiedFlagSize} />
          </View>
        ) }
      </View>
    );
  }
}

CryptoIcon.defaultProps = {
  tokenId: null,
  containerStyle: null,
  logoStyle: null,
  size: 40,
  token: null,
  showVerifyFlag: false,
  uri: null,
};

CryptoIcon.propTypes = {
  tokenId: PropTypes.string,
  containerStyle: PropTypes.object,
  logoStyle: PropTypes.object,
  token: PropTypes.object,
  size: PropTypes.number,
  showVerifyFlag: PropTypes.bool,
  uri: PropTypes.string,
};


const mapState = (state, props) => ({
  token: props?.tokenId && selectedPrivacySelector.getPrivacyDataByTokenID(state)(props?.tokenId)
});

export default connect(mapState)(CryptoIcon);
