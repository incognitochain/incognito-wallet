import React, { memo } from 'react';
import { ScrollView, Text } from 'react-native';
import PropTypes from 'prop-types';
import { styled as mainStyle } from '@screens/PDexV3/PDexV3.styled';
import { Header, RowSpaceText, SuccessModal } from '@src/components';
import {
  LIQUIDITY_MESSAGES,
  formConfigsContribute,
  SUCCESS_MODAL,
} from '@screens/PDexV3/features/Liquidity/Liquidity.constant';
import {
  createForm,
  RFTradeInputAmount as TradeInputAmount,
  validator,
} from '@components/core/reduxForm';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@screens/PDexV3/features/Liquidity/Liquidity.styled';
import {Field, focus, getFormSyncErrors} from 'redux-form';
import { AddBreakLine, RefreshControl, View } from '@components/core';
import withLiquidity from '@screens/PDexV3/features/Liquidity/Liquidity.enhance';
import {
  contributeSelector,
  liquidityActions,
} from '@screens/PDexV3/features/Liquidity';
import { ButtonTrade } from '@components/Button';
import { NFTTokenModal } from '@screens/PDexV3/features/NFTToken';
import { compose } from 'recompose';
import withTransaction from '@screens/PDexV3/features/Liquidity/Liquidity.enhanceTransaction';
import NetworkFee from '@src/components/NetworkFee';
import {actionToggleModal} from '@components/Modal';
import { withLayout_2 } from '@components/Layout';
import useSendSelf from '@screens/PDexV3/features/Liquidity/Liquidity.useSendSelf';
import NetworkFeeError from '@screens/PDexV3/features/Liquidity/Liquidity.networkFeeError';
import { actionRefillPRVModalVisible } from '@src/screens/RefillPRV/RefillPRV.actions';

const initialFormValues = {
  inputToken: '',
  outputToken: '',
};

const Form = createForm(formConfigsContribute.formName, {
  initialValues: initialFormValues,
  destroyOnUnmount: true,
  enableReinitialize: true,
});

const InputsGroup = React.memo(() => {
  const dispatch = useDispatch();
  const { inputToken, outputToken } = useSelector(
    contributeSelector.mappingDataSelector,
  );
  const onChangeInput = (newText) =>
    dispatch(liquidityActions.actionChangeInputContribute(newText));
  const onChangeOutput = (newText) =>
    dispatch(liquidityActions.actionChangeOutputContribute(newText));
  const onMaxInput = () =>
    dispatch(
      liquidityActions.actionChangeInputContribute(
        inputAmount.maxOriginalAmountText,
      ),
    );
  const onMaxOutput = () =>
    dispatch(
      liquidityActions.actionChangeOutputContribute(
        outputAmount.maxOriginalAmountText,
      ),
    );
  const amountSelector = useSelector(contributeSelector.inputAmountSelector);
  const inputAmount = amountSelector(
    formConfigsContribute.formName,
    formConfigsContribute.inputToken,
  );
  const outputAmount = amountSelector(
    formConfigsContribute.formName,
    formConfigsContribute.outputToken,
  );
  const _validateInput = React.useCallback(() => {
    return inputAmount.error;
  }, [inputAmount.error]);
  const _validateOutput = React.useCallback(() => {
    return outputAmount.error;
  }, [outputAmount.error]);
  return (
    <View style={styled.inputBox}>
      <Field
        component={TradeInputAmount}
        name={formConfigsContribute.inputToken}
        symbol={inputToken && inputToken?.symbol}
        srcIcon={inputToken && inputToken?.iconUrl}
        validate={[_validateInput, ...validator.combinedAmount]}
        hasInfinityIcon
        onChange={onChangeInput}
        editableInput={!inputAmount.loadingBalance}
        loadingBalance={inputAmount.loadingBalance}
        onPressInfinityIcon={onMaxInput}
      />
      <AddBreakLine visibleAdd />
      <Field
        component={TradeInputAmount}
        name={formConfigsContribute.outputToken}
        hasInfinityIcon
        symbol={outputToken && outputToken?.symbol}
        srcIcon={outputToken && outputToken?.iconUrl}
        validate={[_validateOutput, ...validator.combinedAmount]}
        visibleHeader
        onChange={onChangeOutput}
        editableInput={!outputAmount.loadingBalance}
        loadingBalance={outputAmount.loadingBalance}
        onPressInfinityIcon={onMaxOutput}
      />
    </View>
  );
});

export const Extra = React.memo(() => {
  const data = useSelector(contributeSelector.mappingDataSelector);
  const renderHooks = () => {
    if (!data) return;
    return (data?.hookFactories || []).filter(item => !!item).map((item) => (
      <RowSpaceText {...item} key={item?.label} />
    ));
  };
  return <View style={mainStyle.extra}>{renderHooks()}</View>;
});

