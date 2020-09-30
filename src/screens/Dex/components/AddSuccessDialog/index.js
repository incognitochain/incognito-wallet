import React from 'react';
import PropTypes from 'prop-types';
import {
  Image,
  Text,
  View,
  TouchableOpacity,
} from '@components/core/index';
import {Overlay} from 'react-native-elements';
import swapSuccess from '@assets/images/swap_success.png';
import formatUtil from '@utils/format';
import { mainStyle } from './style';
import { MESSAGES } from '../../constants';

class AddSuccessDialog extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { show } = this.props;
    const { show: nextShow } = nextProps;
    return show !== nextShow;
  }

  render() {
    const { show, inputToken, inputValue, outputToken, outputValue, closeSuccessDialog } = this.props;
    return (
      <Overlay isVisible={show} overlayStyle={mainStyle.dialog}>
        {show && (
          <View style={[mainStyle.dialogContent]}>
            <Image source={swapSuccess} style={mainStyle.swapSuccess} />
            <Text style={mainStyle.dialogTitle}>
              {MESSAGES.ADD_LIQUIDITY_SUCCESS_TITLE}
            </Text>
            <Text style={mainStyle.dialogDesc}>
            You added {formatUtil.amountFull(inputValue, inputToken.pDecimals)} {inputToken?.symbol}
            &nbsp;and {formatUtil.amountFull(outputValue, outputToken.pDecimals)} {outputToken?.symbol}.
            </Text>
            <Text style={mainStyle.extraInfo}>
              {MESSAGES.ADD_LIQUIDITY_SUCCESS}
            </Text>
            <TouchableOpacity onPress={closeSuccessDialog}>
              <Text style={mainStyle.dialogButton}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </Overlay>
    );
  }
}

AddSuccessDialog.defaultProps = {
  show: false,
  inputToken: null,
  inputValue: null,
  outputToken: null,
  outputValue: null,
};

AddSuccessDialog.propTypes = {
  show: PropTypes.bool,
  inputToken: PropTypes.object,
  inputValue: PropTypes.number,
  outputToken: PropTypes.object,
  outputValue: PropTypes.number,
  closeSuccessDialog: PropTypes.func.isRequired,
};

export default AddSuccessDialog;
