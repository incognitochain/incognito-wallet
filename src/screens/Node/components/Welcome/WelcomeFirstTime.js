import React from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity } from 'react-native';
import { Text, Image, View, Button, ScrollView } from '@components/core';
import nodeImg from '@assets/images/node/node.png';
import NavigationService from '@src/services/NavigationService';
import routeNames from '@src/router/routeNames';
import Header from '@src/components/Header';
import theme from '@src/styles/theme';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, FONT } from '@src/styles';
import styles from './style';

const WelcomeFirstTime = ({ onPressOk }) => (
  <ScrollView style={styles.container}>

    <View style={styles.pNode}>
     
      <Text style={[styles.buyText, {textAlign: 'center', color: 'black'}]}>Welcome to the network!</Text>
      <Text style={[styles.getNode, theme.MARGIN.marginTopAvg, {fontSize: FONT.FONT_SIZES.regular, textAlign: 'center'}]}>You`re all setup and ready to begin powering Incognito. To keep the network secure, Nodes are selected to wok at random. Your first earnings will show up anywhere between 1 - 14 days.</Text>
      <Button
        style={[styles.pNodeButton, theme.BUTTON.BLACK_TYPE, theme.MARGIN.marginTopAvg]}
        onPress={onPressOk}
        title='OK'
        titleStyle={[theme.text.BUTTON_TITLE]}
      />
    </View>
  </ScrollView>
);

export default WelcomeFirstTime;
