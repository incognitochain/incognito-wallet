import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '@src/styles';
import { modalSelector, modalLoadingSelector } from './modal.selector';
import { actionToggleModal } from './modal.actions';
import LoadingModal from './features/LoadingModal';

const styled = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.overlayBlackDark,
    width: '100%',
  },
});
const ModalComponent = () => {
  const { visible, data, shouldCloseModalWhenTapOverlay, onBack } = useSelector(
    modalSelector,
  );
  const {
    toggle: toggleLoading,
    title: titleLoading,
    desc: descLoading,
  } = useSelector(modalLoadingSelector);
  const dispatch = useDispatch();
  const handleToggle = async () =>
    shouldCloseModalWhenTapOverlay ? await dispatch(actionToggleModal()) : null;
  const onRequestClose = async () => {
    await dispatch(actionToggleModal());

    if (typeof onBack === 'function') {
      onBack();
    }
  };
  return (
    <Modal
      presentationStyle="overFullScreen"
      animationType="fade"
      visible={visible}
      transparent
      onRequestClose={onRequestClose}
    >
      <TouchableWithoutFeedback onPress={handleToggle}>
        <SafeAreaView style={styled.container}>
          {data}
          {toggleLoading && (
            <LoadingModal title={titleLoading} desc={descLoading} />
          )}
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

ModalComponent.defaultProps = {};

ModalComponent.propTypes = {};

export default ModalComponent;
