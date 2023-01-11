import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@src/components/core';
import { useSelector } from 'react-redux';
// import { colorsSelector } from '@src/theme';
import { FONT, COLORS } from '@src/styles';
import { getEsimateTradeError, validatePRVNetworkFee } from './Swap.selector';

const styled = StyleSheet.create({
  container: {
    marginTop: 6,
    marginBottom: 0,
  },
  text: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    color: COLORS.red,
    marginRight: 5,
  },
});

const EstimateTradeError = () => {
  // const colors = useSelector(colorsSelector);
  const error = useSelector(getEsimateTradeError);
  const errorNetworkFeeMessage = useSelector(validatePRVNetworkFee);
  if (!error && !errorNetworkFeeMessage) return null;
  // if (!error) return null;

  return (
    <View style={styled.container}>
      <Text style={styled.text}>{error || errorNetworkFeeMessage}</Text>
      {/* {<Text style={styled.text}>{error}</Text>} */}
    </View>
  );
};

EstimateTradeError.propTypes = {};

export default React.memo(EstimateTradeError);
