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
import { CONSTANT_COMMONS } from '@src/constants';
import withAccount from '@screens/DexV2/components/account.enhance';
import ShieldDecentralized from '@screens/Shield/features/ShieldDecentralized';
import { PRV_ID } from '@src/screens/Dex/constants';

const enhance = (WrappedComp) => (props) => {
  const {
    tokenSymbol,
    decentralized,
    isFetched,
    isFetching,
    selectedPrivacy,
    handleShield,
  } = props;
  const { currencyType, isDecentralized }  = selectedPrivacy;

  const [showTerm, setShowTerm] = useState(true);
  const [selectedTerm, setSelectedTerm] = React.useState(undefined);
  const navigation = useNavigation();

  const handleToggleTooltip = () => {
    navigation.navigate(routeNames.CoinInfo, { decentralized });
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
    return (
      <TermOfUseShield
        {
        ...{
          ...props,
          selectedTerm,
          onNextPress: () => setShowTerm(false),
          onSelected: index => setSelectedTerm(index)
        }}
      />
    );
  };

  React.useEffect(() => {
    if ((!CONSTANT_COMMONS.CURRENCY_TYPE_BRIDGE.includes(currencyType) && selectedTerm === undefined) && typeof handleShield === 'function') {
      handleShield();
    }
  }, [selectedTerm]);

  /** render loading */
  if (isFetching) {
    return renderLoading();
  }

  /** render term off user */
  if (isDecentralized && showTerm && selectedPrivacy?.tokenId !== PRV_ID) {
    return renderTermOfUse();
  }

  if (selectedTerm === 1) {
    return (
      <ShieldDecentralized {...{ ...props, setShowTerm}} />
    );
  }

  return (
    <ErrorBoundary>
      {renderHeader()}
      <WrappedComp {...{ ...props, isFetching, isFetched, hasError, selectedTerm, setSelectedTerm}} />
    </ErrorBoundary>
  );
};

export default compose(
  withAccount,
  withShieldData,
  withLayout_2,
  enhance,
);
