import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from '@components/core';
import { InfoIcon } from '@components/Icons';
import { useNavigation } from 'react-navigation-hooks';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const HelpIcon = ({ screen, style }) => {
  const navigation = useNavigation();
  const handlePress = () => {
    navigation.navigate(screen);
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handlePress}>
      <InfoIcon/>
    </TouchableOpacity>
  );
};

HelpIcon.propTypes = {
  screen: PropTypes.string.isRequired,
  style: PropTypes.object,
};

HelpIcon.defaultProps = {
  style: null,
};

export default React.memo(HelpIcon);
