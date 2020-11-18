import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, WebView, TouchableOpacity, Modal } from '@src/components/core';
import SimpleInfo from '@src/components/SimpleInfo';
import convertUtil from '@src/utils/convert';
import { ExHandler, CustomError, ErrorCode } from '@src/services/exception';
import { CONSTANT_COMMONS } from '@src/constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '@src/styles';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { SafeAreaView} from 'react-native';
import styleSheet from '@components/core/Modal/style';
import { Icon } from 'react-native-elements';
import { isEmpty } from 'lodash';
import { COMMANDS } from 'papp-sdk/src/base/constants';
import Validator from './sdk/validator';
import RequestSendTx from './RequestSendTx';
import { APPSDK, ERRORSDK, CONSTANTSDK } from './sdk';
import styles from './style';

let sdk: APPSDK   = null;
const updateDataToPapp = (data) => {
  if (!sdk) return;

  try {
    const { selectedPrivacy, listSupportedToken } = data;
    const balance = selectedPrivacy?.amount && convertUtil.toHumanAmount(selectedPrivacy?.amount, selectedPrivacy.pDecimals);
    const paymentAddress = selectedPrivacy?.paymentAddress;

    paymentAddress && sdk.sendUpdatePaymentAddress(paymentAddress);
    selectedPrivacy && sdk.sendUpdateTokenInfo({
      balance,
      id: selectedPrivacy?.tokenId,
      symbol: selectedPrivacy?.symbol,
      name: selectedPrivacy?.name,
      nanoBalance: selectedPrivacy?.amount,
      pDecimals: selectedPrivacy?.pDecimals
    });
    listSupportedToken && sdk.sendListToken(listSupportedToken);
  } catch (e) {
    new ExHandler(e).showErrorToast();
  }
};

const getListSupportedToken = (supportTokenIds = [], tokens = []) => {
  const list = {
    [CONSTANT_COMMONS.PRV_TOKEN_ID]: {
      id: CONSTANT_COMMONS.PRV_TOKEN_ID,
      symbol: CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV,
      name: CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV
    }
  };

  const supportTokens = tokens.filter(token => supportTokenIds.includes(token?.id));

  supportTokens?.forEach(token => {
    token?.id && (list[token?.id] = { id: token?.id, symbol: token?.symbol, name: token?.name });
  });

  return Object.values(list);
};

