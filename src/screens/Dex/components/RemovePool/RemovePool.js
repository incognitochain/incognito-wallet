import React, { memo } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import removePoolEnhance from '@screens/Dex/components/RemovePool/RemovePool.enhance';
// import Shares from '@screens/Dex/components/Shares';
// import PoolSize from '@screens/Dex/components/PoolSize';
// import Balance from '@screens/DexV2/components/Balance';
// import ExchangeRate from '@screens/Dex/components/ExchangeRate';
import { compose } from 'recompose';
import NetworkFee from '@screens/Dex/components/NetworkFee';

const RemovePool = (props) => {
  const {
    // inputToken,
    // inputValue,
    // outputToken,
    // outputValue,
    // pair,
    // inputBalance,
    // outputBalance,
    // totalShare,
    // share,
    fee
  } = props;

  return (
    <View>
      {/*<Shares totalShare={totalShare} share={share} />*/}
      {/*<Balance*/}
      {/*  title={`${inputToken.symbol} Balance`}*/}
      {/*  token={inputToken}*/}
      {/*  balance={inputBalance}*/}
      {/*  hideRightSymbol*/}
      {/*/>*/}
      {/*{!!outputToken &&(*/}
      {/*  <Balance*/}
      {/*    title={`${outputToken ? outputToken.symbol : ''} Balance`}*/}
      {/*    token={outputToken}*/}
      {/*    balance={outputBalance}*/}
      {/*    hideRightSymbol*/}
      {/*  />*/}
      {/*)}*/}
      {/*<ExchangeRate*/}
      {/*  inputToken={inputToken}*/}
      {/*  inputValue={inputValue}*/}
      {/*  outputToken={outputToken}*/}
      {/*  outputValue={outputValue}*/}
      {/*/>*/}
      {/*<PoolSize*/}
      {/*  inputToken={inputToken}*/}
      {/*  pair={pair}*/}
      {/*  outputToken={outputToken}*/}
      {/*/>*/}
      <NetworkFee fee={fee} />
    </View>
  );
};

RemovePool.propTypes = {
  fee: PropTypes.number.isRequired,
};

export default compose(
  removePoolEnhance
)(memo(RemovePool));
