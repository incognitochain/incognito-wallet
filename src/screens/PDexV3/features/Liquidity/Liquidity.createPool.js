import React, {memo} from 'react';
import {RefreshControl, ScrollView, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import {styled as mainStyle} from '@screens/PDexV3/PDexV3.styled';
import {Header, Row, RowSpaceText, SuccessModal} from '@src/components';
import {
  LIQUIDITY_MESSAGES,
  formConfigsCreatePool,
  SUCCESS_MODAL
} from '@screens/PDexV3/features/Liquidity/Liquidity.constant';
import {createForm, RFTradeInputAmount as TradeInputAmount, validator} from '@components/core/reduxForm';
import {AddBreakLine} from '@components/core';
import {batch, useDispatch, useSelector} from 'react-redux';
import {change, Field} from 'redux-form';
import withLiquidity from '@screens/PDexV3/features/Liquidity/Liquidity.enhance';
import {createPoolSelector, liquidityActions} from '@screens/PDexV3/features/Liquidity';
import styled from '@screens/PDexV3/features/Liquidity/Liquidity.styled';
import {ButtonTrade} from '@components/Button';
import {compose} from 'recompose';
import withTransaction from '@screens/PDexV3/features/Liquidity/Liquidity.enhanceTransaction';
import {NFTTokenBottomBar} from '@screens/PDexV3/features/NFTToken';
import LPHistoryIcon from '@screens/PDexV3/features/Liquidity/Liquidity.iconHistory';
import {actionToggleModal} from '@components/Modal';
import ModalBottomSheet from '@components/Modal/features/ModalBottomSheet';
import {SelectTokenModal} from '@screens/PDexV3/features/SelectToken';
import {MaxIcon} from '@components/Icons';

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

  const onSelectSymbol = (callback, tokens) =>
    dispatch(
      actionToggleModal({
        visible: true,
        shouldCloseModalWhenTapOverlay: true,
        data: (
          <ModalBottomSheet
            style={{ height: '80%' }}
            customContent={(
              <SelectTokenModal
                data={tokens}
                onPress={(token) => callback(token.tokenId)}
              />
            )}
          />
        ),
      }),
    );

  React.useEffect(() => {
    onGetRate();
  }, [
    inputToken.originalInputAmount,
    inputToken.tokenId,
    outputToken.originalInputAmount,
    outputToken.tokenId,
  ]);

  return (
    <>
      <Row centerVertical spaceBetween style={[styled.padding, styled.headerBox]}>
        {
          (!!inputToken.symbol && !!outputToken.symbol)
          && (<Text style={styled.mediumText}>{`${inputToken.symbol} / ${outputToken.symbol}`}</Text>)
        }
        <LPHistoryIcon />
      </Row>
      <View style={styled.inputBox}>
        <Field
          component={TradeInputAmount}
          name={formConfigsCreatePool.inputToken}
          canSelectSymbol
          visibleHeader
          label="Amount"
          symbol={inputToken && inputToken?.symbol}
          validate={[
            _validateInput,
            ...validator.combinedAmount,
          ]}
          srcIcon={inputToken && inputToken?.iconUrl}
          onFocus={(e) => onFocusToken(e, formConfigsCreatePool.inputToken)}
          onChange={onChangeText}
          editableInput={!inputToken.loadingBalance}
          loadingBalance={loading.input}
          onPressSymbol={() => {
            if (loading.input) return;
            onSelectSymbol(((tokenId) => {
              batch(() => {
                dispatch(liquidityActions.actionUpdateCreatePoolInputToken(tokenId));
                dispatch(actionToggleModal());
              });
            }), inputTokens);
          }}
          rightHeader={(!!outputToken && !!outputToken?.balanceStr) && (
            <Row centerVertical>
              <Text style={styled.balanceStr}>{`Balance: ${inputToken?.balanceStr}`}</Text>
              <MaxIcon onPress={() => {
                dispatch(change(formConfigsCreatePool.formName, formConfigsCreatePool.inputToken, inputToken.maxOriginalAmountText));
              }}
              />
            </Row>
          )}
        />
        <AddBreakLine />
        <Field
          component={TradeInputAmount}
          name={formConfigsCreatePool.outputToken}
          canSelectSymbol
          visibleHeader
          label="Amount"
          symbol={outputToken && outputToken?.symbol}
          validate={[
            _validateOutput,
            ...validator.combinedAmount,
          ]}
          srcIcon={outputToken && outputToken?.iconUrl}
          onChange={onChangeText}
          editableInput={!outputToken.loadingBalance}
          loadingBalance={loading.output}
          onPressSymbol={() => {
            if (loading.output) return;
            onSelectSymbol(((tokenId) => {
              batch(() => {
                dispatch(liquidityActions.actionUpdateCreatePoolOutputToken(tokenId));
                dispatch(actionToggleModal());
              });
            }), outputTokens);
          }}
          onFocus={(e) => onFocusToken(e, formConfigsCreatePool.outputToken)}
          rightHeader={(!!outputToken && !!outputToken?.balanceStr) && (
            <Row centerVertical>
              <Text style={styled.balanceStr}>{`Balance: ${outputToken?.balanceStr}`}</Text>
              <MaxIcon onPress={() => (
                dispatch(change(formConfigsCreatePool.formName, formConfigsCreatePool.outputToken, outputToken.maxOriginalAmountText))
              )}
              />
            </Row>
          )}
        />
      </View>
    </>
  );
};

