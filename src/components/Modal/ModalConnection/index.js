import React from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { Text, Button, Image } from '@src/components/core';
import { ScreenWidth } from '@src/utils/devices';
import internetConnectionIssue from '@src/assets/images/internet_connection.png';
import theme from '@src/styles/theme';
import PropTypes from 'prop-types';

const ModalConnection = ({ isVisible, onPressSetting }) => {
  return (
    <Modal isVisible={isVisible} animationIn="fadeIn" animationOut="fadeOut" animationInTiming={800} animationOutTiming={1000}>
      <View style={[styles.container, { backgroundColor: 'white', padding: 20 }, theme.SHADOW.normal]}>
        <View style={styles.contentContainer}>
          <Text style={[theme.text.headerTextStyle, theme.text.alignCenterText]}>Connectivity problem</Text>
          <Text style={[theme.text.largeTitleSize, theme.MARGIN.marginTopDefault]}>There is a problem with your connection. Make sure you checked and enabled Wifi or 3G/4G/5G. </Text>
        </View>
        <View style={styles.contentContainer}>
          <View style={[theme.MARGIN.marginBottomDefault]}>
            <Image source={internetConnectionIssue} style={{ width: ScreenWidth / 5, height: ScreenWidth / 5 }} />
          </View>
          <View style={[theme.FLEX.rowSpaceBetween, theme.FLEX.fullWidth]}>
            <Button onPress={onPressSetting} title="Go to Setting" textContainerStyle={{ width: '100%' }} />
          </View>
        </View>
      </View>
    </Modal>
  );
};


ModalConnection.propTypes = {
  isVisible: PropTypes.bool,
  onPressSetting: PropTypes.func,
};

ModalConnection.defaultProps = {
  isVisible: false,
  onPressSetting: () => { }
};

export default ModalConnection;

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