import React from 'react';
import PropTypes from 'prop-types';
import {
  ActivityIndicator,
  Text,
  View,
} from '@src/components/core';
import formatUtil from '@utils/format';
import {mainStyle} from '@screens/Dex/style';
import {PRV} from '@services/wallet/tokenService';
import style from './style';

class NetworkFee extends React.PureComponent {
  render() {
    const { fee } = this.props;
    return (
      <View style={style.twoColumns}>
        <Text style={[style.feeTitle]}>Network Fee:</Text>
        {!fee ?
          <ActivityIndicator size="small" style={mainStyle.textRight} /> :
          <Text style={[style.fee, style.textRight, style.ellipsis]} numberOfLines={1}>{formatUtil.amountFull(fee, PRV.pDecimals)} {PRV.symbol}</Text>
        }
      </View>
    );
  }
}

NetworkFee.defaultProps = {
  fee: 0,
};

NetworkFee.propTypes = {
  fee: PropTypes.number,
};

export default NetworkFee;
