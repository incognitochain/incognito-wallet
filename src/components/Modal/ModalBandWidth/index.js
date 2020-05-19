import React from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { Text, Button, Image } from '@src/components/core';
import { ScreenWidth } from '@src/utils/devices';
import bandWidth from '@src/assets/images/bandwidth.png';
import theme from '@src/styles/theme';
import PropTypes from 'prop-types';

// Yes, it should be the same and reusable with another modal
// But for now, I want to separately the modal type.
// Will be change in the future if needed, for now, no need.
// Ui change immediately
const ModalBandWidth = ({title, subTitle, btnTitle, isVisible, btnSetting, onPress, onPressSetting, uri }) => {
  return (
    <Modal isVisible={isVisible} animationIn="fadeIn" animationOut="fadeOut" animationInTiming={800} animationOutTiming={1000}>
      <View style={[styles.container, { backgroundColor: 'white', padding: 20 }, theme.SHADOW.normal]}>
        <View style={styles.contentContainer}>
          <Text style={[theme.text.headerTextStyle, theme.text.alignCenterText]}>{`${title ?? ''}`}</Text>
          <Text style={[theme.text.largeTitleSize, theme.MARGIN.marginTopDefault, theme.text.alignCenterText]}>{`${subTitle ?? ''}`}</Text>
        </View>
        <View style={styles.contentContainer}>
          <View style={[theme.MARGIN.marginBottomDefault]}>
            <Image source={uri ? uri : bandWidth} style={{ width: ScreenWidth / 5, height: ScreenWidth / 5 }} />
          </View>
          <View style={[theme.FLEX.rowSpaceBetween, theme.FLEX.fullWidth]}>
            <Button onPress={onPressSetting} title={btnTitle ?? ''} textContainerStyle={{ width: ScreenWidth * 0.8 * 0.35 }} />
            <Button onPress={onPress} title={btnSetting ?? ''} textContainerStyle={{ width: ScreenWidth * 0.8 * 0.35 }} />
          </View>
        </View>
      </View>
    </Modal>
  );
};


ModalBandWidth.propTypes = {
  isVisible: PropTypes.bool,
  onPressSetting: PropTypes.func,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  btnTitle: PropTypes.string,
  btnSetting: PropTypes.string,
  uri: PropTypes.number,
};

ModalBandWidth.defaultProps = {
  isVisible: false,
  onPressSetting: () => { },
  title: '',
  subTitle: '',
  btnTitle: '',
  btnSetting: '',
  uri: ' ',
};

export default ModalBandWidth;

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
    alignItems: 'center'
  }
});