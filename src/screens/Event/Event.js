import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import { View } from '@src/components/core';
import {
  accountSeleclor,
  tokenSeleclor,
  selectedPrivacySeleclor,
} from '@src/redux/selectors';
import { getBalance } from '@src/redux/actions/account';
import { getBalance as getTokenBalance } from '@src/redux/actions/token';
import { CONSTANT_COMMONS } from '@src/constants';
import LoadingContainer from '@src/components/LoadingContainer';
import { ExHandler, CustomError, ErrorCode } from '@src/services/exception';

import { compose } from 'recompose';
import { withLayout_2 } from '@components/Layout';
import Header from '@components/Header';
import { SearchIcon } from '@src/components/Icons';
import sourceSearchIcon from '@assets/images/icons/search_icon.png';
import PappError from '@screens/PappView/PappError';
import PappView from '@screens/PappView/PappView';
import styles, { containerStyle as styled } from '@screens/PappView/style';
import SelectToken from '@components/HeaderRight/SelectToken';

class Event extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      selectedPrivacy: null,
      supportTokenIds: [CONSTANT_COMMONS.PRV_TOKEN_ID],
      url: props.navigation.getParam('data')?.url || '',
      isLoading: true
    };
    this.webViewRef = null;
    this.reloadBalanceTimeout = null;
  }

  onGo = ({ url }) => {
    this.setState({ url });
  };

  componentDidMount() {
    const { supportTokenIds } = this.state;

    this.handleSelectPrivacyToken(CONSTANT_COMMONS.PRV_TOKEN_ID);
    this.setHeaderData({
      onSelectToken: this.handleSelectPrivacyToken,
      supportTokenIds,
      onGo: this.onGo,
    });
  }

  componentWillUnmount() {
    if (this.reloadBalanceTimeout) {
      clearInterval(this.reloadBalanceTimeout);
      this.reloadBalanceTimeout = undefined;
    }
  }

  setHeaderData = (data = {}) => {
    const { navigation } = this.props;
    navigation.setParams(data);
  };

  /**
   * duration in ms
   */
  reloadBalance = (tokenID, duration = 30 * 1000) => {
    // clear prev task
    if (this.reloadBalanceTimeout) {
      clearInterval(this.reloadBalanceTimeout);
    }

    this.reloadBalanceTimeout = setInterval(async () => {
      // account balance (PRV)
      if (tokenID === CONSTANT_COMMONS.PRV_TOKEN_ID) {
        const { getAccountBalanceBound, account } = this.props;
        await getAccountBalanceBound(account);
      } else if (tokenID) {
        const { getTokenBalanceBound, tokens } = this.props;
        const token = tokens?.find(t => t.id === tokenID);

        token && (await getTokenBalanceBound(token));
      }
      this.getPrivacyToken(tokenID);
    }, duration);
  };

  handleSelectPrivacyToken = tokenID => {
    try {
      if (typeof tokenID === 'string') {
        const selectedPrivacy = this.getPrivacyToken(tokenID);
        if (selectedPrivacy) {
          this.reloadBalance(tokenID);
          this.setHeaderData({ selectedPrivacy });
        } else {
          throw new CustomError(ErrorCode.papp_the_token_is_not_supported);
        }
      } else {
        throw new Error('Please use an invalid token ID');
      }
    } catch (e) {
      new ExHandler(e).showErrorToast();
    }
  };

  getPrivacyToken = tokenID => {
    const { selectPrivacyByTokenID } = this.props;
    const selectedPrivacy = selectPrivacyByTokenID(tokenID);

    if (selectedPrivacy) {
      this.setState({ selectedPrivacy });
    }

    return selectedPrivacy;
  };

  handleSetListSupportTokenById = tokenIds => {
    if (tokenIds instanceof Array) {
      const ids = [CONSTANT_COMMONS.PRV_TOKEN_ID, ...tokenIds];
      this.setState({ supportTokenIds: ids }, () => {
        this.setHeaderData({ supportTokenIds: ids });
      });
    } else {
      throw new Error('Please use a valid token id list.');
    }
  };

  render() {
    const { loading, selectedPrivacy, supportTokenIds, url, isLoading } = this.state;
    const { tokens } = this.props;

    let content;
    if (!url) {
      content = <Empty />;
    } else if (!selectedPrivacy) {
      content = <LoadingContainer />;
    } else {
      content = (
        <PappError>
          <PappView
            {...this.props}
            url={url}
            selectedPrivacy={selectedPrivacy}
            supportTokenIds={supportTokenIds}
            onSelectPrivacyToken={this.handleSelectPrivacyToken}
            onSetListSupportTokenById={this.handleSetListSupportTokenById}
            onLoadEnd={() => this.setState({ isLoading: false })}
            onLoadError={() => this.setState({ isLoading: false })}
          />
        </PappError>
      );
    }

    return (
      <View style={styled.container}>
        <Header
          title={url}
          rightHeader={(
            <View style={styles.chooseTokenIcon}>
              <SelectToken
                tokens={tokens}
                onSelect={this.handleSelectPrivacyToken}
                selectedPrivacy={selectedPrivacy}
                supportTokenIds={supportTokenIds}
              />
            </View>
          )}
        />
        {content}
        { isLoading && (
          <View style={styled.wrapperIndicator}>
            <ActivityIndicator size='large' />
          </View>
        )}
        {loading && <ActivityIndicator style={styles.loading} />}
      </View>
    );
  }
}

const Empty = React.memo(() => (
  <View style={styled.emptyContainer}>
    <SearchIcon source={sourceSearchIcon} style={styled.searchIcon} />
    <Text style={styled.desc}>
      {'Enter a URL to start exploring\napps built on Incognito.'}
    </Text>
  </View>
));

const mapState = state => ({
  account: accountSeleclor.defaultAccount(state),
  wallet: state.wallet,
  tokens: tokenSeleclor.followed(state),
  followed: tokenSeleclor.followingTokenSelector,
  selectPrivacyByTokenID: selectedPrivacySeleclor.getPrivacyDataByTokenID(
    state,
  ),
});

const mapDispatch = {
  getAccountBalanceBound: getBalance,
  getTokenBalanceBound: getTokenBalance,
};

Event.defaultProps = {
  tokens: [],
};

Event.propTypes = {
  navigation: PropTypes.object.isRequired,
  getAccountBalanceBound: PropTypes.func.isRequired,
  getTokenBalanceBound: PropTypes.func.isRequired,
  selectPrivacyByTokenID: PropTypes.func.isRequired,
  tokens: PropTypes.array,
  account: PropTypes.object.isRequired,
  onGo: PropTypes.func.isRequired,
};

export default compose(
  connect(
    mapState,
    mapDispatch,
  ),
  withLayout_2,
)(Event);
