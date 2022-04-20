import { Button, Text, View } from '@src/components/core';
import { COLORS } from '@src/styles';
import React from 'react';
import { TextStyle, ViewStyle } from 'react-native';
import Modal from 'react-native-modal';

export interface ModalConfirmProps {
  title?: string;
  description?: string;
  isVisible: boolean;
  style?: ViewStyle;
  leftButtonTitle?: string;
  rightButtonTitle?: string;
  leftButtonStyle?: ViewStyle;
  rightButtonStyle?: ViewStyle;
  onPressLeftButton?: () => void;
  onPressRightButton?: () => void;
  onBackdropPress?: () => void;
}

export const ModalConfirm: React.FC<ModalConfirmProps> = ({
  isVisible,
  title,
  description,
  leftButtonTitle,
  rightButtonTitle,
  leftButtonStyle,
  rightButtonStyle,
  onPressLeftButton,
  onPressRightButton,
  onBackdropPress,
  style,
}) => {
  return (
    <Modal
      isVisible={isVisible}
      useNativeDriver
      useNativeDriverForBackdrop
      animationIn="fadeIn"
      animationOut="fadeOut"
      hideModalContentWhileAnimating
      onBackdropPress={onBackdropPress}
      style={style}
    >
      <View style={modalContainerStyle}>
        <Text style={modalTitleStyle}>{title}</Text>
        <Text style={modalDescriptionStyle}>{description}</Text>
        <View style={rowStyle}>
          <Button
            title={leftButtonTitle || 'Cancel'}
            onPress={() => onPressLeftButton?.()}
            buttonStyle={[defaultLeftButtonStyle, leftButtonStyle]}
          />
          <View style={spaceStyle} />
          <Button
            title={rightButtonTitle || 'Confirm'}
            onPress={() => onPressRightButton?.()}
            buttonStyle={[defaultRightButtonStyle, rightButtonStyle]}
          />
        </View>
      </View>
    </Modal>
  );
};

const modalContainerStyle: ViewStyle = {
  padding: 24,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 16,
  backgroundColor: COLORS.darkGrey,
};

const modalTitleStyle: TextStyle = {
  color: COLORS.white,
  fontSize: 20,
  fontWeight: '700',
  textAlign: 'center',
};

const modalDescriptionStyle: TextStyle = {
  color: COLORS.lightGrey36,
  fontSize: 16,
  fontWeight: '500',
  marginTop: 16,
  textAlign: 'center',
};

const rowStyle: ViewStyle = {
  width: '100%',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginTop: 24,
};

const defaultLeftButtonStyle: ViewStyle = {
  flex: 1,
  backgroundColor: COLORS.lightGrey35,
  height: 50,
  borderRadius: 8,
};

const spaceStyle: ViewStyle = {
  width: 8,
};

const defaultRightButtonStyle: ViewStyle = {
  ...defaultLeftButtonStyle,
  backgroundColor: COLORS.blue5,
};
