import React, {memo} from 'react';
import {RefreshControl, ScrollView, Text, View} from 'react-native';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { tokenSelector } from '@src/redux/selectors';
import { useNavigation } from 'react-navigation-hooks';
import { WalletContext } from '@screens/Wallet/features/Home/Wallet.enhance';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import routeNames from '@routers/routeNames';
import { actionRemoveFollowToken } from '@src/redux/actions/token';
import { Toast } from '@components/core';
import Token from '@screens/Wallet/features/Home/Wallet.token';
import {CONSTANT_COMMONS} from '@src/constants';
import {styledFollow, styledToken} from '@screens/Wallet/features/Home/_Wallet.styled';
import {Row} from '@src/components';
import {tokenStyled} from '@screens/Wallet/features/Home/Wallet.styled';

const Followed = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const followed = useSelector(tokenSelector.tokensFollowedSelector);
  const { walletProps } = React.useContext(WalletContext);
  const { isReloading, onRefresh } = walletProps;
  const handleSelectToken = async (tokenId) => {
    if (!tokenId) return;
    await dispatch(setSelectedPrivacy(tokenId));
    navigation.navigate(routeNames.WalletDetail);
  };
  const handleRemoveToken = async (tokenId) => {
    await dispatch(actionRemoveFollowToken(tokenId));
    Toast.showSuccess('Add coin again to restore balance.', {
      duration: 500,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Row style={tokenStyled.wrapHeader} centerVertical>
        <Text style={[tokenStyled.headerLabel, tokenStyled.wrapFirst]}>Assets</Text>
        <Text style={[tokenStyled.headerLabel, tokenStyled.wrapSecond]}>Balance</Text>
        <Text style={[tokenStyled.headerLabel, tokenStyled.wrapThird]}>Price</Text>
        <View style={[tokenStyled.btnTrade, { backgroundColor: 'transparent' }]} />
      </Row>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={isReloading}
            onRefresh={() => onRefresh(true)}
          />
        )}
        nestedScrollEnabled
      >
        <Token
          tokenId={CONSTANT_COMMONS.PRV_TOKEN_ID}
          style={[
            styledFollow.token,
            followed.length === 0 && styledToken.lastChild,
          ]}
          onPress={() => handleSelectToken(CONSTANT_COMMONS.PRV_TOKEN_ID)}
        />
        {followed.map((token, index) => (
          <Token
            key={token?.id}
            tokenId={token?.id}
            style={[
              styledFollow.token,
              followed.length - 1 === index && styledToken.lastChild,
            ]}
            onPress={() => handleSelectToken(token?.id)}
            handleRemoveToken={() => handleRemoveToken(token?.id)}
            swipable
            removable
            showGettingBalance={token?.loading}
          />
        ))}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

Followed.propTypes = {};

export default memo(Followed);
