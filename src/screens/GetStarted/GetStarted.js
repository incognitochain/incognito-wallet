import { Text, View } from '@src/components/core';
import { ActivityIndicator, Animated } from 'react-native';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { UTILS } from '@src/styles';
import { ButtonBasic } from '@src/components/Button';
import withGetStarted from './GetStarted.enhance';
import style from './style';

class GetStarted extends Component {
  state = {
    moveAni: new Animated.Value(0),
  };

  componentDidMount() {
    const { moveAni } = this.state;
    this.animation = Animated.loop(
      Animated.sequence([
        Animated.timing(moveAni, {
          toValue:
            UTILS.deviceWidth() -
            (100 /* bar size */ + 60) /* container padding */,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(moveAni, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }

  render() {
    const { isInitialing, errorMsg, isCreating, onRetry } = this.props;
    return (
      <View style={style.container}>
        {isInitialing && (
          <View style={style.loadingContainer}>
            <ActivityIndicator size="large" color="#828282" />
          </View>
        )}
        <View style={style.getStartedBlock}>
          <Text style={[style.title, style.centerText]}>
            {isCreating
              ? 'Generating your keychain...\nGive it a few seconds.'
              : 'Entering incognito mode\nfor your crypto...'}
          </Text>
          {errorMsg && (
            <Text style={[style.errorMsg, style.centerText]}>{errorMsg}</Text>
          )}
          {errorMsg && (
            <ButtonBasic
              btnStyle={style.retryBtn}
              title="Retry"
              onPress={onRetry}
            />
          )}
        </View>
      </View>
    );
  }
}

GetStarted.defaultProps = {
  errorMsg: null,
  isInitialing: true,
  isCreating: false,
  onRetry: null,
};

GetStarted.propTypes = {
  errorMsg: PropTypes.string,
  isInitialing: PropTypes.bool,
  isCreating: PropTypes.bool,
  onRetry: PropTypes.func,
};

export default withGetStarted(GetStarted);
