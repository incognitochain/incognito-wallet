import { BackHandler } from 'react-native';
import { useFocusEffect } from 'react-navigation-hooks';
import PropTypes from 'prop-types';

export const useBackHandler = (props) => {
  const { handleGoBack } = props;
  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (typeof handleGoBack === 'function') {
          handleGoBack();
        }
        return true;
      },
    );
    return () => backHandler.remove();
  });
};

useBackHandler.propTypes = {
  handleGoBack: PropTypes.func,
};

useBackHandler.defaultProps = {
  handleGoBack: null,
};
