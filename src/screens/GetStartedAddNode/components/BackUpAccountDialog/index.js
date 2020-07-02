import PropTypes from 'prop-types';
import { ButtonExtension, Text, View, TouchableOpacity } from '@components/core';
import React from 'react';
import Dialog, { DialogContent } from 'react-native-popup-dialog';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '@src/styles';
import theme from '@src/styles/theme';
import styles from './styles';

export const DialogNotify = React.memo(({ visible, onClose })=>{
  return (
    <Dialog
      width={0.8}
      height={0.35}
      visible={visible}
    >
      <DialogContent style={styles.dialog_container}>
        <Text style={styles.dialog_title_text}>
          Keep your Node safe.
        </Text>

        <View style={styles.dialog_content}>
          <Text style={styles.dialog_content_text}>
            A keychain has been created for you. Remember to copy your private key keep it somewhere safe.
          </Text>
        </View>
        <ButtonExtension
          titleStyle={styles.textTitleButton}
          buttonStyle={[styles.dialog_button, theme.BUTTON.BLACK_TYPE]}
          onPress={onClose}
          title="OK"
        />
      </DialogContent>
    </Dialog>
  );
});

DialogNotify.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
