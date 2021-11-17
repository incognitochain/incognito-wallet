import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Divider } from 'react-native-elements';
import PropTypes from 'prop-types';
import { COLORS } from '@src/styles';

export const styled = StyleSheet.create({
  arrowWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.lightGrey19,
  },
});

const AddBreakLine = ({ style }) => (
  <View style={[styled.arrowWrapper, style]}>
    <Divider style={styled.divider} />
  </View>
);

AddBreakLine.defaultProps = {
  style: undefined
};

AddBreakLine.propTypes = {
  style: PropTypes.any,
};

export default memo(AddBreakLine);
