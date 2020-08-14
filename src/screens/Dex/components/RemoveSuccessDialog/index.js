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
import { mainStyle } from './style';
import { MESSAGES } from '../../constants';

class RemoveSuccessDialog extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { show } = this.props;
    const { show: nextShow } = nextProps;
    return show !== nextShow;
  }

  render() {
    const { show, token1, topValue, token2, bottomValue, closeSuccessDialog } = this.props;
    return (
      <Overlay isVisible={show} overlayStyle={mainStyle.dialog}>
        <View style={[mainStyle.dialogContent]}>
          <Image source={swapSuccess} style={mainStyle.swapSuccess} />
          <Text style={mainStyle.dialogTitle}>
            {MESSAGES.REMOVE_LIQUIDITY_SUCCESS_TITLE}
          </Text>
          <Text style={mainStyle.dialogDesc}>
            You are removing {topValue} {token1?.symbol}
            &nbsp;and {bottomValue} {token2?.symbol}.
          </Text>
          <Text style={mainStyle.extraInfo}>
            {MESSAGES.REMOVE_LIQUIDITY_SUCCESS}
          </Text>
          <TouchableOpacity onPress={closeSuccessDialog}>
            <Text style={mainStyle.dialogButton}>Continue</Text>
          </TouchableOpacity>
        </View>
      </Overlay>
    );
  }
}

RemoveSuccessDialog.defaultProps = {
  show: false,
  token1: null,
  topValue: null,
  token2: null,
  bottomValue: null,
};

RemoveSuccessDialog.propTypes = {
  show: PropTypes.bool,
  token1: PropTypes.object,
  topValue: PropTypes.number,
  token2: PropTypes.object,
  bottomValue: PropTypes.number,
  closeSuccessDialog: PropTypes.func.isRequired,
};

export default RemoveSuccessDialog;
