/* eslint-disable react/prop-types */
import { View, Text } from '@components/core';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Header from '@src/components/Header';
import NavigationService from '@src/services/NavigationService';
import routeNames from '@src/router/routeNames';
import BtnMoreInfo from '@src/components/Button/BtnMoreInfo';
import LogManager from '@src/services/LogManager';
import WifiManager from 'react-native-wifi-reborn';

import BtnWithBlur from '@src/components/Button/BtnWithBlur';
import theme from '@src/styles/theme';
import styles from './style';

class BasicInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      device: {}
    };
    
  }
  componentDidMount = async () => {
    WifiManager.getCurrentWifiSSID().then(
      ssid => {
        console.log('Your current connected wifi SSID is ' + ssid);
      },
      () => {
        console.log('Cannot get current SSID!');
      }
    );
  }

  render() {
    const {navigation} = this.props;
    const {device} = navigation.state.params;
    return (
      <View style={styles.containerDetail}>
        <Header
          title={`Node ${device?.product_name || ''}`}
        />
        <View style={{marginTop: 20}}>
          <View style={styles.item}>
            <Text style={[theme.text.boldTextStyle]}>Update Wifi</Text>
            <BtnWithBlur onPress={()=>{NavigationService.navigate(routeNames.UpdateWifi);}} text="Change WiFi" btnStyle={[theme.text.boldTextStyle]} />
          </View>
          <View style={styles.item}>
            <Text style={[theme.text.boldTextStyle]}>Update Firmware</Text>
            <BtnWithBlur text="Update" btnStyle={[theme.text.boldTextStyle]} />
          </View>
        </View>
      </View>
    );
  }
}

BasicInfo.propTypes = {
};

export default BasicInfo;

