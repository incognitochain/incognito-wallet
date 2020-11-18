import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { isNumber } from 'lodash';
import formatUtil from '@utils/format';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';
import { Text, View } from '@components/core/index';
import Help from '@components/Help';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import helperConst from '@src/constants/helper';
import { useSelector } from 'react-redux';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { COLORS } from '@src/styles';
import stylesheet from '@screens/DexV2/components/ExtraInfo/style';
import convertUtil from '@utils/convert';
import styles from './style';

const getImpact = (input, output) => {
  return ((input - output) / input).toFixed(3);
};

const ExchangeRateImpact = ({
  inputToken,
  inputValue,
  outputToken,
  minimumAmount,
}) => {
  const navigation = useNavigation();

  let right = '';

  let impact = null;
  if (inputToken?.id && outputToken.symbol) {
    const {
      priceUsd:   inputPriceUsd,
      pDecimals:  inputPDecimals
    } = useSelector(selectedPrivacySeleclor.getPrivacyDataByTokenID)(inputToken?.id);
    const {
      priceUsd:   outputPriceUsd,
      pDecimals:  outputPDecimals
    } = useSelector(selectedPrivacySeleclor.getPrivacyDataByTokenID)(outputToken?.id);
    const totalInputUsd
      = convertUtil.toHumanAmount(inputValue * inputPriceUsd, inputPDecimals);
    const totalOutputUsd
      = convertUtil.toHumanAmount(minimumAmount * outputPriceUsd, outputPDecimals);
    if (totalOutputUsd && totalOutputUsd !== 0) {
      const impactValue = getImpact(totalInputUsd, totalOutputUsd);
      if (!isNaN(impactValue)) {
        impact = (
          <Text style={[stylesheet.text, stylesheet.textLeft, { color: impactValue > 0 ? COLORS.orange : COLORS.black, marginRight: 0 }]}>
            {`(${Math.abs(impactValue)})%`}
          </Text>
        );
      }
    }
  }

  if (!(
    !outputToken ||
    !minimumAmount ||
    !isNumber(minimumAmount) ||
    !inputValue || !isNumber(inputValue)
  )) {
    const minRate = (inputValue / Math.pow(10, inputToken.pDecimals || 0)) / (minimumAmount / Math.pow(10, outputToken.pDecimals));
    let maxPrice = '';
    if (minRate >= 1) {
      maxPrice = `${formatUtil.amount(minRate, 0, true)} ${inputToken?.symbol} / ${outputToken.symbol}`;
    } else {
      maxPrice = `${formatUtil.toFixed(minRate, 9)} ${inputToken?.symbol} / ${outputToken.symbol}`;
    }
    right = (
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[stylesheet.text, stylesheet.textLeft, { marginRight: 0 }]}>
          {maxPrice}
        </Text>
        {impact || null}
      </View>
    );
  }
  const onHelpPress = () => {
    navigation.navigate(routeNames.Helper, helperConst.HELPER_CONSTANT.MAX_PRICE_IMPACT);
  };

  return (
    <ExtraInfo
      left={(
        <View style={styles.row}>
          <Text style={styles.extra}>Max price & impact</Text>
          <Help onPress={onHelpPress} />
        </View>
      )}
      right={right}
    />
  );
};

ExchangeRateImpact.propTypes = {
  inputToken: PropTypes.object.isRequired,
  inputValue: PropTypes.number.isRequired,
  outputToken: PropTypes.object.isRequired,
  minimumAmount: PropTypes.number,
};

ExchangeRateImpact.defaultProps = {
  minimumAmount: 0,
};

export default memo(ExchangeRateImpact);
