import React from 'react';
import { COINS } from '@src/constants';
import { calculateOutputValue } from '@screens/DexV2/components/Trade/utils';
import { MAX_DEX_FEE } from '@components/EstimateFee/EstimateFee.utils';
import { MAX_PDEX_TRADE_STEPS } from '@screens/DexV2/constants';

const withEstimateFee = WrappedComp => (props) => {
  const [fee, setFee] = React.useState(MAX_DEX_FEE);
  const [feeToken, setFeeToken] = React.useState(COINS.PRV);

  const { inputToken, outputToken, pairs } = props;

  const estimateFee = () => {
    if (inputToken.id !== COINS.PRV_ID && outputToken?.id !== COINS.PRV_ID) {
      const prvFee = MAX_DEX_FEE;
      setFee(prvFee);
      setFeeToken(COINS.PRV);
      return;
    }

    const prvPair = pairs.find(item =>
      item.keys.includes(inputToken.id) &&
      item.keys.includes(COINS.PRV_ID) &&
      item[COINS.PRV_ID] > 10000 * 1e9
    );
    const prvFee = MAX_DEX_FEE;

    if (inputToken.id !== COINS.PRV_ID && prvPair) {
      const outputValue = Math.max(calculateOutputValue(prvPair, COINS.PRV, prvFee, inputToken), MAX_PDEX_TRADE_STEPS * 20);
      setFeeToken(inputToken);
      setFee(outputValue);
    } else {
      setFee(prvFee);
      setFeeToken(COINS.PRV);
    }
  };

  const inputFee = feeToken?.id === inputToken.id ? fee : 0;
  const prvFee = feeToken?.id === COINS.PRV_ID ? fee : 0;

  React.useEffect(() => {
    if (inputToken && outputToken) {
      estimateFee();
    }
  }, [inputToken, outputToken]);

  return (
    <WrappedComp
      {...{
        ...props,
        fee,
        feeToken,
        inputFee,
        prvFee,
      }}
    />
  );
};

export default withEstimateFee;
