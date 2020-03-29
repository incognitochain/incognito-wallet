import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {
  Button,
  Image,
  Text,
  View,
} from '@components/core/index';
import formatUtil from '@utils/format';
import {Overlay} from 'react-native-elements';
import transferSuccess from '@assets/images/transfer_success.png';
import { MESSAGES } from '../../constants';
import { mainStyle } from './style';

class TransferSuccessPopUp extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { success } = this.props;
    const { success: nextSuccess } = nextProps;

    return success !== nextSuccess;
  }

  render() {
    const { success, action, amount, token, account, closePopUp } = this.props;
    return (
      <Overlay isVisible={!!success} overlayStyle={mainStyle.dialog}>
        <View style={[mainStyle.dialogContent]}>
          <Image source={transferSuccess} style={mainStyle.transferSuccess} />
          <Text style={mainStyle.dialogTitle}>
            {action === MESSAGES.DEPOSIT ? MESSAGES.DEPOSIT_SUCCESS_TITLE : MESSAGES.WITHDRAW_SUCCESS_TITLE}
          </Text>
          <Text style={mainStyle.desc}>
            {
              action === MESSAGES.DEPOSIT ? MESSAGES.DEPOSIT_SUCCESS : MESSAGES.WITHDRAW_SUCCESS(account?.name || account?.AccountName)
            }
          </Text>
          <View style={mainStyle.transferInfo}>
            <View style={[mainStyle.twoColumns]}>
              <Text style={[mainStyle.fee, mainStyle.infoTitle]}>Amount:</Text>
              <View style={[mainStyle.textRight, mainStyle.twoColumns]}>
                <Text numberOfLines={1} style={[mainStyle.fee, mainStyle.amount]}>
                  {_.isNumber(amount) ? `${formatUtil.amountFull(amount, token?.pDecimals)}` : 0}
                </Text>
                <Text style={mainStyle.fee}>
                  &nbsp;{token?.symbol}
                </Text>
              </View>
            </View>
            <View style={[mainStyle.twoColumns]}>
              <Text style={[mainStyle.fee, mainStyle.infoTitle]}>
                {action === 'deposit' ? 'Deposit from' : 'Withdraw to'}:
              </Text>
              <Text numberOfLines={1} style={[mainStyle.fee, mainStyle.textRight, mainStyle.accountName]}>
                {account?.AccountName}
              </Text>
            </View>
          </View>
          <Button title="Continue trading" style={mainStyle.transferSuccessButton} onPress={closePopUp} />
        </View>
      </Overlay>
    );
  }
}

TransferSuccessPopUp.defaultProps = {
  account: null,
  amount: 0,
  token: null,
  action: '',
  success: false,
};

TransferSuccessPopUp.propTypes = {
  account: PropTypes.object,
  amount: PropTypes.number,
  token: PropTypes.object,
  action: PropTypes.string,
  success: PropTypes.bool,
  closePopUp: PropTypes.func.isRequired,
};

export default TransferSuccessPopUp;
