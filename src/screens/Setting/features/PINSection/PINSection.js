import PropTypes from 'prop-types';
import React, { useState } from 'react';
import storageService from '@src/services/storage';
// import SwitchToggle from 'react-native-switch-toggle';
import routeNames from '@routers/routeNames';
import { connect } from 'react-redux';
import { Text, TouchableOpacity, Alert, Switch } from '@components/core';
import { sectionStyle } from '@screens/Setting/features/Section/Section.styled';
import { CONSTANT_KEYS } from '@src/constants';
import { useNavigation } from 'react-navigation-hooks';
import Section from '@screens/Setting/features/Section';

const PINSection = ({ pin }) => {
  const [isBackedUpAccount, setBackupAccount] = useState(false);
  const navigation = useNavigation();
  navigation.addListener('willFocus', () => {
    storageService
      .getItem(CONSTANT_KEYS.IS_BACKEDUP_ACCOUNT)
      .then((isBackedUp) => setBackupAccount(!!JSON.parse(isBackedUp)))
      .catch(() => setBackupAccount(false));
  });

  const showLockAlert = () => {
    Alert.alert(
      'Backup your account first',
      'Please back up your accounts before using pass code',
      [
        {
          text: 'Later',
          style: 'cancel',
        },
        {
          text: 'Back up now',
          onPress: () => {
            navigation?.navigate(routeNames.BackupKeys);
          },
        },
      ],
      { cancelable: false },
    );
  };

  const togglePin = () => {
    if (pin) {
      navigation.navigate(routeNames.AddPin, { action: 'remove' });
    } else {
      navigation.navigate(routeNames.AddPin, { action: 'create' });
    }
  };

  const handlePressToggle = () => {
    return isBackedUpAccount ? togglePin() : showLockAlert();
  };

  return (
    <Section
      label="Security"
      customItems={[
        <TouchableOpacity
          key="PIN"
          onPress={handlePressToggle}
          style={[sectionStyle.subItem]}
        >
          <Text style={[sectionStyle.desc]}>Passcode</Text>
          <Switch onValueChange={handlePressToggle} value={!!pin} />
        </TouchableOpacity>,
      ]}
    />
  );
};

PINSection.defaultProps = {
  pin: '',
};

PINSection.propTypes = {
  pin: PropTypes.string,
};

const mapState = (state) => ({
  pin: state.pin.pin,
});

export default connect(mapState)(PINSection);
