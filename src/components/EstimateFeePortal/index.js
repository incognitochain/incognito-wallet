import React from 'react';
import { View, Text, TextInput } from '@src/components/core';
import { CONSTANT_COMMONS } from '@src/constants';
import formatUtils from '@utils/format';
import convert from '@src/utils/convert';
import PropTypes from 'prop-types';
import { styled } from './styled';

export const EstimateFeePortal = ({ unshieldAmount, networkFee, avgUnshieldFee, selectedPrivacy }) => {
  const { externalSymbol, pDecimals, } = selectedPrivacy;
  const amountToNumber = Math.max(convert.toNumber(Number(unshieldAmount) || 0, true), 0);
  const originalAmount = convert.toOriginalAmount(
    amountToNumber,
    pDecimals,
    false,
  );
  const receivedAmount = Math.max(originalAmount - avgUnshieldFee, 0);

  return (
    <View className={styled.container}>
      <TextInput
        label="Incognito network"
        canEditable={false}
        defaultValue={formatUtils.amountFull(networkFee, CONSTANT_COMMONS.DECIMALS['PRV'])}
        prependView={(
          <View style={[styled.spFeeItem]}>
            <Text style={[styled.symbol]}>
              {CONSTANT_COMMONS.CRYPTO_SYMBOL.PRV}
            </Text>
          </View>
        )}
      />

      <TextInput
        label="Bitcoin network (est.)"
        canEditable={false}
        defaultValue={formatUtils.amountFull(avgUnshieldFee, pDecimals)}
        prependView={(
          <View style={[styled.spFeeItem]}>
            <Text style={[styled.symbol]}>
              {externalSymbol}
            </Text>
          </View>
        )}
      />

      <TextInput
        label="Received (est.)"
        canEditable={false}
        defaultValue={formatUtils.amountFull(receivedAmount, pDecimals)}
        prependView={(
          <View style={[styled.spFeeItem]}>
            <Text style={[styled.symbol]}>
              {externalSymbol}
            </Text>
          </View>
        )}
      />
    </View>
  );
};

EstimateFeePortal.propTypes = {
  unshieldAmount: PropTypes.string.isRequired,
  networkFee: PropTypes.number.isRequired,
  avgUnshieldFee: PropTypes.number.isRequired,
  selectedPrivacy: PropTypes.object.isRequired,
};