import React from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  RoundCornerButton,
} from '@components/core';
import formatUtil from '@utils/format';
import { Overlay } from 'react-native-elements';
import styles from './style';
import { MESSAGES } from '../../constants';

class TradeSuccessModal extends React.Component {
  render() {
    const { visible, inputToken, inputValue, outputToken, outputValue, closeSuccessDialog } = this.props;
    return (
      <Overlay isVisible={visible} overlayStyle={styles.dialog}>
        <View style={[styles.dialogContent]}>
          <Text style={styles.dialogTitle}>
            {MESSAGES.TRADE_SUCCESS_TITLE}!
          </Text>
          <Text style={styles.dialogDesc}>
            You placed an order to buy&nbsp;{outputValue ? formatUtil.amountFull(outputValue, outputToken?.pDecimals) : outputValue} {outputToken?.symbol}&nbsp;for {inputValue} {inputToken?.symbol}.
          </Text>
          <Text style={styles.extraInfo}>
            {MESSAGES.TRADE_SUCCESS}
          </Text>
          <RoundCornerButton
            onPress={closeSuccessDialog}
            title="Keep trading"
            style={styles.button}
          />
        </View>
      </Overlay>
    );
  }
}

TradeSuccessModal.defaultProps = {
  visible: false,
  inputToken: null,
  inputValue: null,
  outputToken: null,
  outputValue: null,
};

TradeSuccessModal.propTypes = {
  visible: PropTypes.bool,
  inputToken: PropTypes.object,
  inputValue: PropTypes.number,
  outputToken: PropTypes.object,
  outputValue: PropTypes.number,
  closeSuccessDialog: PropTypes.func.isRequired,
};

export default TradeSuccessModal;
