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
} from '@src/redux/actions/token';
import { availableTokensSelector } from '@src/redux/selectors/shared';
import routeNames from '@src/router/routeNames';
import { FONT } from '@src/styles';
import globalStyled from '@src/theme/theme.styled';
import React, { useState, useEffect } from 'react';
import { useNavigation } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import { withLayout_2 } from '@src/components/Layout';
import { compose } from 'recompose';
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

  const _availableTokens = useSelector(availableTokensSelector);

  const [availableTokens, setAvailableTokens] = useState(_availableTokens);

  // Get list verifiedToken list unVerifiedTokens from list all token
  const _verifiedTokens = availableTokens?.filter((token) => token?.isVerified);
  const _unVerifiedTokens = availableTokens?.filter(
    (token) => !token.isVerified,
  );

  const [showUnVerifiedTokens, setShowUnVerifiedTokens] = useState(false);

  const onSetShowUnVerifiedTokens = () => {
    setShowUnVerifiedTokens(!showUnVerifiedTokens);
  };
  
  const [verifiedTokens, onSearchVerifiedTokens] = useFuse(_verifiedTokens, {
    keys: ['displayName', 'name', 'symbol', 'pSymbol'],
    matchAllOnEmptyQuery: true,
    isCaseSensitive: false,
    findAllMatches: true,
    includeMatches: false,
    includeScore: true,
    useExtendedSearch: false,
    threshold: 0,
    location: 0,
    distance: 2,
    maxPatternLength: 32,
  });

  const [unVerifiedTokens, onSearchUnVerifiedTokens] = useFuse(
    _unVerifiedTokens,
    {
      keys: ['displayName', 'name', 'symbol', 'pSymbol'],
      matchAllOnEmptyQuery: true,
      isCaseSensitive: false,
      findAllMatches: true,
      includeMatches: false,
      includeScore: true,
      useExtendedSearch: false,
      threshold: 0,
      location: 0,
      distance: 2,
      maxPatternLength: 32,
    },
  );

  let tokens = [verifiedTokens];
  if (showUnVerifiedTokens) {
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
        dispatch(actionAddFollowToken(token?.tokenId));
      } else {
        tokens[tokenIndex].isFollowed = false;
        setAvailableTokens(tokens);
        dispatch(actionRemoveFollowToken(token?.tokenId));
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
          onSearchVerifiedTokens(value);
          onSearchUnVerifiedTokens(value);
        }}
      />
      <View borderTop style={[{ flex: 1 }]}>
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
      </View>
      <AddManually />
    </View2>
  );
});

export default compose(withLazy, withLayout_2)(FollowTokenList);
