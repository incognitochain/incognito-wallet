import React from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  RoundCornerButton,
} from '@components/core/index';
import { Overlay } from 'react-native-elements';
import styles from './style';

class SuccessModal extends React.Component {
  render() {
    const {
      visible,
      title,
      description,
      buttonTitle,
      extraInfo,
      closeSuccessDialog,
      buttonStyle,
    } = this.props;
    return (
      <Overlay isVisible={visible} overlayStyle={styles.dialog}>
        <View style={[styles.dialogContent]}>
          {!!title && (
            <Text style={styles.dialogTitle}>
              {title}
            </Text>
          )}
          {!!description && (
            <Text style={styles.dialogDesc}>
              {description}
            </Text>
          )}
          {!!extraInfo && (
            <Text style={styles.extraInfo}>
              {extraInfo}
            </Text>
          )}
          <RoundCornerButton
            onPress={closeSuccessDialog}
            title={buttonTitle}
            style={[styles.button, buttonStyle]}
          />
        </View>
      </Overlay>
    );
  }
}

SuccessModal.defaultProps = {
  buttonTitle: 'OK',
  extraInfo: '',
  buttonStyle: null,
  description: '',
  title: '',
};

SuccessModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  closeSuccessDialog: PropTypes.func.isRequired,
  extraInfo: PropTypes.string,
  buttonTitle: PropTypes.string,
  buttonStyle: PropTypes.object,
};

export default SuccessModal;
