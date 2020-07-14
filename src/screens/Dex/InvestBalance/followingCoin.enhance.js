import React from 'react';
import _ from 'lodash';
import accountService from '@services/wallet/accountService';
import { COINS } from '@src/constants';
import { useSelector } from 'react-redux';
import { tokenSeleclor } from '@src/redux/selectors';

const withFollowingCoins = WrappedComp => (props) => {
  const [followingCoins, setFollowingCoins] = React.useState([]);
  const coins = useSelector(tokenSeleclor.pTokensSelector);

  const {
    account,
    wallet,
  } = props;

  React.useEffect(() => {
    if (account) {
      let followingCoins = [
        COINS.PRV,
      ];

      const newCoins = accountService.getFollowingTokens(account, wallet)
        .map(coin => {
          let coinInfo;
          if (coin.id === COINS.PRV_ID) {
            coinInfo = COINS.PRV;
          } else {
            coinInfo = coins.find(item => item.tokenId === coin.id);
          }

          return ({
            ...coin,
            symbol: coin.symbol && coin.symbol[0] === 'p' ? coin.symbol.substring(1) : coin.symbol,
            pDecimals: coinInfo?.pDecimals || 0
          });
        });

      followingCoins = followingCoins.concat(newCoins);
      followingCoins = _.uniqBy(followingCoins, coin => coin.id);
      setFollowingCoins(followingCoins);
    }
  }, [account]);


  return (
    <WrappedComp
      {...{
        ...props,
        followingCoins,
      }}
    />
  );
};

export default withFollowingCoins;
