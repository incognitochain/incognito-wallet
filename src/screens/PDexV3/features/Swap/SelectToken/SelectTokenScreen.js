// import { useFuse } from '@components/Hoc/useFuse';
import withLazy from '@components/LazyHoc/LazyHoc';
import { View } from '@src/components/core';
import { View2 } from '@src/components/core/View';
import Header from '@src/components/Header';
// import { withLayout_2 } from '@src/components/Layout';
import { searchTokenOnSwap } from '@services/api/token';
import LoadingContainer from '@src/components/LoadingContainer';
import { ListAllToken3, TokenTrade1 } from '@src/components/Token';
import PToken from '@src/models/pToken';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { FONT } from '@src/styles';
import { delay } from '@src/utils/delay';
import { debounce, orderBy } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { batch, useDispatch, useSelector } from 'react-redux';
import { compose } from 'recompose';
import { change } from 'redux-form';
// import { selectedPrivacySelector } from '@src/redux/selectors';
import { actionFetchPairs } from '@screens/PDexV3/features/Swap';
import { addPToken, getBalance } from '@src/redux/actions/token';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import { pTokenIdsSelector } from '@src/redux/selectors/token';
import { actionResetData } from '../Swap.actions';
import { formConfigs, RULE_SORT } from '../Swap.constant';
import { filterSwapableToken, getSearchTokenListByField } from '../Swap.selector';
import { styled } from './SelectionToken.styled';

const DEBOUNCE_TIME = 500;

const SelectTokenList = React.memo(() => {
  const dispatch = useDispatch();
  const data = useNavigationParam('data');
  const onPress = useNavigationParam('onPress');
  const { goBack } = useNavigation();
  const { from, tokenId } = data;
  // const getPrivacyDataByTokenID = useSelector(selectedPrivacySelector.getPrivacyDataByTokenID);
  const account = useSelector(defaultAccountSelector);
  const pTokenIdsList = useSelector(pTokenIdsSelector);
  const filterSwapableTokenFn = useSelector(filterSwapableToken);

  if (!from || !tokenId) return null;

  
  const availableTokens = useSelector(getSearchTokenListByField)(from, tokenId);
  const availableTokensSorted = useMemo(() => orderBy(availableTokens, RULE_SORT.key, RULE_SORT.value), []);

  const [isLoading, setLoading] = useState(false);
  const [tokenList, setTokenList] = useState(availableTokensSorted);

  //Use Dic to save pToken List (key: tokenId, value: pToken)
  let pTokenDic;

  const wrapData = useCallback((tokens) => {
    let newTokensList = [];
    pTokenDic = {};
    newTokensList = tokens?.map((token) => {
      const newPToken = new PToken(token, tokens);
      pTokenDic[newPToken.tokenId] = newPToken;
      return newPToken;
    }) || [];
    newTokensList =  newTokensList?.map((token) => {
      return new SelectedPrivacy(
        account,
        {},
        token,
        token.tokenId
      );
    });
    return newTokensList;
  }, []);

  const isExistToken = useCallback((tokenId) => {
    return pTokenIdsList.find(pTokenId => pTokenId === tokenId);
  }, [pTokenIdsList]);

  const debounceSearch = debounce(async (keySearch) => {
    if (!keySearch || keySearch.length < 1) {
      setTokenList(availableTokens);
    } else {
      setLoading(true);
      const data = await searchTokenOnSwap(keySearch);
      const result = wrapData(data);
      if (result && result.length < 1) {
        setTokenList([]);
      } else {
        //filter token with verified = true
        let filterTokenVerifed = result.filter(token => !!token.isVerified);
        
        //filter swappable
        filterTokenVerifed = filterSwapableTokenFn(from, filterTokenVerifed);

        //Sort result final
        setTokenList(orderBy(filterTokenVerifed, RULE_SORT.key, RULE_SORT.value));
      }
      setLoading(false);
    }
    setLoading(false);
  }, DEBOUNCE_TIME);

  const renderItem = useCallback(
    ({ item }) => (
      <TokenTrade1
        item={item}
        onPress={async () => {
          goBack();
          dispatch(actionResetData());
          dispatch(change(formConfigs.formName, formConfigs.feetoken, ''));
          const tokenId = item.tokenId;
          if (!isExistToken(tokenId)) {
            batch(() => {
              dispatch(getBalance(tokenId));
              dispatch(addPToken(pTokenDic[tokenId]));
              dispatch(actionFetchPairs(true));
            });
          }
          await delay(0);
          if (typeof onPress === 'function') {
            onPress(item);
          }
        }}
        tokenId={item?.tokenId}
      />
    ),
    [],
  );

  return (
    <View2 style={styled.container}>
      <Header
        title="Select coins"
        canSearch
        titleStyled={FONT.TEXT.incognitoH4}
        isNormalSearch
        onTextSearchChange={(value) => {
          debounceSearch(value);
        }}
      />
      <View borderTop style={[{ flex: 1 }]}>
        { isLoading ? (
          <LoadingContainer />
        ) : (
          <ListAllToken3
            tokensFactories={tokenList}
            renderItem={renderItem}
          />
        )}
      </View>
    </View2>
  );
});

export default compose(withLazy)(SelectTokenList);
