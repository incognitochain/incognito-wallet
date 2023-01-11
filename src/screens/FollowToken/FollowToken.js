import { useFuse } from '@components/Hoc/useFuse';
import AddSolidIcon from '@components/Icons/icon.addSolid';
import withLazy from '@components/LazyHoc/LazyHoc';
import { Text, Text3, TouchableOpacity, View } from '@src/components/core';
import { View2 } from '@src/components/core/View';
import Header from '@src/components/Header';
import {
  ListAllToken2,
  TokenBasic as Token,
  TokenFollow,
} from '@src/components/Token';
import {
  actionAddFollowToken,
  actionRemoveFollowToken,
  getPTokenListNoCache,
} from '@src/redux/actions/token';
import { availableTokensSelector } from '@src/redux/selectors/shared';
import routeNames from '@src/router/routeNames';
import { FONT } from '@src/styles';
import globalStyled from '@src/theme/theme.styled';
import React, { useState, useMemo } from 'react';
import { useNavigation } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { withLayout_2 } from '@src/components/Layout';
import { compose } from 'recompose';
import { debounce, orderBy } from 'lodash';
import { RULE_SORT } from '@screens/PDexV3/features/Swap/Swap.constant';
import { searchToken } from '@services/api/token';
import LoadingContainer from '@src/components/LoadingContainer';
import { styled } from './FollowToken.styled';

const AddManually = () => {
  const title = 'Don\'t see your coin?';
  const navigation = useNavigation();
  const handleAddTokenManually = () =>
    navigation?.navigate(routeNames.AddManually, { type: 'ERC20' });
  return (
    <View spaceBetween style={styled.addManually}>
      <Text3 style={styled.text}>{title}</Text3>
      <TouchableOpacity
        style={{ flexDirection: 'row' }}
        onPress={handleAddTokenManually}
      >
        <Text style={styled.text}>Add manually</Text>
        <View style={{ marginLeft: 8 }}>
          <AddSolidIcon />
        </View>
      </TouchableOpacity>
    </View>
  );
};

export const Item = ({ item, handleToggleFollowToken }) =>
  React.useMemo(() => {
    return (
      <Token
        onPress={() => handleToggleFollowToken(item)}
        tokenId={item?.tokenId}
        name="displayName"
        symbol="pSymbol"
        shouldShowFollowed
      />
    );
  }, [item?.isFollowed]);

const FollowTokenList = React.memo((props) => {
  const dispatch = useDispatch();
  const availableTokensOriginal = useSelector(availableTokensSelector);

  const [isLoading, setLoading] = useState(false);
  const [availableTokens, setAvailableTokens] = useState(
    availableTokensOriginal,
  );
  const [showUnVerifiedTokens, setShowUnVerifiedTokens] = useState(false);
  let tokensFollowedDic = useMemo(() => {
    let dicHash = {};
    availableTokensOriginal
      .filter((token) => token.isFollowed)
      .map((token) => {
        dicHash[token.tokenId] = token;
      });
    return dicHash;
  }, []);

  const debounceSearch = debounce(async (nextValue) => {
    setShowUnVerifiedTokens(false);
    if (!nextValue || nextValue.length < 1) {
      setAvailableTokens(availableTokensOriginal);
    } else {
      setLoading(true);
      let result = (await searchToken(nextValue)) || [];
      setLoading(false);
      if (result && result.length < 1) {
        setAvailableTokens([]);
      } else {
        result = result.map((token) => {
          token.isFollowed = !!tokensFollowedDic[token.tokenId];
          return token;
        });
      }
      setAvailableTokens(orderBy(result, RULE_SORT.key, RULE_SORT.value));
    }
    setLoading(false);
  }, 500);

  const [verifiedTokens, unVerifiedTokens] = useMemo(() => {
    const resultFiltered = availableTokens.reduce(
      (result, token) => {
        token?.isVerified
          ? result.verifiedTokens.push(token)
          : result.unVerifiedTokens.push(token);
        return result;
      },
      {
        verifiedTokens: [],
        unVerifiedTokens: [],
      },
    );
    return [resultFiltered.verifiedTokens, resultFiltered.unVerifiedTokens];
  }, availableTokens);

  console.log('');

  const onSetShowUnVerifiedTokens = () => {
    setShowUnVerifiedTokens(!showUnVerifiedTokens);
  };
  let tokens = [];
  if (availableTokens && availableTokens.length < 1) {
    tokens = [];
  } else if (!verifiedTokens && !unVerifiedTokens) {
    tokens = [];
  } else if (verifiedTokens && verifiedTokens.length < 1) {
    tokens = [unVerifiedTokens];
  } else if (unVerifiedTokens && unVerifiedTokens.length < 1) {
    tokens = [verifiedTokens];
  } else if (!showUnVerifiedTokens) {
    tokens = [verifiedTokens];
  } else if (showUnVerifiedTokens) {
    tokens = [verifiedTokens, unVerifiedTokens];
  }

  const handleToggleFollowToken = async (token) => {
    const tokenIndex = availableTokens.findIndex(
      (t) => t?.tokenId === token?.tokenId,
    );
    let tokens = [...availableTokens];
    try {
      if (!token?.isFollowed) {
        tokens[tokenIndex].isFollowed = true;
        setAvailableTokens(tokens);
        await dispatch(actionAddFollowToken(token?.tokenId));
        setTimeout(() => {
          dispatch(getPTokenListNoCache());
        }, 300);
        tokensFollowedDic[token.tokenId] = token;
      } else {
        tokens[tokenIndex].isFollowed = false;
        setAvailableTokens(tokens);
        dispatch(actionRemoveFollowToken(token?.tokenId));
        delete tokensFollowedDic[token.tokenId];
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View2 style={styled.container}>
      <Header
        title="Add a coin"
        canSearch
        titleStyled={FONT.TEXT.incognitoH4}
        isNormalSearch
        onTextSearchChange={(value) => {
          debounceSearch(value);
        }}
      />
      <View borderTop style={[{ flex: 1 }]}>
        {isLoading ? (
          <LoadingContainer />
        ) : (
          <ListAllToken2
            tokensFactories={tokens}
            styledCheckBox={globalStyled.defaultPaddingHorizontal}
            isShowUnVerifiedTokens={showUnVerifiedTokens}
            setShowUnVerifiedTokens={onSetShowUnVerifiedTokens}
            renderItem={({ item }) => (
              <TokenFollow
                item={item}
                handleToggleFollowToken={handleToggleFollowToken}
                onPress={() => handleToggleFollowToken(item)}
              />
            )}
          />
        )}
      </View>
      <AddManually />
    </View2>
  );
});

export default compose(withLazy, withLayout_2)(FollowTokenList);
