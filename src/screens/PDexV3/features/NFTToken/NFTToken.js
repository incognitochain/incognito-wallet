import { Header } from '@src/components';
import { useDispatch, useSelector } from 'react-redux';
import { ScrollView, Text } from '@src/components/core';
import { withLayout_2 } from '@src/components/Layout';
import React from 'react';
import { View } from 'react-native';
import CopiableText from '@src/components/CopiableText';
import { useFocusEffect, useNavigation } from 'react-navigation-hooks';
import { nftTokenDataSelector } from '@src/redux/selectors/account';
import { actionSetNFTTokenData } from '@src/redux/actions/account';
import NFTTokenHook from './NFTToken.hook';
import { styled } from './NFTToken.styled';
import { FormMint } from './NFTToken.mint';

const NFTTokenItem = React.memo((props) => {
  const { nftToken = '', amount = '0' } = props;
  if (!nftToken) {
    return null;
  }
  return (
    <CopiableText
      text={JSON.stringify({ nftToken, amount })}
      copiedMessage="Copied"
      style={styled.nftTokenItemContainer}
    >
      <Text ellipsizeMode="middle" numberOfLines={1} style={styled.nftToken}>
        {nftToken}
      </Text>
    </CopiableText>
  );
});

const ListNFTToken = React.memo(() => {
  const { list } = useSelector(nftTokenDataSelector);
  if (list.length === 0) {
    return null;
  }
  return (
    <View style={styled.list}>
      <Text style={styled.listTitle}>Your tickets</Text>
      {list.map((nft) => (
        <NFTTokenItem {...nft} key={nft?.nftToken} />
      ))}
    </View>
  );
});

const NFTToken = (props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  useFocusEffect(
    React.useCallback(() => {
      dispatch(actionSetNFTTokenData());
    }, []),
  );
  const hookFactories = React.useMemo(
    () => [
      {
        value:
          'Tickets play a special role on pDEX. They allow you to perform actions like placing limit orders and investing in pools. They also act as receipts for those actions. With these tickets, you are able to withdraw the liquidity you provided, or cancel your limit order before it fills.',
      },
      {
        value:
          'A ticket is freed up once an action is complete. If you wish to make multiple transactions at the same time, you will be prompted to mint more tickets. You don\'t have to keep track of them, and you can mint as many as you like.',
      },
    ],
    [],
  );
  return (
    <View style={styled.container}>
      <Header title="Tickets" />
      <ScrollView style={styled.scrollview}>
        {hookFactories.map((hook) => (
          <NFTTokenHook {...hook} key={hook.label} />
        ))}
        <ListNFTToken />
        <FormMint />
      </ScrollView>
    </View>
  );
};

NFTToken.propTypes = {};

export default withLayout_2(React.memo(NFTToken));
