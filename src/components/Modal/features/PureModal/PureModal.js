import { Modal, SafeAreaView, StyleSheet } from 'react-native';
import React from 'react';
import PropTypes from 'prop-types';

const styled = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
  },
});

const PureModal = ({ visible, content, animationType = 'fade', ...rest }) => (
  <Modal
    presentationStyle="overFullScreen"
    animationType={animationType}
    visible={visible}
    transparent
    {...rest}
  >
    <SafeAreaView style={styled.overlay}>{content}</SafeAreaView>
  </Modal>
);

PureModal.defaultProps = {
  content: () => null,
};

PureModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  content: PropTypes.element,
  animationType: PropTypes.string,
};

export default PureModal;
