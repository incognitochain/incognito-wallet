import { Toast, View } from '@components/core';
import routeNames from '@routers/routeNames';
import withRetry from '@screens/MainTabBar/features/Assets/Assets.withRetry';
import withFollowList from '@screens/Wallet/features/FollowList/FollowList.enhance';
import { followTokensWalletSelector, isFetchingSelector } from '@screens/Wallet/features/FollowList/FollowList.selector';
import Extra from '@screens/Wallet/features/Home/Wallet.extra';
import Token from '@screens/Wallet/features/Home/Wallet.token';
import { actionFreeHistory } from '@src/redux/actions/history';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import { actionRemoveFollowToken, setToken } from '@src/redux/actions/token';
import { selectedPrivacyTokenID } from '@src/redux/selectors/selectedPrivacy';
import useDebounceSelector from '@src/shared/hooks/debounceSelector';
import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { RefreshControl } from 'react-native';
import BigList from 'react-native-big-list';
import { useNavigation } from 'react-navigation-hooks';
import { batch, useDispatch } from 'react-redux';
import { compose } from 'recompose';

const FollowList = ({ loadBalance, onRetrySubmitWithdraw }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const data = useDebounceSelector(followTokensWalletSelector);
  const isRefreshing = useDebounceSelector(isFetchingSelector);
  const selectPrivacyTokenID = useDebounceSelector(selectedPrivacyTokenID);

  const handleSelectToken = async (tokenId, balance) => {
    if (!tokenId) return;
    if (selectPrivacyTokenID && selectPrivacyTokenID.toLowerCase() !== tokenId.toLowerCase()) {
      dispatch(actionFreeHistory());
    }
    await dispatch(setSelectedPrivacy(tokenId));
    navigation.navigate(routeNames.WalletDetail, { tokenId });
    setTimeout(async() => {
      await dispatch(setToken({
        id: tokenId,
        amount: balance,
        loading: false,
      }),
      );
    }, 1500);
  };
  const handleRemoveToken = async (tokenId) => {
    dispatch(actionRemoveFollowToken(tokenId));
    Toast.showSuccess('Add coin again to restore balance.', {
      duration: 500,
    });
  };

  const renderItem = React.useCallback(({ item }) => {
    const { id, amount, swipable } = item;
    return (
      <Token
        tokenId={id}
        amount={amount}
        swipable={swipable}
        onPress={() => handleSelectToken(id, amount)}
        handleRemoveToken={() => handleRemoveToken(id)}
      />
    );
  }, [selectPrivacyTokenID]);

  const onRefresh = () => {
    batch(() => {
      onRetrySubmitWithdraw();
      loadBalance();
    });
  };

  return (
    <View fullFlex borderTop>
      <Extra />
      <BigList
        data={data}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            tintColor="white"
            refreshing={isRefreshing}
            onRefresh={onRefresh}
          />
        }
        itemHeight={75}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

FollowList.propTypes = {
  loadBalance: PropTypes.func.isRequired,
  onRetrySubmitWithdraw: PropTypes.func.isRequired
};

export default compose(
  withRetry,
  withFollowList,
)(memo(FollowList));
