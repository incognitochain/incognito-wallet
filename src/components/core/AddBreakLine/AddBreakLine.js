import React, {memo} from 'react';
import {View, StyleSheet } from 'react-native';
import {Divider} from 'react-native-elements';
import PropTypes from 'prop-types';
import { COLORS } from '@src/styles';
import {ChainIcon} from '@components/Icons';

export const styled = StyleSheet.create({
  arrowWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 30,
  },
  divider: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.colorGrey4,
  },
});

const AddBreakLine = ({ style }) => (
  <View style={[styled.arrowWrapper, style]}>
    <Divider style={styled.divider} />
    <ChainIcon />
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
