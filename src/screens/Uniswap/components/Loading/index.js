import { Modal } from 'react-native';
import PropTypes from 'prop-types';
import { ActivityIndicator, Text, View } from '@components/core/index';
import { COLORS } from '@src/styles';
import React from 'react';
import stylesheet from './style';

const Loading = ({ open }) => (
  <Modal animationType="fade" transparent visible={open}>
    <View style={stylesheet.container}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={stylesheet.desc}>
        {'Completing this action...\n\nPlease do not navigate away from the app.'}
      </Text>
    </View>
  </Modal>
);

Loading.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default Loading;