const ContributeButton = React.memo(({ onSubmit }) => {
  const dispatch = useDispatch();
  const amountSelector = useSelector(contributeSelector.inputAmountSelector);
  const inputAmount = amountSelector(
    formConfigsContribute.formName,
    formConfigsContribute.inputToken,
  );
  const outputAmount = amountSelector(
    formConfigsContribute.formName,
    formConfigsContribute.outputToken,
  );
  const { feeAmount } = useSelector(contributeSelector.feeAmountSelector);
  const poolId = useSelector(contributeSelector.poolIDSelector);
  const { amp } = useSelector(contributeSelector.mappingDataSelector);
  const { nftToken } = useSelector(contributeSelector.nftTokenSelector);
  const { isDisabled, nftTokenAvailable } = useSelector(contributeSelector.disableContribute);
  const formErrors = useSelector((state) =>
    getFormSyncErrors(formConfigsContribute.formName)(state),
  );
  const createContributes = async () => {
    const fields = [
      formConfigsContribute.inputToken,
      formConfigsContribute.outputToken,
    ];
    for (let index = 0; index < fields.length; index++) {
      const field = fields[index];
      if (formErrors[field]) {
        return dispatch(focus(formConfigsContribute.formName, field));
      }
    }
    if (!nftTokenAvailable) {
      return dispatch(
        actionToggleModal({
          visible: true,
          shouldCloseModalWhenTapOverlay: true,
          data: <NFTTokenModal />,
        }),
      );
    }
    if (isDisabled) return;
    const params = {
      fee: feeAmount / 2,
      tokenId1: inputAmount.tokenId,
      tokenId2: outputAmount.tokenId,
      amount1: String(inputAmount.originalInputAmount),
      amount2: String(outputAmount.originalInputAmount),
      poolPairID: poolId,
      amp,
      nftID: nftToken,
    };
    onSubmit(params);
  };

  return (
    <ButtonTrade
      btnStyle={mainStyle.button}
      title={LIQUIDITY_MESSAGES.addLiquidity}
      onPress={createContributes}
    />
  );
});

const Contribute = ({
  onInitContribute,
  onCreateContributes,
  visible,
  onCloseModal,
  setLoading,
  setError,
  error,
}) => {
  const dispatch = useDispatch();
  const isFetching = useSelector(contributeSelector.statusSelector);
  const { feeAmountStr, showFaucet } = useSelector(contributeSelector.feeAmountSelector);
  const { isEnoughNetworkFee } = useSelector(contributeSelector.validateNetworkFeeSelector);
  const {
    isEnoughtPRVNeededAfterBurn,
    isCurrentPRVBalanceExhausted,
  } = useSelector(contributeSelector.validateTotalBurnPRVSelector);
  
  const _error = useSendSelf({ error, setLoading, setError });
  const onSubmit = (params) => {
    // console.log('isEnoughtTotalPRVAfterBurned ', isEnoughtTotalPRVAfterBurned);
    if (!isEnoughtPRVNeededAfterBurn) {
      dispatch(actionRefillPRVModalVisible(true));
      
    } else {
      typeof onCreateContributes === 'function' && onCreateContributes(params);
    }
  };
  const onClose = () => {
    onCloseModal();
    onInitContribute();
  };
  React.useEffect(() => {
    if (typeof onInitContribute === 'function') onInitContribute();
  }, []);
  
  return (
    <>
      <Header style={styled.padding} />
      <View borderTop style={styled.container}>
        <ScrollView
          refreshControl={(
            <RefreshControl
              refreshing={isFetching}
              onRefresh={onInitContribute}
            />
          )}
          showsVerticalScrollIndicator={false}
        >
          <Form>
            {() => (
              <>
                <InputsGroup />
                <View style={styled.padding}>
                  {!!_error && <Text style={styled.warning}>{_error}</Text>}
                  <ContributeButton onSubmit={onSubmit} />
                  {showFaucet && <NetworkFee feeStr={feeAmountStr} />}
                  <Extra />
                  {!isEnoughNetworkFee && <NetworkFeeError />}
                </View>
              </>
            )}
          </Form>
        </ScrollView>
      </View>
      <SuccessModal
        closeSuccessDialog={onClose}
        title={SUCCESS_MODAL.CREATE_POOL.title}
        buttonTitle="OK"
        extraInfo={SUCCESS_MODAL.CREATE_POOL.desc}
        visible={visible}
      />
    </>
  );
};

ContributeButton.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

Contribute.defaultProps = {
  error: '',
};

Contribute.propTypes = {
  onInitContribute: PropTypes.func.isRequired,
  onCreateContributes: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  setError: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  error: PropTypes.string,
};

export default compose(
  withLiquidity,
  withLayout_2,
  withTransaction,
)(memo(Contribute));
