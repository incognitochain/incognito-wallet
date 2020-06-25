import React from 'react';
import { Animated, BackHandler, Easing } from 'react-native';
import TouchID from 'react-native-touch-id';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';
import { View, Text, TouchableOpacity, Image } from '@src/components/core';
import { connect } from 'react-redux';
import { updatePin } from '@src/redux/actions/pin';
import { Icon } from 'react-native-elements';
import convertUtil from '@utils/convert';
import icFaceId from '@src/assets/images/icons/ic_faceid.png';
import styles from './styles';

export const TAG = 'AddPIN';

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
const pinLength = [1, 2, 3, 4, 5, 6];
const opacity = 0.1;

const optionalConfigObject = {
  title: 'Unlock', // Android
  imageColor: '#e00606', // Android
  imageErrorColor: '#ff0000', // Android
  sensorDescription: 'Touch the fingerprint sensor on your device', // Android
  sensorErrorDescription: 'Failed', // Android
  cancelText: 'Cancel', // Android
  fallbackLabel: '', // iOS (if empty, then label is hidden)
  unifiedErrors: false, // use unified error messages (default false)
  passcodeFallback: false, // iOS - allows the device to fall back to using the passcode, if faceid/touch is not available. this does not mean that if touchid/faceid fails the first few times it will revert to passcode, rather that if the former are not enrolled, then it will use the passcode.
};

class AddPIN extends React.Component {
  static waiting = false;

  constructor(props) {
    super(props);

    const { action } = props.navigation?.state?.params;

    this.state = {
      pin1: '',
      pin2: '',
      nextPin: false,
      bioSupportedType: null,
      action,
    };
    this.animatedValue = new Animated.Value(0);
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    this.checkTouchSupported();
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  handleAnimation = () => {
    Animated.sequence([
      // start rotation in one direction (only half the time is needed)
      Animated.timing(this.animatedValue, {toValue: 1.0, duration: 50, easing: Easing.linear, useNativeDriver: true}),
      Animated.timing(this.animatedValue, {toValue: -1.0, duration: 50, easing: Easing.linear, useNativeDriver: true}),
      Animated.timing(this.animatedValue, {toValue: 0.0, duration: 50, easing: Easing.linear, useNativeDriver: true})
    ]).start();
  };

  checkTouchSupported() {
    const { action } = this.state;
    if (action === 'login' || action === 'remove') {
      TouchID.isSupported(optionalConfigObject)
        .then((biometryType) => {
          this.setState({bioSupportedType: biometryType});
          this.handleBioAuth();
        })
        .catch(() => null);
    }
  }

  handleBackPress = () => {
    return true;
  };

  isCorrectPin(pin2) {
    const { pin } = this.props;
    if (convertUtil.toHash(pin2) !== pin) {
      this.handleAnimation();
      return false;
    }

    return true;
  }

  updatePin(newPin) {
    const { navigation, updatePin } = this.props;
    updatePin(newPin);
    navigation.goBack();
  }

  handleInput(key) {
    const { pin } = this.props;
    const { pin1, action, nextPin, pin2 } = this.state;
    const currentPin = (nextPin ? pin2 : pin1) + key;

    if (nextPin) {
      this.setState({ pin2: currentPin });
    } else {
      this.setState({ pin1: currentPin });
    }

    if (currentPin.length === pinLength.length) {

      if (nextPin && pin1 !== currentPin) {
        // Toast.showError(MESSAGES.INCORRECT_PIN);
        this.handleAnimation();
      } else if (!pin) {
        if (!pin2) {
          return this.setState({ nextPin: true });
        } else {
          this.updatePin(currentPin);
        }
      } else if(nextPin) {
        this.updatePin(currentPin);
      } else if (this.isCorrectPin(currentPin)) {
        if (action === 'remove') {
          this.removeSuccess();
        } else if (action === 'login') {
          this.loginSuccess();
        }
      }

      if (nextPin) {
        this.setState({ pin2: '' });
      } else {
        this.setState({ pin1: '' });
      }
    }
  }

  clearInput() {
    const { pin1, nextPin, pin2 } = this.state;
    if (nextPin) {
      this.setState({ pin2: pin2.slice(0, Math.max(pin2.length - 1, 0)) });
    } else {
      this.setState({ pin1: pin1.slice(0, Math.max(pin1.length - 1, 0)) });
    }
  }

  loginSuccess = () => {
    const { navigation } = this.props;
    const { redirectRoute } = navigation?.state?.params;
    if (redirectRoute) {
      navigation.navigate(redirectRoute, {});
    } else {
      navigation.goBack();
    }
  };

  removeSuccess = () => {
    this.updatePin('');
  };

  handleBioAuth = () => {
    TouchID.authenticate('', optionalConfigObject)
      .then(() => {
        const { action } = this.state;
        if (action === 'login') {
          this.loginSuccess();
        } else {
          this.removeSuccess();
        }
      })
      .catch(() => null);
  };

  renderTitle() {
    const { pin } = this.props;
    const { nextPin } = this.state;

    if (!pin) {
      if (nextPin) {
        return <Text style={styles.title}>Please re-enter your passcode</Text>;
      }
      return <Text style={styles.title}>Enter a new passcode</Text>;
    }

    if (pin) {
      return <Text style={styles.title}>Enter your passcode</Text>;
    }
  }

  render() {
    const { pin1, action, nextPin, pin2, bioSupportedType } = this.state;
    const { navigation } = this.props;
    const userPin = nextPin ? pin2 : pin1;

    return (
      <View style={styles.container}>
        { (action === 'login' || action === 'remove') && bioSupportedType && (
          <TouchableOpacity style={styles.fingerprint} onPress={this.handleBioAuth} activeOpacity={opacity}>
            {
              bioSupportedType === 'FaceID' ? <Image source={icFaceId} style={[styles.icon, { height: 45, width: 45, resizeMode: 'contain' }]} />
                :  <Icon containerStyle={styles.icon} type='material' name='fingerprint' size={50} />
            }
          </TouchableOpacity>
        )}
        {this.renderTitle()}
        <View style={styles.input}>
          {pinLength.map(item =>
            <View key={item} style={[styles.dot, userPin.length >= item && styles.active]} />
          )}
        </View>
        <Animated.View style={{
          transform: [{
            translateX: this.animatedValue.interpolate({
              inputRange: [-1, 1],
              outputRange: [-10, 10]
            })
          }]
        }}
        >
          <View style={styles.keyboard}>
            {keys.map(key => (
              <TouchableOpacity key={key} id={key} style={styles.key} onPress={() => this.handleInput(key)} activeOpacity={opacity}>
                <Text style={styles.keyText}>{key}</Text>
              </TouchableOpacity>
            ))}
            { action !== 'login' && (
              <TouchableOpacity style={[styles.key]} onPress={() => navigation.goBack()} activeOpacity={opacity}>
                <Icon containerStyle={styles.icon} type='material' name="chevron-left" size={35} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.key, styles.lastKey]} onPress={() => this.handleInput('0')} activeOpacity={opacity}>
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key]} onPress={() => this.clearInput()} activeOpacity={opacity}>
              <Icon containerStyle={styles.icon} type='material' name="backspace" size={20} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }
}

AddPIN.propTypes = {
  navigation: PropTypes.object.isRequired,
  updatePin: PropTypes.func.isRequired,
  pin: PropTypes.string,
};

AddPIN.defaultProps = {
  pin: '',
};

const mapStateToProps = state => ({
  pin: state.pin.pin,
});

const mapDispatchToProps = { updatePin };

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddPIN);
