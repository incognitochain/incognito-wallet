import React, {memo} from 'react';
import { ScrollView, Text } from 'react-native';
import PropTypes from 'prop-types';
import {styled as mainStyle} from '@screens/PDexV3/PDexV3.styled';
import {Header, RowSpaceText, SuccessModal} from '@src/components';
import {
  LIQUIDITY_MESSAGES,
  formConfigsCreatePool,
  SUCCESS_MODAL,
} from '@screens/PDexV3/features/Liquidity/Liquidity.constant';
import {createForm, RFTradeInputAmount as TradeInputAmount, validator} from '@components/core/reduxForm';
import { AddBreakLine, View, RefreshControl } from '@components/core';
import {useDispatch, useSelector} from 'react-redux';
import {change, Field, focus, getFormSyncErrors} from 'redux-form';
import withLiquidity from '@screens/PDexV3/features/Liquidity/Liquidity.enhance';
import {createPoolSelector, liquidityActions} from '@screens/PDexV3/features/Liquidity';
import styled from '@screens/PDexV3/features/Liquidity/Liquidity.styled';
import {ButtonTrade} from '@components/Button';
import {compose} from 'recompose';
import withTransaction from '@screens/PDexV3/features/Liquidity/Liquidity.enhanceTransaction';
import {NFTTokenModal} from '@screens/PDexV3/features/NFTToken';
import {useNavigation} from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import NetworkFee from '@src/components/NetworkFee';
import {actionToggleModal} from '@components/Modal';
import { withLayout_2 } from '@components/Layout';
import useSendSelf from '@screens/PDexV3/features/Liquidity/Liquidity.useSendSelf';
import withLazy from '@components/LazyHoc/LazyHoc';
import NetworkFeeError from '@screens/PDexV3/features/Liquidity/Liquidity.networkFeeError';
import { actionRefillPRVModalVisible } from '@src/screens/RefillPRV/RefillPRV.actions';

const initialFormValues = {
  inputToken: '',
  outputToken: '',
};

const Form = createForm(formConfigsCreatePool.formName, {
  initialValues: initialFormValues,
  destroyOnUnmount: true,
  enableReinitialize: true,
});

