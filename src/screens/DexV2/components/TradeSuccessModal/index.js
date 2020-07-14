import React from 'react';
import PropTypes from 'prop-types';
import formatUtil from '@utils/format';
import { SuccessModal } from '@src/components';
import mainStyles from '@screens/DexV2/style';
import { MESSAGES } from '../../constants';

class TradeSuccessModal extends React.Component {
  render() {
    const { visible, inputToken, inputValue, outputToken, outputValue, closeSuccessDialog } = this.props;
    const desc = `You placed an order to buy ${outputValue ? formatUtil.amountFull(outputValue, outputToken?.pDecimals) : outputValue} ${outputToken?.symbol} for ${inputValue} ${inputToken?.symbol}.`;
    return (
      <SuccessModal
        closeSuccessDialog={closeSuccessDialog}
        title={`${MESSAGES.TRADE_SUCCESS_TITLE}!`}
        description={desc}
        buttonTitle="Keep trading"
        buttonStyle={mainStyles.button}
        extraInfo={MESSAGES.TRADE_SUCCESS}
        visible={visible}
      />
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
