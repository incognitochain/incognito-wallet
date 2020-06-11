import React, { Component } from 'react';
import PropTypes from 'prop-types';
import storageService from '@src/services/storage';
import { CONSTANT_KEYS } from '@src/constants';
import routeNames from '@src/router/routeNames';
import { StatusBar } from 'react-native';
import Wizard from './Wizard';

export default class WizardContainer extends Component {
  state = {
    isShow: false
  };

  componentDidMount() {
    this.init();
  }

  markDisplayed = () => {
    storageService.setItem(CONSTANT_KEYS.DISPLAYED_WIZARD, String(true));
  }

  goHome = () => {
    const { navigation } = this.props;
    this.markDisplayed();
    navigation.navigate(routeNames.GetStarted);
  }

  init = async () => {
    try {
      if (!await this.shouldDisplay()) {
        this.goHome();
        return;
      }

      this.setState({ isShow: true });
    } catch {
      this.goHome();
    }
  }

  shouldDisplay = async () => {
    try {
      const isDisplayed = await storageService.getItem(CONSTANT_KEYS.DISPLAYED_WIZARD);

      return !isDisplayed;
    } catch {
      return false;
    }
  }

  render() {
    const { isShow } = this.state;
    
    return (
      isShow ? <Wizard goHome={this.goHome} /> : null
    );
  }
}

WizardContainer.propTypes = {
  navigation: PropTypes.object.isRequired
};