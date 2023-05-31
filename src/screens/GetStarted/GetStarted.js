import { ActivityIndicator, Text, Text3 } from '@src/components/core';
import PropTypes from 'prop-types';
import React from 'react';
import { ButtonBasic } from '@src/components/Button';
import { View2 } from '@components/core/View';
import SplashScreen from 'react-native-splash-screen';
import withGetStarted from './GetStarted.enhance';
import style from './style';

const GetStarted = React.memo((props) => {
  const { loading, errorMsg = '', onRetry } = props;

  React.useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <View2 style={[style.container, { paddingHorizontal: 24 }]}>
      {loading && (
        <View2 style={style.loadingContainer}>
          <ActivityIndicator size="large" />
        </View2>
      )}
      <View2 style={style.getStartedBlock}>
        {!errorMsg && loading && (
          <Text style={[style.title, style.centerText]}>
            {'Entering incognito mode\nfor your crypto...'}
          </Text>
        )}
        {!!errorMsg && !loading && (
          <>
            <Text3 style={[style.errorMsg, style.centerText]}>{errorMsg}</Text3>
            <ButtonBasic
              btnStyle={style.retryBtn}
              title="Retry"
              onPress={onRetry}
            />
          </>
        )}
      </View2>
    </View2>
  );
});

GetStarted.propTypes = {
  errorMsg: PropTypes.string,
  loading: PropTypes.bool.isRequired,
  onRetry: PropTypes.func.isRequired,
};

export default withGetStarted(GetStarted);