const InputsGroup = () => {
  const dispatch = useDispatch();
  const inputAmount = useSelector(createPoolSelector.inputAmountSelector);
  const inputTokens = useSelector(createPoolSelector.inputTokensListSelector);
  const outputTokens = useSelector(createPoolSelector.outputTokensListSelector);
  const focusField = useSelector(createPoolSelector.focusFieldSelector);
  const isTyping = useSelector(createPoolSelector.isTypingSelector);
  const inputToken = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.inputToken);
  const outputToken = inputAmount(formConfigsCreatePool.formName, formConfigsCreatePool.outputToken);
  const navigation = useNavigation();
  const onChangeText = (text) => dispatch(liquidityActions.actionSetCreatePoolText(text));
  const onFocusToken = (e, focusField) =>  dispatch(liquidityActions.actionSetFocusCreatePool({ focusField }));
  const onGetRate = () => {
    if (!inputToken.originalInputAmount || !outputToken.originalInputAmount || !inputToken.tokenId || !outputToken.tokenId) return;
    const params = {
      inputAmount: inputToken.originalInputAmount,
      inputToken: inputToken.tokenId,
      outputAmount: outputToken.originalInputAmount,
      outputToken: outputToken.tokenId,
    };
    dispatch(liquidityActions.actionSetTypingCreatePool({ isTyping: true }));
    liquidityActions.debouncedGetCreatePoolRate.cancel();
    dispatch(liquidityActions.asyncActionDebounced(params, liquidityActions.debouncedGetCreatePoolRate));
  };
  const _validateInput = React.useCallback(() => {
    return inputToken.error;
  }, [inputToken.error]);
  const _validateOutput = React.useCallback(() => {
    return outputToken.error;
  }, [outputToken.error]);

  const loading = React.useMemo(() => ({
    input: inputToken.loadingBalance || (isTyping && focusField === formConfigsCreatePool.inputToken),
    output: outputToken.loadingBalance || (isTyping && focusField === formConfigsCreatePool.outputToken),
  }), [focusField, isTyping, inputToken.loadingBalance, outputToken.loadingBalance]);

  const onSelectSymbol = (callback, tokens) => {
    navigation.navigate(routeNames.SelectTokenModal, {
      data: tokens,
      onPress: callback
    });
  };

  React.useEffect(() => {
    onGetRate();
  }, [
    inputToken.originalInputAmount,
    inputToken.tokenId,
    outputToken.originalInputAmount,
    outputToken.tokenId,
  ]);

  return (
    <View style={styled.inputBox}>
      <Field
        component={TradeInputAmount}
        name={formConfigsCreatePool.inputToken}
        canSelectSymbol
        symbol={inputToken && inputToken?.symbol}
        validate={[
          _validateInput,
          ...validator.combinedAmount,
        ]}
        onFocus={(e) => onFocusToken(e, formConfigsCreatePool.inputToken)}
        onChange={onChangeText}
        editableInput={!inputToken.loadingBalance}
        loadingBalance={loading.input}
        hasInfinityIcon={!!inputToken && !!inputToken?.balanceStr}
        onPressInfinityIcon={() => {
          dispatch(change(formConfigsCreatePool.formName, formConfigsCreatePool.inputToken, inputToken.maxOriginalAmountText));
        }}
        onPressSymbol={() => {
          if (loading.input) return;
          onSelectSymbol(((token) => {
            setTimeout(() =>
              dispatch(liquidityActions.actionUpdateCreatePoolInputToken(token.tokenId)),
            300);
          }), inputTokens);
        }}
      />
      <AddBreakLine />
      <Field
        component={TradeInputAmount}
        name={formConfigsCreatePool.outputToken}
        canSelectSymbol
        visibleHeader
        symbol={outputToken && outputToken?.symbol}
        hasInfinityIcon={!!outputToken && !!outputToken?.balanceStr}
        validate={[
          _validateOutput,
          ...validator.combinedAmount,
        ]}
        onChange={onChangeText}
        editableInput={!outputToken.loadingBalance}
        loadingBalance={loading.output}
        onPressSymbol={() => {
          if (loading.output) return;
          onSelectSymbol(((token) => {
            setTimeout(() =>
              dispatch(liquidityActions.actionUpdateCreatePoolOutputToken(token.tokenId)),
            300);
          }), outputTokens);
        }}
        onFocus={(e) => onFocusToken(e, formConfigsCreatePool.outputToken)}
        onPressInfinityIcon={() => {
          dispatch(change(formConfigsCreatePool.formName, formConfigsCreatePool.outputToken, outputToken.maxOriginalAmountText));
        }}
      />
    </View>
  );
};

export const Extra = React.memo(() => {
  const hooks = useSelector(createPoolSelector.hookFactoriesSelector);
  const renderHooks = () => {
    return hooks.filter(item => !!item).map(item => <RowSpaceText {...item} key={item?.label} />);
  };
  return(
    <View style={{ marginTop: 20 }}>
      {renderHooks()}
    </View>
  );
});

