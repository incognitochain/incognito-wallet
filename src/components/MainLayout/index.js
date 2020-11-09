import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { View, ScrollView, FlexView, LoadingContainer } from '@components/core';
import { withLayout_2 } from '@components/Layout';
import Header from '@components/Header/index';
import RightBtn from '@screens/Setting/features/Keychain/RightBtn';
import BtnInfo from '@screens/Setting/features/Keychain/BtnInfo';
import styles from './style';

const MainLayout = ({
  header,
  children,
  scrollable,
  loading,
  hideBackButton,
  noPadding,
  rightHeader,
  customHeaderTitle,
  onGoBack,
}) => {
  return (
    <FlexView style={noPadding && styles.noPaddingStyle}>
      <Header
        title={header}
        hideBackButton={hideBackButton}
        style={noPadding && styles.paddingHeader}
        rightHeader={rightHeader}
        customHeaderTitle={customHeaderTitle}
        onGoBack={onGoBack}
      />
      {loading ? <LoadingContainer /> :
        scrollable ? (
          <ScrollView paddingBottom contentContainerStyle={[styles.content]}>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content]}>
            {children}
          </View>
        )
      }
    </FlexView>
  );
};

MainLayout.propTypes = {
  header: PropTypes.string,
  children: PropTypes.any,
  scrollable: PropTypes.bool,
  loading: PropTypes.bool,
  hideBackButton: PropTypes.bool,
  noPadding: PropTypes.bool,
  rightHeader: PropTypes.any,
  customHeaderTitle: PropTypes.any,
  onGoBack: PropTypes.func,
};

MainLayout.defaultProps = {
  header: '',
  children: null,
  scrollable: false,
  loading: false,
  hideBackButton: false,
  noPadding: false,
  rightHeader: undefined,
  customHeaderTitle: undefined,
  onGoBack: undefined,
};

export default compose(
  withLayout_2,
)(MainLayout);
