import React from 'react';
import { View, StyleSheet } from 'react-native';
import { withLayout_2 } from '@components/Layout';
import Header, { useSearchBox } from '@src/components/Header';
import { useDispatch } from 'react-redux';
import {
  handleFilterTokenByKeySearch,
  TokenBasic as Token,
} from '@src/components/Token';
import PropTypes from 'prop-types';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { compose } from 'recompose';
import withTokenSelect from '@src/components/TokenSelect/TokenSelect.enhance';
import { FlatList } from '@src/components/core/FlatList';
import { BtnQuestionDefault } from '@src/components/Button';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatList: {
    flex: 1,
  },
});

const ListToken = (props) => {
  const { data, handleUnShieldToken } = props;
  if (data.length === 0) {
    return null;
  }
  return (
    <FlatList
      showsVerticalScrollIndicator={false}
      style={styled.flatList}
      data={[...data]}
      renderItem={({ item }) => (
        <Token
          onPress={() => handleUnShieldToken(item)}
          tokenId={item?.tokenId}
          name="displayName"
          symbol="pSymbol"
          showBalance
          showSymbol={false}
        />
      )}
      keyExtractor={(token) => token?.tokenId}
      extraData={[...data]}
    />
  );
};

const Modal = (props) => {
  const { isTokenSelectable } = props;
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const tokens = props?.allTokens || [];
  const [result, keySearch] = useSearchBox({
    data: tokens,
    handleFilter: () => handleFilterTokenByKeySearch({ tokens, keySearch }),
  });
  const handleUnShieldToken = async (token) => {
    const tokenId = token?.tokenId || null;
    if (!tokenId || !isTokenSelectable(tokenId)) return;
    await dispatch(setSelectedPrivacy(tokenId));
    navigation.navigate(routeNames.UnShield);
  };
  const handleWhyUnShield = () => navigation.navigate(routeNames.WhyUnshield);
  return (
    <View style={styled.container}>
      <Header
        title="Search coins"
        canSearch
        rightHeader={<BtnQuestionDefault onPress={handleWhyUnShield} />}
      />
      <ListToken data={result} handleUnShieldToken={handleUnShieldToken} />
    </View>
  );
};

ListToken.propTypes = {
  data: PropTypes.array.isRequired,
  handleUnShieldToken: PropTypes.func.isRequired,
};

Modal.propTypes = {
  isTokenSelectable: PropTypes.func.isRequired,
};

export default compose(
  withLayout_2,
  (Comp) => (props) => <Comp {...{ ...props, onlyPToken: true }} />,
  withTokenSelect,
)(Modal);
