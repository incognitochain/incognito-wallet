import React from 'react';
import PropTypes from 'prop-types';
import formatUtil from '@utils/format';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';

class SharePercent extends React.Component {
  render() {
    const { share, totalShare, style } = this.props;

    if (!share || !totalShare) {
      return null;
    }

    const percent = share / totalShare * 100;

    return (
      <ExtraInfo
        style={style}
        left="Shares:"
        right={`${formatUtil.amountFull(share, 0)} (${formatUtil.toFixed(percent, 4)}%)`}
      />
    );
  }
}

SharePercent.defaultProps = {
  totalShare: 0,
  share: 0,
  style: null,
};

SharePercent.propTypes = {
  style: PropTypes.object,
  totalShare: PropTypes.number,
  share: PropTypes.number,
};

export default SharePercent;
