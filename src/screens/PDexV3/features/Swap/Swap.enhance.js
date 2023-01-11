import ErrorBoundary from '@src/components/ErrorBoundary';
import withLazy from '@src/components/LazyHoc/LazyHoc';
import { actionToggleModal } from '@src/components/Modal';
import routeNames from '@src/router/routeNames';
import { TradeSuccessModal } from '@src/screens/PDexV3/features/Trade';
import RemoveSuccessDialog from '@src/screens/Setting/features/RemoveStorage/RemoveStorage.Dialog';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';
import React, { useEffect, useState } from 'react';
import { useFocusEffect, useNavigation } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { compose } from 'recompose';
import { focus } from 'redux-form';
import { actionSetDefaultPair } from '@screens/PDexV3/features/Swap';
import { actionRefillPRVModalVisible } from '@src/screens/RefillPRV/RefillPRV.actions';
import { PRV } from '@src/constants/common';

import enhanceUnifiedAlert from './Swap.enhanceUnifiedAlert';
import {
  formConfigs,
  KEYS_PLATFORMS_SUPPORTED,
  NETWORK_NAME_SUPPORTED,
  SWAP_DEFAULT_FAIR,
} from './Swap.constant';

import {
  actionFetchSwap,
  actionInitSwapForm,
  actionNavigateFormMarketTab,
  actionReset,
  actionSetDefaultExchange,
  actionToggleProTab,
} from './Swap.actions';

import {
  feetokenDataSelector,
  getEsimateTradeError,
  getIsNavigateFromMarketTab,
  buyInputTokenSeletor,
  swapFormErrorSelector,
  swapInfoSelector,
  feeErorSelector,
  getIsNavigateToSelectToken,
  validateTotalBurningPRVSelector,
} from './Swap.selector';

const enhance = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const swapInfo = useDebounceSelector(swapInfoSelector);
  const formErrors = useDebounceSelector(swapFormErrorSelector);
  const buyInputToken = useDebounceSelector(buyInputTokenSeletor);
  const feeTokenData = useDebounceSelector(feetokenDataSelector);
  const estimateTradeError = useSelector(getEsimateTradeError);
  const {
    isEnoughtPRVNeededAfterBurn,
    isCurrentPRVBalanceExhausted,
  } = useSelector(validateTotalBurningPRVSelector);

  const prvFeeError = useSelector(feeErorSelector);

  const isNavigateFromMarketTab = useSelector(getIsNavigateFromMarketTab);
  const navigateToSelectToken = useSelector(getIsNavigateToSelectToken);

  const [visibleSignificant, setVisibleSignificant] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const navigation = useNavigation();
  const {
    isPrivacyApp = false,
    exchange = KEYS_PLATFORMS_SUPPORTED.incognito,
    network = NETWORK_NAME_SUPPORTED.INCOGNITO,
  } = props;

  const unmountSwap = () => {
    dispatch(actionReset());
  };

  const initSwapForm = (refresh = false) =>
    dispatch(
      actionInitSwapForm({
        defaultPair: swapInfo?.defaultPair,
        refresh,
        shouldFetchHistory: true,
      }),
    );

  const handleCreateSwapOrder = async () => {
    const tx = await dispatch(actionFetchSwap());

    if (tx) {
      setTimeout(() => {
        dispatch(
          actionToggleModal({
            data: (
              <TradeSuccessModal
                title="Swap initiated!"
                desc={`You placed an order to sell\n${
                  swapInfo?.sellInputAmountStr || ''
                } for ${swapInfo?.buyInputAmountStr || ''}.`}
                handleTradeSucesss={() => initSwapForm()}
                sub="Your balance will update in a couple of minutes after the swap is finalized."
              />
            ),
            visible: true,
          }),
        );
      }, 500);
    }
  };
  const handleConfirm = async () => {
    try {
      if (ordering) {
        return;
      }
      await setOrdering(true);
      const fields = [formConfigs.selltoken, formConfigs.buytoken];
      for (let index = 0; index < fields.length; index++) {
        const field = fields[index];
        if (formErrors[field]) {
          return dispatch(focus(formConfigs.formName, field));
        }
      }
      if (estimateTradeError || prvFeeError || isCurrentPRVBalanceExhausted) {
        return;
      }

      if (!isEnoughtPRVNeededAfterBurn && buyInputToken.tokenId !== PRV.id) {
        dispatch(actionRefillPRVModalVisible(true));
        dispatch(actionReset());
        initSwapForm();
        return;
      }

      if (
        swapInfo?.disabledBtnSwap &&
        !formErrors[formConfigs.selltoken] &&
        !formErrors[formConfigs.buytoken] &&
        (!!formErrors[formConfigs.slippagetolerance] ||
          !!formErrors[formConfigs.feetoken])
      ) {
        dispatch(actionToggleProTab(true));
        return;
      }
      // if (!sellInputToken.isMainCrypto) {
      //   const needFaucet = await dispatch(
      //     actionCheckNeedFaucetPRV(
      //       <FaucetPRVModal />,
      //       swapInfo?.accountBalance,
      //     ),
      //   );
      //   if (needFaucet) {
      //     return;
      //   }
      // }
      const { isSignificant } = feeTokenData;
      if (isSignificant) {
        return setVisibleSignificant(true);
      }
      await handleCreateSwapOrder();
    } catch {
      //
    } finally {
      setOrdering(false);
    }
  };
  const handleInitSwapForm = async () => {
    if (isPrivacyApp) {
      await dispatch(
        actionSetDefaultExchange({
          isPrivacyApp,
          exchange,
          network,
        }),
      );
    } else {
      if (!isNavigateFromMarketTab) {
        await dispatch(
          actionInitSwapForm({
            defaultPair: SWAP_DEFAULT_FAIR,
            refresh: true,
            shouldFetchHistory: true,
          }),
        );
      }
    }
  };

  useEffect(() => {
    handleInitSwapForm().then();
    if (navigation?.state?.routeName !== routeNames.Trade) {
      return () => {
        unmountSwap();
      };
    }
    dispatch(actionNavigateFormMarketTab(false));
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const setDefaultPair = async () => {
        dispatch(actionSetDefaultPair(SWAP_DEFAULT_FAIR));
      };

      if (isNavigateFromMarketTab || navigateToSelectToken) {
        return;
      }

      setDefaultPair();
    }, [isNavigateFromMarketTab, navigateToSelectToken]),
  );

  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, handleConfirm, initSwapForm }} />
      <RemoveSuccessDialog
        visible={visibleSignificant}
        onPressCancel={() => setVisibleSignificant(false)}
        onPressAccept={() => {
          setVisibleSignificant(false);
          handleCreateSwapOrder().then();
        }}
        title="Warning"
        subTitle="Do note that due to trade size, the price of this trade varies significantly from market price."
        acceptStr="Accept"
      />
    </ErrorBoundary>
  );
};

export default compose(withLazy, enhance, enhanceUnifiedAlert);
