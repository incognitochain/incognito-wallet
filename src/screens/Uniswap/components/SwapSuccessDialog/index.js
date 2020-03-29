import React from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Text,
  View,
  TouchableOpacity,
} from '@components/core/index';
import formatUtil from '@utils/format';
import {Overlay} from 'react-native-elements';
import swapSuccess from '@assets/images/swap_success.png';
import { mainStyle } from './style';
import { MESSAGES } from '../../constants';

class SwapSuccessDialog extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { showSwapSuccess } = this.props;
    const { showSwapSuccess: nextShow } = nextProps;
    return showSwapSuccess !== nextShow;
  }

  render() {
    const { showSwapSuccess, inputToken, inputValue, outputToken, outputValue, closeSuccessDialog } = this.props;
    return (
      <Overlay isVisible={showSwapSuccess} overlayStyle={mainStyle.dialog}>
        <View style={[mainStyle.dialogContent]}>
          <Image source={swapSuccess} style={mainStyle.swapSuccess} />
          <Text style={mainStyle.dialogTitle}>
            {MESSAGES.TRADE_SUCCESS_TITLE}
          </Text>
          <Text style={mainStyle.dialogDesc}>
            You traded {inputValue ? formatUtil.amountFull(inputValue, inputToken?.pDecimals) : inputValue} {inputToken?.symbol}
            &nbsp;for {outputValue ? formatUtil.amountFull(outputValue, outputToken?.pDecimals) : outputValue} {outputToken?.symbol}.
          </Text>
          <Text style={mainStyle.extraInfo}>
            {MESSAGES.TRADE_SUCCESS}
          </Text>
          <TouchableOpacity onPress={closeSuccessDialog}>
            <Text style={mainStyle.dialogButton}>KEEP TRADING</Text>
          </TouchableOpacity>
        </View>
      </Overlay>
    );
  }
}

SwapSuccessDialog.defaultProps = {
  showSwapSuccess: false,
  inputToken: null,
  inputValue: null,
  outputToken: null,
  outputValue: null,
};

SwapSuccessDialog.propTypes = {
  showSwapSuccess: PropTypes.bool,
  inputToken: PropTypes.object,
  inputValue: PropTypes.number,
  outputToken: PropTypes.object,
  outputValue: PropTypes.number,
  closeSuccessDialog: PropTypes.func.isRequired,
};

export default SwapSuccessDialog;
