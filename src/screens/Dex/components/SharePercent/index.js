import React from 'react';
import PropTypes from 'prop-types';
import { Text, View } from '@src/components/core';
import formatUtil from '@utils/format';
import style from './style';

class SharePercent extends React.Component {
  render() {
    const { share, totalShare } = this.props;

    if (!share || !totalShare) {
      return null;
    }

    const percent = share / totalShare * 100;

    return (
      <View style={style.twoColumns}>
        <Text style={[style.feeTitle]}>Your Pool Share:</Text>
        <View style={[style.flex, style.textRight]}>
          <Text style={style.fee} numberOfLines={2}>
            {formatUtil.toFixed(percent, 6)} %
          </Text>
        </View>
      </View>
    );
  }
}

SharePercent.defaultProps = {
  totalShare: 0,
  share: 0,
};

SharePercent.propTypes = {
  totalShare: PropTypes.number,
  share: PropTypes.number,
};

export default SharePercent;
