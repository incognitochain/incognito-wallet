import { View } from '@components/core';
import withLazy from '@components/LazyHoc/LazyHoc';
import { searchToken } from '@services/api/token';
import { BtnQuestionDefault } from '@src/components/Button';
import Header from '@src/components/Header';
import { ListAllToken2, TokenFollow } from '@src/components/Token';
import { FONT } from '@src/styles';
import globalStyled from '@src/theme/theme.styled';
import { debounce, orderBy } from 'lodash';
import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { compose } from 'recompose';
import { RULE_SORT } from '@screens/PDexV3/features/Swap/Swap.constant';
import LoadingContainer from '@src/components/LoadingContainer';
import withShield from './Shield.enhance';
import { styled } from './Shield.styled';

const Shield = (props) => {
  const { handleShield, handleWhyShield, hideBackButton, availableTokens } =
    props;

  const [tokenList, setTokenList] = useState(availableTokens);
  const [showUnVerifiedTokens, setShowUnVerifiedTokens] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const [verifiedTokens, unVerifiedTokens] = useMemo(() => {
    const resultFiltered = tokenList.reduce(
      (result, token) => {
        if (token?.isVerified && !token?.movedUnifiedToken) {
          result.verifiedTokens.push(token);
        } else if (!token?.isVerified && !token?.movedUnifiedToken) {
          result.unVerifiedTokens.push(token);
        } else {
          // console.log('TOKEN MOVED UNIFIED => ', token.tokenId);
        }
        return result;
      },
      {
        verifiedTokens: [],
        unVerifiedTokens: [],
      },
    );
    return [resultFiltered.verifiedTokens, resultFiltered.unVerifiedTokens];
  }, tokenList);

  const onSetShowUnVerifiedTokens = () => {
    setShowUnVerifiedTokens(!showUnVerifiedTokens);
  };

  let tokens = [];
  if (tokenList && tokenList.length < 1) {
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

  const debounceSearch = debounce(async (nextValue) => {
    setShowUnVerifiedTokens(false);
    if (!nextValue || nextValue.length < 1) {
      setTokenList(availableTokens);
    } else {
      setLoading(true);
      const result = (await searchToken(nextValue)) || [];
      setLoading(false);
      if (result && result.length < 1) {
        setTokenList([]);
      } else {
        setTokenList(orderBy(result, RULE_SORT.key, RULE_SORT.value));
      }
    }
    setLoading(false);
  }, 500);
  return (
    <>
      <Header
        title="Search coins"
        canSearch
        isNormalSearch
        onTextSearchChange={(value) => {
          debounceSearch(value);
        }}
        titleStyled={FONT.TEXT.incognitoH4}
        hideBackButton={hideBackButton}
        rightHeader={(
          <BtnQuestionDefault
            style={{ marginLeft: 8 }}
            onPress={handleWhyShield}
            customStyle={styled.rightItem}
          />
        )}
      />
      <View borderTop style={styled.container}>
        {isLoading ? (
          <LoadingContainer />
        ) : (
          <ListAllToken2
            tokensFactories={tokens}
            styledCheckBox={globalStyled.defaultPaddingHorizontal}
            setShowUnVerifiedTokens={onSetShowUnVerifiedTokens}
            isShowUnVerifiedTokens={showUnVerifiedTokens}
            renderItem={({ item }) => (
              <TokenFollow
                item={item}
                key={item.tokenId}
                hideStar
                externalSymbol
                onPress={() => handleShield(item)}
              />
            )}
          />
        )}
      </View>
    </>
  );
};

Shield.defaultProps = {
  hideBackButton: false,
};

Shield.propTypes = {
  handleWhyShield: PropTypes.func.isRequired,
  handleShield: PropTypes.func.isRequired,
  tokensFactories: PropTypes.array.isRequired,
  hideBackButton: PropTypes.bool,
};

export default compose(withLazy, withShield)(Shield);
