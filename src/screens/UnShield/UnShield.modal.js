import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { withLayout_2 } from '@components/Layout';
import Header, { useSearchBox } from '@src/components/Header';
import { useDispatch, useSelector } from 'react-redux';
import { actionToggleModal } from '@src/components/Modal';
import { availableTokensSelector } from '@src/redux/selectors/shared';
import {
  handleFilterTokenByKeySearch,
  TokenBasic as Token,
} from '@src/components/Token';
import PropTypes from 'prop-types';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
});

const ListToken = props => {
  const { data, handleUnShieldToken } = props;
  return (
    <FlatList
      style={styled.flatList}
      data={[...data]}
      renderItem={({ item }) =>
        item?.isWithdrawable ? (
          <Token
            onPress={() => handleUnShieldToken(item)}
            tokenId={item?.tokenId}
            name="displayName"
            symbol="pSymbol"
            showBalance
            showSymbol={false}
          />
        ) : null
      }
      keyExtractor={token => token?.tokenId}
      extraData={[...data]}
    />
  );
};

const Modal = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const tokens = useSelector(availableTokensSelector);
  const [result, keySearch] = useSearchBox({
    data: tokens,
    handleFilter: () => handleFilterTokenByKeySearch({ tokens, keySearch }),
  });
  const handleUnShieldToken = async token => {
    const tokenId = token?.tokenId || null;
    if (!tokenId) return;
    await dispatch(setSelectedPrivacy(tokenId));
    navigation.navigate(routeNames.UnShield);
    await dispatch(
      actionToggleModal({
        visible: false,
      }),
    );
  };
  const handleToggleModal = async () =>
    dispatch(actionToggleModal({ visible: false, data: null }));
  return (
    <View style={styled.container}>
      <Header title="Search coins" canSearch onGoBack={handleToggleModal} />
      <ListToken data={result} handleUnShieldToken={handleUnShieldToken} />
    </View>
  );
};

ListToken.propTypes = {
  data: PropTypes.array.isRequired,
  handleUnShieldToken: PropTypes.func.isRequired,
};

Modal.propTypes = {};

export default withLayout_2(Modal);
