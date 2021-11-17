import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { TouchableOpacity, Divider } from '@components/core';
import { SwapIcon } from '@src/components/Icons';
import Row from '@src/components/Row';

const styled = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
});

const SwapButton = ({ onSwapButtons, style }) => (
  <Row style={[styled.container, style]}>
    <Divider />
    <TouchableOpacity onPress={onSwapButtons}>
      <SwapIcon />
    </TouchableOpacity>
    <Divider />
  </Row>
);

SwapButton.propTypes = {
  onSwapButtons: PropTypes.func.isRequired,
  style: PropTypes.any,
};

export default React.memo(SwapButton);
