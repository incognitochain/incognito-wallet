import React from 'react';
import { BackHandler } from 'react-native';
import PropTypes from 'prop-types';
import { useNavigation } from 'react-navigation-hooks';

const useBackHandler = (props = {}) => {
  const { onGoBack } = props;
  const navigation = useNavigation();
  const backAction = () => {
    if (typeof onGoBack === 'function') {
      return onGoBack();
    }
    navigation.goBack();
    return true;
  };

  React.useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backAction);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', backAction);
  }, []);

  return null;
};

useBackHandler.defaultProps = {
  onGoBack: null,
};

useBackHandler.propTypes = {
  onGoBack: PropTypes.func,
};

export default useBackHandler;
