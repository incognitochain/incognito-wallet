import { ButtonTrade } from '@src/components/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { createForm } from '@components/core/reduxForm';
import { useSelector } from 'react-redux';
import LoadingTx from '@src/components/LoadingTx';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { KeyboardAwareScrollView, RefreshControl } from '@src/components/core';
import ToggleArrow from '@src/components/ToggleArrow';
import { COLORS, FONT } from '@src/styles';
import { styled, tabsStyled } from './Swap.styled';
import {
  ROOT_TAB_ID,
  TAB_SIMPLE_ID,
  TAB_PRO_ID,
  formConfigs,
} from './Swap.constant';
import TabSimple from './Swap.simpleTab';
import TabPro from './Swap.proTab';
import withSwap from './Swap.enhance';
import { swapInfoSelector } from './Swap.selector';
import SwapInputsGroup from './Swap.inputsGroup';
import SwapDetails from './Swap.details';

const initialFormValues = {
  selltoken: '',
  buytoken: '',
  slippagetolerance: '',
  feetoken: '',
};

const Form = createForm(formConfigs.formName, {
  initialValues: initialFormValues,
  destroyOnUnmount: true,
  enableReinitialize: true,
});

const Swap = (props) => {
  const { initSwapForm, handleConfirm } = props;
  const navigation = useNavigation();
  const handleNavOrderHistory = () =>
    navigation.navigate(routeNames.TradeOrderHistory);
  const swapInfo = useSelector(swapInfoSelector);
  const tabsFactories = [
    {
      tabID: TAB_SIMPLE_ID,
      label: 'Simple',
      onChangeTab: () => null,
      tabStyled: tabsStyled.tabBtn,
      tabStyledDisabled: tabsStyled.tabBtnDisabled,
      titleStyled: tabsStyled.tabTitleStyled,
      titleDisabledStyled: tabsStyled.tabTitleDisabledStyled,
      tab: <TabSimple handleConfirm={handleConfirm} />,
    },
    {
      tabID: TAB_PRO_ID,
      label: 'Pro',
      onChangeTab: () => null,
      tabStyled: tabsStyled.tabBtn,
      tabStyledDisabled: tabsStyled.tabBtnDisabled,
      titleStyled: tabsStyled.tabTitleStyled,
      titleDisabledStyled: tabsStyled.tabTitleDisabledStyled,
      tab: <TabPro handleConfirm={handleConfirm} />,
    },
  ];
  return (
    <>
      <KeyboardAwareScrollView
        style={styled.scrollview}
        refreshControl={
          <RefreshControl
            refreshing={swapInfo?.refreshing}
            onRefresh={initSwapForm}
          />
        }
      >
        <Form>
          {() => (
            <>
              <SwapInputsGroup />
              <ButtonTrade
                btnStyle={styled.btnTrade}
                onPress={handleConfirm}
                title={swapInfo?.btnSwapText || ''}
                disabled={!!swapInfo?.disabledBtnSwap}
              />
              <SwapDetails />
            </>
          )}
        </Form>
      </KeyboardAwareScrollView>
      {!!swapInfo.swaping && <LoadingTx />}
      <ToggleArrow
        label="Order history"
        useRightArrow
        style={{
          height: 30,
        }}
        labelStyle={{
          fontFamily: FONT.NAME.medium,
          fontSize: FONT.SIZE.small,
          color: COLORS.colorGrey3,
        }}
        handlePressToggle={handleNavOrderHistory}
      />
    </>
  );
};

Swap.propTypes = {
  handleConfirm: PropTypes.func.isRequired,
};

export default withSwap(React.memo(Swap));
