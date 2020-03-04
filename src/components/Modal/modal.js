import React from 'react';
import {View, StyleSheet, Modal, TouchableWithoutFeedback} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import PropTypes from 'prop-types';
import {COLORS} from '@src/styles';
import {modalSelector} from './modal.selector';
import {actionToggleModal} from './modal.actions';

const styled = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlayBlack,
    position: 'relative',
    zIndex: 1,
  },
});

const ModalComponent = props => {
  const {visible, data} = useSelector(modalSelector);
  const dispatch = useDispatch();
  const handleToggle = () => {
    dispatch(
      actionToggleModal({
        visible: !visible,
        data: visible ? null : data,
      }),
    );
  };
  return (
    <Modal animationType="slide" transparent visible={visible}>
      <TouchableWithoutFeedback style={styled.overlay} onPress={handleToggle}>
        {data}
      </TouchableWithoutFeedback>
    </Modal>
  );
};

ModalComponent.defaultProps = {};

ModalComponent.propTypes = {};

export default ModalComponent;
