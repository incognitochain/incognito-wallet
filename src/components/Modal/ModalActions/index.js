/* eslint-disable react-native/no-unused-styles */
import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { Text, Button, Image } from '@src/components/core';
import { ScreenWidth } from '@src/utils/devices';
import bandWidth from '@src/assets/images/bandwidth.png';
import theme from '@src/styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import { COLORS } from '@src/styles';

// Yes, it should be the same and reusable with another modal
// But for now, I want to separately the modal type.
// Will be change in the future if needed, for now, no need.
// Ui change immediately
const ModalActions = ({title, subTitle, btnTitle, isVisible, btnSetting, onPress, onPressFirst, uri }) => {
  return (
    <Modal isVisible={isVisible} animationIn="fadeIn" animationOut="fadeOut" animationInTiming={800} animationOutTiming={1000}>
      <View style={[styles.container, { backgroundColor: 'white', padding: 20, paddingBottom: 30, paddingTop: 30 }, theme.SHADOW.normal]}>
        <View style={[styles.contentContainer, {flex: 7}]}>
          <Text style={[theme.text.headerTextStyle, theme.text.alignCenterText, theme.MARGIN.marginTopDefault]}>{`${title ?? ''}`}</Text>
          <Text style={[theme.text.largeTitleSize, theme.MARGIN.marginTopDefault, theme.text.alignCenterText, { color: COLORS.colorGreyBold,}]}>{`${subTitle ?? ''}`}</Text>
        </View>
        <View style={[styles.contentContainer, {flex: 3}]}>
          <View style={[theme.FLEX.rowSpaceBetween, theme.FLEX.fullWidth]}>
            <Button style={[theme.BUTTON.BLACK_TYPE, {width: ScreenWidth * 0.8*0.42}]} onPress={onPressFirst} title={btnTitle ?? ''} textContainerStyle={{ width: ScreenWidth * 0.8 * 0.35 }} />
            <Button style={[theme.BUTTON.BLACK_TYPE, {width: ScreenWidth * 0.8*0.42}]} onPress={onPress} title={btnSetting ?? ''} textContainerStyle={{ width: ScreenWidth * 0.8 * 0.35 }} />
          </View>
        </View>
      </View>
      
    </Modal>
  );
};


ModalActions.propTypes = {
  isVisible: PropTypes.bool,
  onPressFirst: PropTypes.func,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  btnTitle: PropTypes.string,
  btnSetting: PropTypes.string,
  uri: PropTypes.number,
};

ModalActions.defaultProps = {
  isVisible: false,
  onPressFirst: () => { },
  title: '',
  subTitle: '',
  btnTitle: '',
  btnSetting: '',
  uri: ' ',
};

export default ModalActions;

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