class PappView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalData: null,
      isLoaded: false,
      hasWebViewError: false,
      url: props?.url || '',
      openQrScanner: false
    };

    this.webviewInstance = null;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Ura: I think we should retry this held while url is invalid
    if (nextProps?.url != prevState?.url && nextProps?.url?.replace(' ', '') != '') {
      return {
        url: nextProps?.url || 'https://incscan.io',
        hasWebViewError: isLoaded && false,
      };
    }
    const { selectedPrivacy, supportTokenIds, tokens } = nextProps;
    const { isLoaded } = prevState;

    const listSupportedToken = getListSupportedToken(supportTokenIds, tokens);
    isLoaded && updateDataToPapp({ selectedPrivacy, listSupportedToken });

    return null;
  }

  componentWillUnmount() {
    // clear sdk data
    sdk?.resetStore();
    sdk = null;
  }

  closeModal = () => {
    this.setState({ modalData: null });
  }

  onRequestSendTx = ({ toAddress, amount, pendingTxId, info } = {}) => {
    new Validator('onRequestSendTx toAddress', toAddress).required().paymentAddress();
    new Validator('onRequestSendTx amount', amount).required().amount();
    new Validator('onRequestSendTx pendingTxId', pendingTxId).required().string();
    new Validator('onRequestSendTx info', info).string();

    const { selectedPrivacy, url } = this.props;
    this.setState({
      modalData: (
        <RequestSendTx
          url={url}
          toAddress={toAddress}
          amount={amount}
          info={info}
          pendingTxId={pendingTxId}
          selectedPrivacy={selectedPrivacy}
          onCancel={() => {
            sdk?.sendUpdateTxPendingResult({ pendingTxId, error: ERRORSDK.user_cancel_send_tx });
            this.closeModal();
          }}
          onSendSuccess={rs => {
            sdk?.sendUpdateTxPendingResult({ pendingTxId, data: rs });
            this.closeModal();
          }}
          onSendFailed={e => {
            sdk?.sendUpdateTxPendingResult({ pendingTxId, error: ERRORSDK.createError(ERRORSDK.ERROR_CODE.SEND_TX_ERROR, e?.message) });
            this.closeModal();
          }}
        />
      )
    });
  }

  onSdkSelectPrivacyById = tokenID => {
    new Validator('onSdkSelectPrivacyById tokenID', tokenID).required().string();

    const { onSelectPrivacyToken } = this.props;
    onSelectPrivacyToken(tokenID);
  }

  onSdkSetSupportListTokenById = tokenIds => {
    new Validator('onSdkSetSupportListTokenById tokenIds', tokenIds).required().array();

    const filterIds = tokenIds.filter(id => typeof id === 'string');

    const { onSetListSupportTokenById } = this.props;
    onSetListSupportTokenById(filterIds);
  }

  onWebViewData = async (e) => {
    try {
      const payload = e.nativeEvent.data;
      new Validator('onWebViewData payload', payload).required().string();

      const [command, data] = payload?.split('|');
      if (command) {
        new Validator('onWebViewData command', command).required().string();
      }
      if (data) {
        new Validator('onWebViewData data', data).string();
        const parsedData = JSON.parse(data);
        switch (command) {
        case CONSTANTSDK.COMMANDS.SEND_TX:
          this.onRequestSendTx(parsedData);
          break;
        case CONSTANTSDK.COMMANDS.SELECT_PRIVACY_TOKEN_BY_ID:
          this.onSdkSelectPrivacyById(parsedData?.tokenID);
          break;
        case CONSTANTSDK.COMMANDS.SET_LIST_SUPPORT_TOKEN_BY_ID:
          this.onSdkSetSupportListTokenById(parsedData?.tokenIds);
          break;
        case CONSTANTSDK.COMMANDS.REQUEST_OPEN_CAMERA_QR_CODE: {
          this.setState({ openQrScanner: true });
          setTimeout(() => {
            this.setState({ openQrScanner: false });
          }, 30000);
          break;
        }}
      }
    } catch (e) {
      new ExHandler(e, 'The pApp occured an error. Please try again.').showErrorToast();
    }
  }

  onPappLoaded = (syntheticEvent) => {
    const { selectedPrivacy, listSupportedToken, onChangeUrl, onLoadEnd } = this.props;
    const { nativeEvent } = syntheticEvent;

    if (typeof onChangeUrl === 'function') {
      onChangeUrl(nativeEvent?.url);
    }

    onLoadEnd && onLoadEnd();

    setTimeout(() => {
      this.setState({ isLoaded: true }, () => {
        updateDataToPapp({ selectedPrivacy, listSupportedToken });
      });
    }, 2000);
  }

  onLoadPappError = (e) => {
    const { onLoadError } = this.props;
    onLoadError && onLoadError();
    this.setState({ hasWebViewError: true });
    new ExHandler(new CustomError(ErrorCode.papp_can_not_opened, { rawError: e }));
  }

  onGoBack = () => {
    this.webviewInstance?.goBack();
  }

  onGoForward = () => {
    this.webviewInstance?.goForward();
  }

  onReload = () => {
    this.webviewInstance?.reload();
  }

  renderBottomBar = () => {
    return (
      <View style={styles.navigation}>
        <View style={{ flexDirection: 'row', flex: 1 }}>
          <TouchableOpacity onPress={() => this.onGoBack()} style={styles.back}>
            <Ionicons name="ios-arrow-back" size={30} color={COLORS.colorGreyBold} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.onGoForward()} style={styles.back}>
            <Ionicons name="ios-arrow-forward" size={30} color={COLORS.colorGreyBold} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.back}>
            {/* <SimpleLineIcons name="home" size={25} color={COLORS.colorGreyBold} /> */}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.onReload()} style={styles.back}>
            <Ionicons name="ios-refresh" size={30} color={COLORS.colorGreyBold} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  onReadQrCode = (result) => {
    const qrCode = result?.data;
    if (!isEmpty(qrCode)) {
      const command   = COMMANDS.ON_RECEIVE_QR_CODE;
      const data      = { qrCode };
      const payload   = `${command}|${JSON.stringify(data)}`;
      this.webviewInstance.postMessage(payload);
      this.setState({ openQrScanner: false });
    }
  };

  onCloseQrCode = () => {
    this.setState({ openQrScanner: false });
  };

  renderHeaderQRCode = () => {
    return (
      <SafeAreaView>
        <View style={{ height: 40 }}>
          <TouchableOpacity
            onPress={this.onCloseQrCode}
            style={styleSheet.closeBtn}
          >
            <Icon
              name="close"
              type="material"
              size={30}
              color={COLORS.colorGreyBold}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };

  renderQrCodeCamera = () => {
    const { openQrScanner } = this.state;
    return (
      <Modal animationType='fade' visible={openQrScanner} >
        <View style={styles.container}>
          { this.renderHeaderQRCode() }
          <QRCodeScanner
            showMarker
            cameraStyle={styles.scanner}
            onRead={this.onReadQrCode}
          />
        </View>
      </Modal>
    );
  };

  render() {
    const { modalData, hasWebViewError } = this.state;
    const { url } = this.state;
    if (hasWebViewError) {
      return (
        <SimpleInfo
          text={`We can not open "${url}". Please make sure you are using a correct pApp URL.`}
          type='warning'
        />
      );
    }

    return (
      <>
        <View style={styles.container}>
          <WebView
            ref={webview => {
              if (webview?.webViewRef?.current) {
                sdk = new APPSDK(webview);
                this.webviewInstance = webview;
              }
            }}
            containerStyle={styles.webview}
            source={{ uri: url }}
            allowsBackForwardNavigationGestures
            onLoad={
              e => {
                // Update the state so url changes could be detected by React and we could load the mainUrl.
                this.setState({ url: e.nativeEvent.url });
              }
            }
            bounces
            cacheEnabled={false}
            cacheMode='LOAD_NO_CACHE'
            onError={this.onLoadPappError}
            onLoadEnd={this.onPappLoaded}
            onMessage={this.onWebViewData}
          />
          {!hasWebViewError ? this.renderBottomBar() : null}
          <Modal visible={!!modalData}>
            {modalData}
          </Modal>
          { this.renderQrCodeCamera() }
        </View>
      </>
    );
  }
}

PappView.propTypes = {
  selectedPrivacy: PropTypes.object.isRequired,
  url: PropTypes.string.isRequired,
  onSelectPrivacyToken: PropTypes.func.isRequired,
  listSupportedToken: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSetListSupportTokenById: PropTypes.func.isRequired,
  onChangeUrl: PropTypes.func.isRequired,
  onLoadError: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
  onLoadEnd: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
};

PappView.defaultProps = {
  onLoadError: null,
  onLoadEnd: null
};

export default PappView;