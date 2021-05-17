import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { fromPairs } from 'lodash';
import { withNavigation } from 'react-navigation';
import { accountSelector, tokenSelector, selectedPrivacySelector } from '@src/redux/selectors';
import accountService from '@src/services/wallet/accountService';
import tokenService from '@src/services/wallet/tokenService';
import { getPTokenList } from '@src/redux/actions/token';
import { setWallet } from '@src/redux/actions/wallet';
import { pTokens } from '@src/redux/selectors/token';
import PToken from '@src/models/pToken';
import internalTokenModel from '@src/models/token';
import { ExHandler } from '@src/services/exception';
import { View } from 'react-native';
import SearchToken from './SearchToken';
import { Toast, ActivityIndicator, } from '../core';

export class SearchTokenContainer extends PureComponent {
  state = {
    tokens: null,
    internalTokens: [],
    gettingToken: false,
  };

  componentDidMount() {
    // eslint-disable-next-line react/no-did-mount-set-state
    this.setState({ gettingToken: true });
    Promise.all([
      this.getPTokens(),
      this.getInternalTokens()
    ])
      .then(() => this.setState({ gettingToken: false }))
      .catch(() => this.setState({ gettingToken: false }));
  }

  componentDidUpdate(prevProps, prevState) {
    const { pTokens: oldPTokens, followedTokens: oldFollowedTokens } = prevProps;
    const { pTokens, followedTokens } = this.props;
    const { internalTokens: oldInternalTokens } = prevState;
    const { internalTokens } = this.state;

    if (oldPTokens !== pTokens || oldFollowedTokens !== followedTokens || oldInternalTokens !== internalTokens) {
      this.getAvaiableTokens();
    }
  }

  getAvaiableTokens = async () => {
    try {
      const { internalTokens } = this.state;
      const { followedTokens, pTokens, getPrivacyDataByTokenID } = this.props;
      const followedTokenIds: Array = followedTokens.map(t => t?.id) || [];
      const allTokenIds = Object.keys(fromPairs([
        ...internalTokens?.map(t => ([t?.id])) || [],
        ...pTokens?.map(t => ([t?.tokenId])) || []
      ]));

      const tokens = [];

      allTokenIds?.forEach(tokenId => {
        const token = getPrivacyDataByTokenID(tokenId);

        if (token?.name && token?.symbol && token.tokenId) {
          let _token = { ...token };

          if (followedTokenIds.includes(token.tokenId)) {
            _token.isFollowed = true;
          }

          tokens.push(_token);
        }
      });
      
      this.setState({ tokens });

      return tokens || [];
    } catch (e) {
      new ExHandler(e).showErrorToast();
    }
  };

  goBack = () => {
    const { navigation } = this.props;

    navigation?.pop();
  }

  handleAddFollowToken = async (tokenId) => {
    const { pTokens, account, wallet, setWallet } = this.props;
    const { internalTokens } = this.state;
    const foundPToken : PToken = pTokens?.find((pToken: PToken) => pToken.tokenId === tokenId);
    const foundInternalToken = !foundPToken && internalTokens?.find(token => token.id === tokenId);
    
    const token = (foundInternalToken && internalTokenModel.toJson(foundInternalToken)) || foundPToken?.convertToToken();

    if (!token) throw new Error('Can not follow empty coin');

    await accountService.addFollowingTokens([token], account, wallet);

    Toast.showSuccess('Coin added');

    // update new wallet to store
    setWallet(wallet);
  }

  handleRemoveFollowToken = async tokenId => {
    const { account, wallet, setWallet } = this.props;
    const updatedWallet = await accountService.removeFollowingToken(tokenId, account, wallet);

    // update new wallet to store
    setWallet(updatedWallet);

    Toast.showInfo('Coin removed');
  }

  getPTokens = async () => {
    try {
      const { getPTokenList } = this.props;
      await getPTokenList();
    } catch (e) {
      new ExHandler(e).showErrorToast();
    }
  }

  getInternalTokens = async () => {
    try {
      const internalTokens = await tokenService.getPrivacyTokens();
      this.setState({ internalTokens });

      return internalTokens;
    } catch (e) {
      new ExHandler(e).showErrorToast();
    }
  }

  render() {
    const { tokens, gettingToken } = this.state;
    const { account, wallet, followedTokens } = this.props;

    if (!tokens || !account || !wallet || gettingToken) {
      return (
        <View style={{ height: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="small" />
        </View>
      );
    }

    return (
      <SearchToken
        {...this.props}
        tokens={tokens}
        followedTokens={followedTokens}
        handleAddFollowToken={this.handleAddFollowToken}
        handleRemoveFollowToken={this.handleRemoveFollowToken}
        onCancel={this.goBack}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  followedTokens: tokenSelector.followed(state),
  getPrivacyDataByTokenID: selectedPrivacySelector.getPrivacyDataByTokenID(state),
  pTokens: pTokens(state),
  account: accountSelector.defaultAccount(state),
  wallet: state.wallet
});

const mapDispatchToProps = {
  getPTokenList,
  setWallet
};

SearchTokenContainer.defaultProps = {
  pTokens: [],
  followedTokens: []
};

SearchTokenContainer.propTypes = {
  getPTokenList: PropTypes.func.isRequired,
  pTokens: PropTypes.arrayOf(PropTypes.object),
  followedTokens: PropTypes.arrayOf(PropTypes.object),
  account: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  setWallet: PropTypes.func.isRequired,
  getPrivacyDataByTokenID: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withNavigation
)(SearchTokenContainer);
