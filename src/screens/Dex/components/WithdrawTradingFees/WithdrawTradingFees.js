import React, { memo } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
// import Shares from '@screens/Dex/components/Shares';
// import Balance from '@screens/DexV2/components/Balance';
// import ExchangeRate from '@screens/Dex/components/ExchangeRate';
// import PoolSize from '@screens/Dex/components/PoolSize';
import withDrawFeeEnhance from '@screens/Dex/components/WithdrawTradingFees/WithdrawTradingFees.enhance';
import { compose } from 'recompose';
import NetworkFee from '@screens/Dex/components/NetworkFee';
// import {useSelector} from 'react-redux';
// import {shareSelectorWithToken} from '@screens/Dex/Liquidity.selector';

const WithdrawTradingFees = (props) => {
  const {
    // inputToken,
    // inputValue,
    // outputToken,
    // outputValue,
    // pair,
    // inputBalance,
    // outputBalance,
    fee,
  } = props;

  // const { share, totalShare } = useSelector(shareSelectorWithToken)(inputToken, outputToken);

  return (
    <View>
      {/*<Shares totalShare={totalShare} share={share} showPercent={false} />*/}
      {/*{!!inputToken && (*/}
      {/*  <Balance*/}
      {/*    title={`${inputToken.symbol} Balance`}*/}
      {/*    token={inputToken}*/}
      {/*    balance={inputBalance}*/}
      {/*    hideRightSymbol*/}
      {/*  />*/}
      {/*)}*/}
      {/*{!!outputToken && (*/}
      {/*  <Balance*/}
      {/*    title={`${outputToken.symbol} Balance`}*/}
      {/*    token={outputToken}*/}
      {/*    balance={outputBalance}*/}
      {/*    hideRightSymbol*/}
      {/*  />*/}
      {/*)}*/}
      {/*{!!inputToken && !!outputToken && (*/}
      {/*<>*/}
      {/*  <ExchangeRate*/}
      {/*    inputToken={inputToken}*/}
      {/*    inputValue={inputValue}*/}
      {/*    outputToken={outputToken}*/}
      {/*    outputValue={outputValue}*/}
      {/*  />*/}
      {/*  <PoolSize*/}
      {/*    inputToken={inputToken}*/}
      {/*    pair={pair}*/}
      {/*    outputToken={outputToken}*/}
      {/*  />*/}
      {/*</>*/}
      {/*)}*/}
      <NetworkFee fee={fee} />
    </View>
  );
};

WithdrawTradingFees.propTypes = {
  inputToken: PropTypes.object.isRequired,
  inputValue: PropTypes.number.isRequired,
  outputToken: PropTypes.object.isRequired,
  outputValue: PropTypes.number.isRequired,
  pair: PropTypes.object.isRequired,
  inputBalance: PropTypes.number.isRequired,
  totalShare: PropTypes.number.isRequired,
  share: PropTypes.number.isRequired,
  fee: PropTypes.number.isRequired,
  outputBalance: PropTypes.number.isRequired,
};

export default compose(
  withDrawFeeEnhance
)(memo(WithdrawTradingFees));

