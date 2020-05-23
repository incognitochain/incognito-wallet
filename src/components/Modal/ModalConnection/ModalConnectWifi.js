import React from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { Text, Button, Image } from '@src/components/core';
import { ScreenWidth } from '@src/utils/devices';
import internetConnectionIssue from '@src/assets/images/internet_connection.png';
import theme from '@src/styles/theme';
import PropTypes from 'prop-types';
import Loading from '@src/components/core/ActivityIndicator/Loading';
import CheckSuccess from '@src/components/core/ActivityIndicator/CheckSuccess';
import NetworkDown from '@src/components/Network/NetworkDown';

// Yes, it should be the same and reusable with another modal
// But for now, I want to separately the modal type.
// Will be change in the future if needed, for now, no need.
// Ui change immediately
const ModalConnectWifi = ({ title, titleConfirm, titleRetry, isLoading, isSuccess, isVisible, onPressOK, onPressRetry }) => {
  return (
    <Modal isVisible={isVisible} animationIn="fadeIn" animationOut="fadeOut" animationInTiming={800} animationOutTiming={1000}>
      <View style={[styles.container, { backgroundColor: 'white', padding: 20 }, theme.SHADOW.normal]}>
        <View style={styles.contentContainer}>
          <Text style={[theme.text.headerTextStyle, theme.text.alignCenterText]}>{title}</Text>
        </View>
        <View style={styles.contentContainer}>
          <View style={[theme.MARGIN.marginBottomDefault]}>
            {isLoading ? <Loading /> : isSuccess ? <CheckSuccess /> : <NetworkDown />}
          </View>
        </View>
        <View style={[styles.contentContainer, theme.FLEX.rowSpaceBetween, theme.FLEX.fullWidth]}>
          <Button onPress={onPressOK} title={titleConfirm} textContainerStyle={{ width: ScreenWidth * 0.8 * 0.35 }} />
          <Button onPress={onPressRetry} title={titleRetry} textContainerStyle={{ width: ScreenWidth * 0.8 * 0.35 }} />
        </View>
      </View>
    </Modal>
  );
};


ModalConnectWifi.propTypes = {
  isVisible: PropTypes.bool,
  onPressSetting: PropTypes.func,
};

ModalConnectWifi.defaultProps = {
  isVisible: false,
  onPressSetting: () => { }
};

export default ModalConnectWifi;

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.BORDER_RADIUS.picker,
    width: ScreenWidth * 0.8,
    height: ScreenWidth * 0.8,
    backgroundColor: 'transparent',
    alignContent: 'center',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  }
});