export const Extra = React.memo(() => {
  const hooks = useSelector(createPoolSelector.hookFactoriesSelector);
  const renderHooks = () => {
    return hooks.map(item => <RowSpaceText {...item} key={item?.label} />);
  };
  return(
    <>
      {renderHooks()}
    </>
  );
});

const ButtonCreatePool = React.memo(({ onSubmit }) => {
  const { disabled } = useSelector(createPoolSelector.disableCreatePool);
  const amountSelector = useSelector(createPoolSelector.inputAmountSelector);
  const inputAmount = amountSelector(formConfigsCreatePool.formName, formConfigsCreatePool.inputToken);
  const outputAmount = amountSelector(formConfigsCreatePool.formName, formConfigsCreatePool.outputToken);
  const { feeAmount } = useSelector(createPoolSelector.feeAmountSelector);
  const { amp } = useSelector(createPoolSelector.ampValueSelector);
  const handleSubmit = () => {
    if (disabled) return;
    const params = {
      fee: feeAmount / 2,
      tokenId1: inputAmount.tokenId,
      tokenId2: outputAmount.tokenId,
      amount1: inputAmount.originalInputAmount,
      amount2: outputAmount.originalInputAmount,
      amp,
    };
    onSubmit(params);
  };
  return (
    <ButtonTrade
      btnStyle={mainStyle.button}
      title={LIQUIDITY_MESSAGES.createPool}
      disabled={disabled}
      onPress={handleSubmit}
    />
  );
});

const CreatePool = ({
  onInitCreatePool,
  onFreeCreatePool,
  onCreateNewPool,
  visible,
  onCloseModal
}) => {
  const isFetching = useSelector(createPoolSelector.isFetchingSelector);
  const onSubmit = (params) => {
    typeof onCreateNewPool === 'function' && onCreateNewPool(params);
  };

  const onClose = () => {
    onCloseModal();
    onInitCreatePool();
  };

  const renderContent = () => (
    <>
      <InputsGroup />
      <View style={styled.padding}>
        <ButtonCreatePool onSubmit={onSubmit} />
        <Extra />
      </View>
    </>
  );
  React.useEffect(() => {
    onInitCreatePool();
    return () => onFreeCreatePool();
  }, []);
  return (
    <>
      <View style={styled.container}>
        <Header style={styled.padding} title={LIQUIDITY_MESSAGES.createPool} />
        <ScrollView
          refreshControl={(<RefreshControl refreshing={isFetching} onRefresh={onInitCreatePool} />)}
          showsVerticalScrollIndicator={false}
        >
          <Form>
            {renderContent()}
          </Form>
        </ScrollView>
      </View>
      <NFTTokenBottomBar />
      <SuccessModal
        closeSuccessDialog={onClose}
        title={SUCCESS_MODAL.ADD_POOL.title}
        buttonTitle="Ok"
        description={SUCCESS_MODAL.ADD_POOL.desc}
        visible={visible}
      />
    </>
  );
};

CreatePool.propTypes = {
  onInitCreatePool: PropTypes.func.isRequired,
  onFreeCreatePool: PropTypes.func.isRequired,
  onCreateNewPool: PropTypes.func.isRequired,
  onCloseModal: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};

ButtonCreatePool.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

export default compose(
  withLiquidity,
  withTransaction,
)(memo(CreatePool));
