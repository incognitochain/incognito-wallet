/* eslint-disable react-native/no-unused-styles */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { Text, Button, Image, TouchableOpacity } from '@src/components/core';
import { ScreenWidth } from '@src/utils/devices';
import internetConnectionIssue from '@src/assets/images/internet_connection.png';
import theme from '@src/styles/theme';
import PropTypes from 'prop-types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '@src/styles';

const ModalPermission = ({ title, subTitle, btnTitle, btnDismiss, isVisible, onPressSetting, onPressDismiss, uri }) => {
  return (
    <Modal isVisible={isVisible} animationIn="fadeIn" animationOut="fadeOut" animationInTiming={800} animationOutTiming={1000}>
      <View style={[styles.container, { backgroundColor: 'white', padding: 20, paddingBottom: 30, paddingTop: 30 }, theme.SHADOW.normal]}>
        <View style={[theme.MARGIN.marginBottomDefault]}>
          <Image source={uri ? uri : internetConnectionIssue} style={{ width: ScreenWidth / 6, height: ScreenWidth / 6 }} />
        </View>
        <View style={[styles.contentContainer, {flex: 2}]}>
          <Text style={[theme.text.headerTextStyle, theme.text.alignCenterText]}>{`${title ?? ''}`}</Text>
          <Text style={[theme.text.largeTitleSize, theme.MARGIN.marginTopDefault, theme.text.alignCenterText]}>{`${subTitle ?? ''}`}</Text>
        </View>
        <View style={[styles.contentContainer, {flex: 1}]}>
          <View style={[theme.FLEX.rowSpaceBetween, theme.FLEX.fullWidth]}>
            <Button onPress={onPressSetting} title={btnTitle ?? ''} textContainerStyle={{ width: ScreenWidth * 0.8 * 0.5 }} style={[theme.BUTTON.BLACK_TYPE, { height: 50, width: ScreenWidth * 0.8 * 0.60 }]} />
            <Button onPress={onPressDismiss} title={btnDismiss ?? 'OK'} textContainerStyle={{ width: ScreenWidth * 0.8 * 0.2 }} style={[theme.BUTTON.BLACK_TYPE, { height: 50, width: ScreenWidth * 0.8 * 0.25 }]} />
          </View>
        </View>
      </View>
    </Modal>
  );
};


ModalPermission.propTypes = {
  isVisible: PropTypes.bool,
  onPressSetting: PropTypes.func,
  onPressDismiss: PropTypes.func,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  btnTitle: PropTypes.string,
  uri: PropTypes.number,
  btnDismiss: PropTypes.string,
};

ModalPermission.defaultProps = {
  isVisible: false,
  onPressSetting: () => { },
  onPressDismiss: () => { },
  title: '',
  subTitle: '',
  btnTitle: '',
  uri: ' ',
  btnDismiss: 'OK'
};

export default ModalPermission;

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
  close: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center'
  }
});