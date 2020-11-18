import React from 'react';
import PropTypes from 'prop-types';
import formatUtil from '@utils/format';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';
import { COINS } from '@src/constants';
import { PowerTrade } from '@screens/DexV2/components/Powered';

const EmptyPoolSize = React.memo(() => (
  <ExtraInfo left="Pool size" right="Loading" />
));

const PoolSize = ({ inputToken, outputToken, pair, network, hasPower, quote }) => {
  const renderMain = () => {
    try {
      if(hasPower && !(pair && (!quote || (quote && !!quote?.crossTrade)))) {
        return(
          <ExtraInfo
            left={hasPower ? <PowerTrade network={network} /> : 'Pool size'}
            right=""
          />
        );
      }
      if (!pair || !pair.length || !inputToken || !outputToken) {
        return <EmptyPoolSize />;
      }
      if (pair.length === 1) {
        const inputPool = pair[0][(inputToken?.id)] || 0;
        const outputPool = pair[0][(outputToken?.id)] || 0;
        const formattedInputPool = formatUtil.amount(
          inputPool,
          inputToken?.pDecimals,
          true,
        );
        const formattedOutputPool = formatUtil.amount(
          outputPool,
          outputToken?.pDecimals,
          true,
        );
        if (
          !formattedInputPool ||
          !formattedOutputPool ||
          !inputPool ||
          !outputPool
        ) {
          return <EmptyPoolSize />;
        }
        return (
          <ExtraInfo
            left={hasPower ? <PowerTrade network={network} /> : 'Pool size'}
            right={`${formattedInputPool} ${inputToken?.symbol} + ${formattedOutputPool} ${outputToken?.symbol}`}
          />
        );
      }
      const inputPool1 = pair[0][(inputToken?.id)] || 0;
      const outputPool1 = pair[0][COINS.PRV_ID] || 0;
      const formattedInputPool1 = formatUtil.amount(
        inputPool1,
        inputToken?.pDecimals,
        true,
      );
      const formattedOutputPool1 = formatUtil.amount(
        outputPool1,
        COINS.PRV.pDecimals,
        true,
      );
      const inputPool2 = pair[1][COINS.PRV_ID] || 0;
      const outputPool2 = pair[1][(outputToken?.id)] || 0;
      const formattedInputPool2 = formatUtil.amount(
        inputPool2,
        COINS.PRV.pDecimals,
        true,
      );
      const formattedOutputPool2 = formatUtil.amount(
        outputPool2,
        outputToken?.pDecimals,
        true,
      );
      if (
        !formattedInputPool1 ||
        !formattedOutputPool1 ||
        !formattedInputPool2 ||
        !formattedOutputPool2 ||
        !inputPool1 ||
        !outputPool1 ||
        !inputPool2 ||
        !outputPool2
      ) {
        return <EmptyPoolSize />;
      }

      return (
        <>
          <ExtraInfo
            left={hasPower ? <PowerTrade network={network} /> : 'Pool size'}
            right={`${formattedInputPool1} ${inputToken?.symbol} + ${formattedOutputPool1} ${COINS.PRV.symbol}`}
          />
          <ExtraInfo
            left={hasPower ? <PowerTrade network={network} /> : 'Pool size'}
            right={`${formattedInputPool2} ${COINS.PRV.symbol} + ${formattedOutputPool2} ${outputToken?.symbol}`}
          />
        </>
      );
    } catch (error) {
      console.debug(error);
    }
  };
  return renderMain();
};

PoolSize.propTypes = {
  inputTokenPoolSize: PropTypes.object.isRequired,
  outputToken: PropTypes.object.isRequired,
  pair: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired,
  network: PropTypes.string,
  hasPower: PropTypes.bool,
  quote: PropTypes.object
};

PoolSize.defaultProps = {
  network: null,
  hasPower: false,
  quote: null
};

export default React.memo(PoolSize);
