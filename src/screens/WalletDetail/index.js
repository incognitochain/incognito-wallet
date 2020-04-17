import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { Toast, Image, View } from '@src/components/core';
import {
  getBalance, getBalance as getAccountBalance,
  actionSwitchAccount,
  actionReloadFollowingToken,
} from '@src/redux/actions/account';
import LoadingContainer from '@src/components/LoadingContainer';
import accountService from '@src/services/wallet/accountService';
import { setWallet } from '@src/redux/actions/wallet';
import { accountSeleclor, selectedPrivacySeleclor, tokenSeleclor, sharedSeleclor } from '@src/redux/selectors';
import WalletDetailOptionMenu from '@src/components/HeaderRight/WalletDetailOptionMenu';
import TokenInfo from '@src/components/HeaderRight/TokenInfo';
import { getBalance as getTokenBalance } from '@src/redux/actions/token';
import unfollowTokenIcon from '@src/assets/images/icons/unfollowToken.png';
import { ExHandler } from '@src/services/exception';
import { setSelectedPrivacy } from '@src/redux/actions/selectedPrivacy';
import { actionAddFollowToken } from '@src/redux/actions';
import { COLORS } from '@src/styles';
import { CONSTANT_COMMONS } from '@src/constants';
import VerifiedText from '@src/components/VerifiedText';
import LogManager from '@src/services/LogManager';
import WalletDetail from './WalletDetail';
import styles from './style';

const THEMES = {
  light: {
    textColor: COLORS.dark4,
    backgroundColor: COLORS.white
  },
  dark: {
    textColor: COLORS.white,
    backgroundColor: COLORS.dark4
  }
};
class WalletDetailContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      theme: THEMES.dark
    };

  }

  static navigationOptions = ({ navigation }) => {
    const { title, subTitle, selectedPrivacy, optionMenu, theme } = navigation.state.params || {};
    const infoIconColor = COLORS.white;
    return {
      title: <VerifiedText text={title} style={styles.headerTitleText} isVerified={selectedPrivacy?.isVerified} /> ?? '---',
      subTitle: (title || subTitle) ? subTitle : 'Loading information...',
      theme,
      headerRight: (
        <View style={styles.headerRight}>
          <TokenInfo selectedPrivacy={selectedPrivacy} iconColor={infoIconColor} />
          <WalletDetailOptionMenu menu={optionMenu} iconColor={infoIconColor} />
        </View>
      )
    };
  };

  componentDidMount() {
    this.setHeaderData();

    this.followTokenIfNeeded();
  }

  followTokenIfNeeded =  () => async (dispatch) => {
    const { navigation } = this.props;
    let token = navigation.state.params;
    if (token?.isToken || token?.id !== CONSTANT_COMMONS.PRV_TOKEN_ID) {
      await dispatch(actionAddFollowToken(token.id));
    }
    await dispatch(actionReloadFollowingToken());
  }

  componentDidUpdate(prevProps) {
    const { selectedPrivacy: oldSelectedPrivacy } = prevProps;
    const { selectedPrivacy } = this.props;
    if (oldSelectedPrivacy?.tokenId !== selectedPrivacy?.tokenId) {
      this.setHeaderData();
    }
  }

  setHeaderData = () => {
    this.setTitle();
    this.setOptionMenu();
    this.setTokenInfo();
  };

  setTokenInfo = () => {
    const { navigation, selectedPrivacy } = this.props;
    navigation.setParams({
      selectedPrivacy
    });
  };

  setTitle = () => {
    const { navigation, selectedPrivacy } = this.props;
    let title;
    if (selectedPrivacy?.tokenId === CONSTANT_COMMONS.PRV_TOKEN_ID) {
      title = 'Privacy';
    } else {
      title = selectedPrivacy?.externalSymbol ? `Privacy ${selectedPrivacy?.externalSymbol}` : selectedPrivacy?.name;
    }
    navigation.setParams({
      title,
      subTitle: selectedPrivacy?.networkName
    });
  };

  setOptionMenu = () => {
    const { navigation, selectedPrivacy } = this.props;
    const options = [];

    if (selectedPrivacy?.isToken) {
      options.push({
        id: 'unfollow',
        icon: <Image source={unfollowTokenIcon} style={{ width: 25, height: 25, resizeMode: 'contain' }} />,
        label: 'Remove coin',
        desc: 'Any existing balance will reappear when the coin is added back',
        handlePress: () => this.handleUnfollowTokenBtn(selectedPrivacy?.tokenId)
      });
    }

    navigation.setParams({
      optionMenu: options
    });
  };

  handleUnfollowTokenBtn = async tokenId => {
    try {
      const { account, wallet, setWallet, navigation } = this.props;
      const updatedWallet = await accountService.removeFollowingToken(tokenId, account, wallet);

      // update new wallet to store
      setWallet(updatedWallet);

      Toast.showInfo('Coin removed');
      navigation.goBack();
    } catch (e) {
      new ExHandler(e).showErrorToast();
    }
  };

  onLoadBalance = () => {
    try {
      const { selectedPrivacy, getTokenBalance, getAccountBalance, tokens, account } = this.props;

      if (selectedPrivacy?.isToken) {
        const token = tokens?.find(t => t.id === selectedPrivacy?.tokenId);
        return token && getTokenBalance(token);
      }
      if (selectedPrivacy?.isMainCrypto) {
        return getAccountBalance(account);
      }
    } catch (e) {
      throw e;
    }
  };

  render() {
    const { theme } = this.state;
    const { wallet, account, selectedPrivacy, navigation, isGettingBalanceList, ...otherProps } = this.props;
    if (!selectedPrivacy || !theme) {
      return <LoadingContainer />;
    }

    return (
      <WalletDetail
        wallet={wallet}
        account={account}
        selectedPrivacy={selectedPrivacy}
        isGettingBalanceList={isGettingBalanceList}
        navigation={navigation}
        hanldeLoadBalance={this.onLoadBalance}
        theme={theme}
        {...otherProps}
      />
    );
  }
}

const mapState = state => ({
  account: accountSeleclor.defaultAccount(state),
  wallet: state.wallet,
  tokens: tokenSeleclor.followed(state),
  selectedPrivacy: selectedPrivacySeleclor.selectedPrivacy(state),
  isGettingBalanceList: sharedSeleclor.isGettingBalance(state)
});

const mapDispatch = { getBalance, setWallet, getAccountBalance, getTokenBalance };

WalletDetailContainer.defaultProps = {
  selectedPrivacy: null,
  tokens: []
};

WalletDetailContainer.propTypes = {
  selectedPrivacy: PropTypes.object,
  account: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  setWallet: PropTypes.func.isRequired,
  getTokenBalance: PropTypes.func.isRequired,
  getAccountBalance: PropTypes.func.isRequired,
  tokens: PropTypes.array,
  isGettingBalanceList: PropTypes.array.isRequired
};

export default connect(mapState, mapDispatch)(WalletDetailContainer);
