import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, WebView, Modal } from '@src/components/core';
import SimpleInfo from '@src/components/SimpleInfo';
import convertUtil from '@src/utils/convert';
import { ExHandler, CustomError, ErrorCode } from '@src/services/exception';
import { CONSTANT_COMMONS } from '@src/constants';
import Validator from './sdk/validator';
import RequestSendTx from './RequestSendTx';
import { APPSDK, ERRORSDK, CONSTANTSDK } from './sdk';
import styles from './style';

let sdk : APPSDK= null;

const updateDataToPapp = (data) => {
  if (!sdk) return;

  try {
    const { selectedPrivacy, listSupportedToken, userProfile } = data;
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
    userProfile?.id && sdk.sendExtraInfo({ userId: userProfile.id });
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

class PappView extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalData: null,
      isLoaded: false,
      hasWebViewError: false,
    };
    
    this.webviewInstance = null;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { selectedPrivacy, supportTokenIds, tokens, userProfile } = nextProps;
    const { isLoaded } = prevState;

    const listSupportedToken = getListSupportedToken(supportTokenIds, tokens);
    isLoaded && updateDataToPapp({ selectedPrivacy, listSupportedToken, userProfile });

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

      const [ command, data ] = payload?.split('|');
      new Validator('onWebViewData command', command).required().string();
      new Validator('onWebViewData data', data).string();

      const parsedData = JSON.parse(data);

      switch(command) {
      case CONSTANTSDK.COMMANDS.SEND_TX:
        this.onRequestSendTx(parsedData);
        break;
      case CONSTANTSDK.COMMANDS.SELECT_PRIVACY_TOKEN_BY_ID:
        this.onSdkSelectPrivacyById(parsedData?.tokenID);
        break;
      case CONSTANTSDK.COMMANDS.SET_LIST_SUPPORT_TOKEN_BY_ID:
        this.onSdkSetSupportListTokenById(parsedData?.tokenIds);
      }
    } catch (e) {
      new ExHandler(e, 'The pApp occured an error. Please try again.').showErrorToast();
    }
  }

  onPappLoaded = () => {
    const { selectedPrivacy, listSupportedToken } = this.props;
    setTimeout(() => {
      this.setState({ isLoaded: true }, () => {
        updateDataToPapp({ selectedPrivacy, listSupportedToken });
      });
    }, 2000);
  }

  onLoadPappError = (e) => {
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

  render() {
    const { modalData, hasWebViewError } = this.state;
    const {  url } = this.props;

    if (hasWebViewError) {
      return (
        <SimpleInfo
          text={`We can not open "${url}". Please make sure you are using a correct pApp URL.`}
          type='warning'
        />
      );
    }
    
    return (
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
          cacheEnabled={false}
          cacheMode='LOAD_NO_CACHE'
          onError={this.onLoadPappError}
          onLoadEnd={this.onPappLoaded}
          onMessage={this.onWebViewData}
        />
        <Modal visible={!!modalData}>
          { modalData }
        </Modal>
      </View>
    );
  }
}

PappView.propTypes = {
  selectedPrivacy: PropTypes.object.isRequired,
  url: PropTypes.object.isRequired,
  onSelectPrivacyToken: PropTypes.func.isRequired,
  listSupportedToken: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSetListSupportTokenById: PropTypes.func.isRequired,
};

export default PappView;