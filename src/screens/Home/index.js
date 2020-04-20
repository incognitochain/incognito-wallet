import React from 'react';
import { ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { TouchableOpacity, View } from '@src/components/core';
import icShield from '@assets/images/icons/ic_shield_btn.png';
import icSend from '@assets/images/icons/ic_send_btn.png';
import icReceive from '@assets/images/icons/ic_receive_btn.png';
import icTrade from '@assets/images/icons/ic_trade.png';
import icInvent from '@assets/images/icons/ic_invent_btn.png';
import icPower from '@assets/images/icons/ic_power.png';
import icBuy from '@assets/images/icons/ic_buy_prv.png';
import icFeedback from '@assets/images/icons/ic_feedback.png';
import icPapp from '@assets/images/icons/ic_papp.png';
import icKyber from '@assets/images/icons/ic_kyber.png';
import IconTextButton from '@screens/Home/IconTextButton';
import ROUTE_NAMES from '@routers/routeNames';
import { BIG_COINS } from '@screens/Dex/constants';
import SettingIcon from '@components/SettingIcon/index';
import { useSelector } from 'react-redux';
import accountSeleclor from '@src/redux/selectors/account';
import dexUtil from '@utils/dex';
import LinkingService from '@src/services/linking';
import { CONSTANT_EVENTS } from '@src/constants';
import LocalDatabase from '@utils/LocalDatabase';
import { withdraw } from '@services/api/withdraw';
import { logEvent } from '@services/firebase';
import icStake from '@assets/images/icons/stake_icon.png';
import AccountSelect from '@screens/Wallet/AccountSelect';
import { COLORS } from '@src/styles';
import Tooltip from '@components/Tooltip';
import styles from './style';

const sendItem = {
  image: icSend,
  title: 'Send',
  desc: 'Anonymously',
  route: ROUTE_NAMES.SendCrypto,
};
const receiveItem = {
  image: icReceive,
  title: 'Receive',
  desc: 'Anonymously',
  route: ROUTE_NAMES.ReceiveCoin,
};
const shieldItem = {
  image: icShield,
  title: 'Shield',
  desc: 'Your crypto',
  route: ROUTE_NAMES.Shield,
};

const pappItem = {
  image: icPapp,
  title: 'Browse',
  desc: 'Search URL',
  route: ROUTE_NAMES.pApps,
};

const powerItem = {
  image: icPower,
  title: 'Buy Node',
  desc: 'Plug & play',
  route: ROUTE_NAMES.Community,
  onPress: () => {
    LinkingService.openUrl(
      'https://node.incognito.org/payment.html?utm_source=app&utm_medium=homepage%20app&utm_campaign=pnode',
    );
  },
};

const pUniswapItem = {
  image: icKyber,
  title: 'pKyber',
  route: ROUTE_NAMES.pUniswap,
  event: CONSTANT_EVENTS.CLICK_HOME_UNISWAP,
};

const pStakeItem = {
  image: icStake,
  title: 'Stake PRV',
  route: ROUTE_NAMES.Stake,
};

const buttons = [
  shieldItem,
  {
    image: icBuy,
    title: 'Buy PRV',
    route: ROUTE_NAMES.Dex,
    params: {
      inputTokenId: BIG_COINS.USDT,
      outputTokenId: BIG_COINS.PRV,
    },
    event: CONSTANT_EVENTS.CLICK_HOME_BUY,
  },

  sendItem,
  receiveItem,
  {
    image: icInvent,
    title: 'Issue a coin',
    route: ROUTE_NAMES.CreateToken,
  },
  {
    image: icTrade,
    title: 'Trade',
    route: ROUTE_NAMES.Dex,
    event: CONSTANT_EVENTS.CLICK_HOME_TRADE,
  },
  powerItem,
  pStakeItem,
  pappItem,
  {
    image: icFeedback,
    title: 'Feedback',
    route: ROUTE_NAMES.Community,
    params: {
      uri: 'https://incognito.org/c/help/45',
    }
  },
  pUniswapItem,
];

const tooltipType = '2';

const Home = ({ navigation }) => {
  const account = useSelector(accountSeleclor.defaultAccount);
  const [viewUniswap, setViewUniswap] = React.useState(undefined);

  const goToScreen = (route, params, event) => {
    navigation.navigate(route, params);

    if (event) {
      logEvent(event);
    }
  };

  const isDisabled = item => {
    if (item === sendItem && dexUtil.isDEXMainAccount(account.name)) {
      return true;
    }

    if (
      (item === receiveItem || item === shieldItem) &&
      dexUtil.isDEXWithdrawAccount(account.name)
    ) {
      return true;
    }

    return false;
  };

  const tryLastWithdrawal = async () => {
    try {
      const txs = await LocalDatabase.getWithdrawalData();

      for (const tx in txs) {
        if (tx) {
          await withdraw(tx);
          await LocalDatabase.removeWithdrawalData(tx.burningTxId);
        }
      }
    } catch (e) {
      //
    }
  };

  const closeTooltip = () => {
    setViewUniswap(tooltipType);
  };

  const getViewUniswap = async () => {
    const viewUniswap = await LocalDatabase.getViewUniswapTooltip(tooltipType);
    setViewUniswap(viewUniswap);

    setTimeout(closeTooltip, 7000);
  };

  React.useEffect(() => {
    tryLastWithdrawal();
    getViewUniswap();

    navigation.addListener('didBlur', closeTooltip);
  }, []);

  return (
    <TouchableOpacity style={{ flex: 1 }} onPress={closeTooltip}>
      <View style={styles.header}>
        <AccountSelect customTitleStyle={styles.accTitle} icoColor={COLORS.black} />
        <SettingIcon />
      </View>
      <ScrollView contentContainerStyle={{justifyContent: 'center'}}>
        <View style={styles.btnContainer}>
          {buttons.map(item => (
            <View style={styles.btn} key={item.title}>
              {item === pStakeItem &&
                viewUniswap !== tooltipType && (
                <Tooltip
                  title="New"
                  desc="Join a PRV staking pool. Get a 57% annual return. Interest paid every second."
                />
              )}
              <IconTextButton
                image={item.image}
                title={item.title}
                disabled={isDisabled(item)}
                onPress={
                  item.onPress || (() => goToScreen(item.route, item.params))
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </TouchableOpacity>
  );
};

Home.propTypes = {
  navigation: PropTypes.object.isRequired,
};

export default React.memo(Home);