const ButtonCreatePool = React.memo(({ onSubmit }) => {
  const dispatch = useDispatch();
  const { disabled, nftTokenAvailable } = useSelector(createPoolSelector.disableCreatePool);
  const amountSelector = useSelector(createPoolSelector.inputAmountSelector);
  const inputAmount = amountSelector(formConfigsCreatePool.formName, formConfigsCreatePool.inputToken);
  const outputAmount = amountSelector(formConfigsCreatePool.formName, formConfigsCreatePool.outputToken);
  const { feeAmount, feeAmountStr, showFaucet } = useSelector(createPoolSelector.feeAmountSelector);
  const { amp, estOutputStr } = useSelector(createPoolSelector.ampValueSelector);
  const formErrors = useSelector((state) =>
    getFormSyncErrors(formConfigsCreatePool.formName)(state),
  );
  const handleSubmit = () => {
    const fields = [
      formConfigsCreatePool.inputToken,
      formConfigsCreatePool.outputToken,
    ];
    for (let index = 0; index < fields.length; index++) {
      const field = fields[index];
      if (formErrors[field]) {
        return dispatch(focus(formConfigsCreatePool.formName, field));
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
    if (disabled) return;
    const params = {
      fee: feeAmount / 2,
      tokenId1: inputAmount.tokenId,
      tokenId2: outputAmount.tokenId,
      amount1: String(inputAmount.originalInputAmount),
      amount2: String(outputAmount.originalInputAmount),
      amp,
    };
    onSubmit(params);
  };
  const changeEstRate = () =>
    !!estOutputStr && dispatch(change(formConfigsCreatePool.formName, formConfigsCreatePool.outputToken, estOutputStr));
  return (
    <>
      {!!estOutputStr && (
        <View style={mainStyle.extra}>
          {LIQUIDITY_MESSAGES.estRate(changeEstRate)}
        </View>
      )}
      <ButtonTrade
        btnStyle={mainStyle.button}
        title={LIQUIDITY_MESSAGES.createPool}
        onPress={handleSubmit}
      />
      {showFaucet && <NetworkFee feeStr={feeAmountStr} />}
    </>
  );
});

const CreatePool = ({
  onInitCreatePool,
  onFreeCreatePool,
  onCreateNewPool,
  visible,
  onCloseModal,
  setLoading,
  setError,
  error,
}) => {
  const dispatch = useDispatch();
  const isFetching = useSelector(createPoolSelector.isFetchingSelector);
  const { isEnoughNetworkFee } = useSelector(createPoolSelector.validateNetworkFeeSelector);
  const _error = useSendSelf({ error, setLoading, setError });
  const {
    isEnoughtPRVNeededAfterBurn,
    isCurrentPRVBalanceExhausted,
  } =  useSelector(createPoolSelector.validateTotalBurnPRVSelector);
  const onSubmit = (params) => {
    // console.log('isEnoughtTotalPRVAfterBurned ', isEnoughtTotalPRVAfterBurned);
    if (!isEnoughtPRVNeededAfterBurn) {
      dispatch(actionRefillPRVModalVisible(true));
    } else {
      typeof onCreateNewPool === 'function' && onCreateNewPool(params);
    }
  };

  const onClose = () => {
    onCloseModal();
    onInitCreatePool();
  };

  const renderContent = () => (
    <>
      <InputsGroup />
      <View style={styled.padding}>
        {!!_error && <Text style={styled.warning}>{_error}</Text>}
        <ButtonCreatePool onSubmit={onSubmit} />
        <Extra />
        {!isEnoughNetworkFee && <NetworkFeeError />}
      </View>
    </>
  );
  React.useEffect(() => {
    onInitCreatePool();
    return () => onFreeCreatePool();
  }, []);
  return (
    <>
      <Header style={styled.padding} />
      <View borderTop style={styled.container}>
        <ScrollView
          refreshControl={(<RefreshControl refreshing={isFetching} onRefresh={onInitCreatePool} />)}
          showsVerticalScrollIndicator={false}
        >
          <Form>
            {renderContent()}
          </Form>
        </ScrollView>
      </View>
      <SuccessModal
        closeSuccessDialog={onClose}
        title={SUCCESS_MODAL.ADD_POOL.title}
        buttonTitle="OK"
        extraInfo={SUCCESS_MODAL.ADD_POOL.desc}
        visible={visible}
      />
    </>
  );
};

CreatePool.defaultProps = {
  error: ''
};

CreatePool.propTypes = {
  onInitCreatePool: PropTypes.func.isRequired,
  onFreeCreatePool: PropTypes.func.isRequired,
  onCreateNewPool: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  error: PropTypes.string,
};

ButtonCreatePool.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default compose(
  withLazy,
  withLiquidity,
  withLayout_2,
  withTransaction,
)(memo(CreatePool));
