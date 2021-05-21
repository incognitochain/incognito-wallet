import React, { useState } from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import LoadingContainer from '@components/LoadingContainer';
import Header from '@components/Header';
import { styled } from '@screens/Shield/features/GenQRCode/GenQRCode.styled';
import { BtnInfo } from '@components/Button';
import routeNames from '@routers/routeNames';
import { useNavigation } from 'react-navigation-hooks';
import TermOfUseShield from '@screens/Shield/features/TermOfUseShield';
import { withLayout_2 } from '@components/Layout';
import withShieldData from '@screens/Shield/features/GenQRCode/GenQRCode.data';
import { compose } from 'recompose';

const enhance = (WrappedComp) => (props) => {
  const {
    tokenSymbol,
    isShieldAddressDecentralized,
    selectedPrivacy,
    isFetched,
    isFetching,
    loading,
  } = props;

  const [showTerm, setShowTerm] = useState(true);
  const navigation = useNavigation();

  const handleToggleTooltip = () => {
    navigation.navigate(routeNames.CoinInfo, { isShieldAddressDecentralized });
  };
  const hasError = !isFetched && !isFetching;

  const handleGoBack = () => {
    navigation.navigate(routeNames.Shield);
  };

  const renderHeader = React.useCallback(() => (
    <Header
      title={`Shield ${tokenSymbol}`}
      titleStyled={styled.titleStyled}
      rightHeader={<BtnInfo isBlack onPress={handleToggleTooltip} />}
      onGoBack={handleGoBack}
    />
  ), [tokenSymbol]);

  const renderLoading = React.useCallback(() => (
    <>
      {renderHeader()}
      <LoadingContainer />
    </>
  ), []);

  const renderTermOfUse = () => {
    return <TermOfUseShield onNextPress={() => setShowTerm(false)} />;
  };

  /** render loading */
  if (isFetching || loading) {
    return renderLoading();
  }

  /** render term off user */
  if (
    isShieldAddressDecentralized === false
    && (selectedPrivacy?.currencyType === 1 || selectedPrivacy?.currencyType === 3)
    && !selectedPrivacy?.isVerified
    && selectedPrivacy?.priceUsd <= 0
    && !hasError
    && showTerm
  ) {
    return renderTermOfUse();
  }

  return (
    <ErrorBoundary>
      {renderHeader()}
      <WrappedComp {...{ ...props, isFetching, isFetched, hasError }} />
    </ErrorBoundary>
  );
};

export default compose(
  withLayout_2,
  withShieldData,
  enhance,
);
