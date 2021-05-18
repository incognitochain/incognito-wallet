import React from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import {Header, LoadingContainer} from '@src/components';
import { compose } from 'recompose';
import { withLayout_2 } from '@components/Layout';
import withData from '@screens/Home/features/Convert/Convert.enhanceData';
import withConvert from '@screens/Home/features/Convert/Convert.enhance';
import styles from '@screens/Home/features/Convert/Convert.styled';
import { RoundCornerButton } from '@components/core';
import ConvertStep from '@screens/Home/features/Convert/Components/Step';
import theme from '@src/styles/theme';

const Convert = (props) => {
  const {
    steps,
    appLoading,
    currentStep
  } = props;

  const renderContent = () => (
    <>
      <ConvertStep steps={steps} currentStep={currentStep} />
      {/*<View style={styles.footer}>*/}
      {/*  <RoundCornerButton*/}
      {/*    title="Next"*/}
      {/*    disabled={!!currentStep}*/}
      {/*    style={[currentStep ? theme.BUTTON.GRAY_TYPE_DISABLE : theme.BUTTON.BLACK_TYPE]}*/}
      {/*  />*/}
      {/*</View>*/}
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      <Header title="Convert Transaction" />
      {appLoading ? <LoadingContainer /> : renderContent()}
    </View>
  );
};

Convert.propTypes = {
  steps: PropTypes.array,
  appLoading: PropTypes.bool.isRequired,
  currentStep: PropTypes.string.isRequired,
};

Convert.defaultProps = {
  steps: []
};

export default compose(
  withLayout_2,
  withData,
  withConvert,
)(React.memo(Convert));
