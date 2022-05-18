import React from 'react';
import { Text, View } from 'react-native';
import { Header } from '@src/components';
import { compose } from 'recompose';
import Tabs from '@screens/Dex/components/Tabs';
import { RefreshControl, RoundCornerButton, ScrollView } from '@components/core';
import witEnhance from '@screens/Dex/Liquidity.enhance';
import withData from '@screens/Dex/Liquidity.enhanceData';
import AddPool from '@screens/Dex/components/AddPool';
import PropTypes from 'prop-types';
import InputView from '@screens/Dex/components/InputView';
import { LIQUIDITY_TITLES, HEADER_TABS } from '@screens/Dex/Liquidity.constants';
import RemovePool from '@screens/Dex/components/RemovePool';
import WithdrawTradingFees from '@screens/Dex/components/WithdrawTradingFees';
import styles from '@screens/DexV2/components/Trade/style';
import { useSelector } from 'react-redux';
import { disableButton } from '@screens/Dex/Liquidity.selector';
// import { ArrowRightGreyIcon } from '@components/Icons';
import { styled } from '@screens/Dex/style';
import { withLayout_2 } from '@components/Layout';
import globalStyled from '@src/theme/theme.styled';

const Liquidity = React.memo((props) => {
  const {
    onLoadData,
    isLoading,
    isFiltering,
    inputError,
    outputError,
    tabName,
    pair,
    onNextPress,
    // onHistoriesPress,
    outputToken,
  } = props;

  const disabled = useSelector(disableButton);
  // const showHistories = useSelector(hasHistories);

  const renderHeader = () => {
    return (
      <Header title="Liquidity" accountSelectable />
    );
  };
  const renderContent = () => {
    switch (tabName) {
    case HEADER_TABS.Add: {
      return (
        <AddPool
          disabledButton={disabled}
          onNextPress={onNextPress}
        />
      );
    }
    case HEADER_TABS.Remove: {
      return (
        <RemovePool
          disabledButton={disabled}
          onNextPress={onNextPress}
        />
      );
    }
    default: {
      return (
        <WithdrawTradingFees
          disabledButton={disabled}
          onNextPress={onNextPress}
        />
      );
    }}
  };

  const liquidityTitle = React.useMemo(() => {
    return tabName === HEADER_TABS.Add ?
      (pair ? LIQUIDITY_TITLES.ADD_POOL : LIQUIDITY_TITLES.CREATE_POOL)
      : tabName === HEADER_TABS.Remove ? LIQUIDITY_TITLES.REMOVE_POOL : LIQUIDITY_TITLES.WITHDRAW_FEE;
  }, [tabName, pair]);

  // const renderBottomView = useCallback(() => {
  //   if (!showHistories) return null;
  //   return (
  //     <View style={styles.bottomBar}>
  //       <TouchableOpacity
  //         onPress={onHistoriesPress}
  //         style={styles.bottomFloatBtn}
  //       >
  //         <Text style={styles.bottomText}>Order history</Text>
  //         <ArrowRightGreyIcon style={{ marginLeft: 10 }} />
  //       </TouchableOpacity>
  //     </View>
  //   );
  // }, [showHistories]);

  return (
    <>
      {renderHeader()}
      <ScrollView
        style={globalStyled.defaultBorderSection}
        refreshControl={(<RefreshControl refreshing={isLoading} onRefresh={onLoadData} />)}
        showsVerticalScrollIndicator={false}
      >
        <Tabs disable={isLoading || isFiltering} selected={tabName} />
        <View style={{ paddingTop: 50 }}>
          <InputView inputError={inputError} outputError={outputError} />
          <RoundCornerButton
            style={styles.button}
            title={liquidityTitle.title}
            onPress={() => {
              if (typeof onNextPress === 'function') onNextPress(liquidityTitle);
            }}
            disabled={disabled}
          />
          {((liquidityTitle.title === LIQUIDITY_TITLES.CREATE_POOL.title) && !!outputToken) && (
            <Text style={styled.warning}>
              This pool has not been created before
            </Text>
          )}
          {renderContent()}
        </View>
        <View style={{ height: 70 }} />
      </ScrollView>
    </>
  );
});

Liquidity.defaultProps = {
  outputToken: undefined
};

Liquidity.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  isFiltering: PropTypes.bool.isRequired,
  inputError: PropTypes.string.isRequired,
  outputError: PropTypes.string.isRequired,
  tabName: PropTypes.string.isRequired,
  pair: PropTypes.object.isRequired,

  onLoadData: PropTypes.func.isRequired,
  onNextPress: PropTypes.func.isRequired,
  outputToken: PropTypes.object,
};

export default compose(
  withData,
  witEnhance,
  withLayout_2,
)(Liquidity);
