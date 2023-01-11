import { ButtonTrade } from '@src/components/Button';
import React from 'react';
import PropTypes from 'prop-types';
import { createForm } from '@components/core/reduxForm';
import LoadingTx from '@src/components/LoadingTx';
import { KeyboardAwareScrollView, RefreshControl } from '@src/components/core';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';
import throttle from 'lodash/throttle';
import { styled } from './Swap.styled';
import { formConfigs } from './Swap.constant';
import withSwap from './Swap.enhance';
import { swapInfoSelector } from './Swap.selector';
import SwapInputsGroup from './Swap.inputsGroup';
import GroupSubInfo from './Swap.groupSubInfo';
import EstimateTradeError from './Swap.estimateTradeError';

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

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
  const paddingToBottom = 20;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};

const Swap = (props) => {
  const { initSwapForm, handleConfirm } = props;
  const swapInfo = useDebounceSelector(swapInfoSelector);

  const [page, setPage] = React.useState(0);
  const [isExpandPage, setIsExpandPage] = React.useState(false);

  const setLoadPage = () => {
    if (!isExpandPage) return;
    setPage((page) => page + 4);
  };

  const _debounceLoadPage = throttle(() => {
    setLoadPage();
  }, 2000);

  const setShowHistory = (isShow) => {
    setIsExpandPage(isShow);
    if (!isShow) {
      return setPage(0);
    }
    setPage((page) => page + 5);
  };

  return (
    <>
      <KeyboardAwareScrollView
        style={[styled.scrollview]}
        refreshControl={(
          <RefreshControl
            refreshing={swapInfo?.refreshing}
            onRefresh={initSwapForm}
          />
        )}
        onScroll={({ nativeEvent }) => {
          if (
            isCloseToBottom(nativeEvent) &&
            typeof setLoadPage === 'function'
          ) {
            _debounceLoadPage();
          }
        }}
        scrollEventThrottle={600}
      >
        <Form>
          {() => (
            <>
              <SwapInputsGroup />
              <EstimateTradeError />
              <ButtonTrade
                btnStyle={styled.btnTrade}
                onPress={handleConfirm}
                title={swapInfo?.btnSwapText || ''}
              />
            </>
          )}
        </Form>
        <GroupSubInfo
          page={page}
          isExpandPage={isExpandPage}
          setShowHistory={setShowHistory}
        />
      </KeyboardAwareScrollView>
      {!!swapInfo.swaping && <LoadingTx />}
    </>
  );
};

Swap.propTypes = {
  handleConfirm: PropTypes.func.isRequired,
};

export default withSwap(React.memo(Swap));
