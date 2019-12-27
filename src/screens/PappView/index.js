import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { View } from '@src/components/core';
import { accountSeleclor, tokenSeleclor, selectedPrivacySeleclor } from '@src/redux/selectors';
import { getBalance } from '@src/redux/actions/account';
import { getBalance as getTokenBalance } from '@src/redux/actions/token';
import LoadingTx from '@src/components/LoadingTx';
import SimpleInfo from '@src/components/SimpleInfo';
import SelectToken from '@src/components/HeaderRight/SelectToken';
import { CONSTANT_COMMONS } from '@src/constants';
import { getUserProfile } from '@src/services/api/user';
import LoadingContainer from '@src/components/LoadingContainer';
import { COLORS } from '@src/styles';
import { ExHandler, CustomError, ErrorCode } from '@src/services/exception';
import styles from './style';
import PappError from './PappError';
import PappView from './PappView';


class PappViewContainer extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      selectedPrivacy: null,
      supportTokenIds: [CONSTANT_COMMONS.PRV_TOKEN_ID],
      url: props.navigation.getParam('url'),
      userProfile: null
    };

    this.reloadBalanceTimeout = null;
  }

  static navigationOptions = ({ navigation }) => {
    const { title, onSelectToken, selectedPrivacy, supportTokenIds } = navigation.state.params || {};

    return {
      title: title ?? 'Get crypto rich',
      theme: {
        textColor: COLORS.white,
        backgroundColor: COLORS.black
      },
      headerRight: (
        <View style={styles.headerRight}>
          <View style={styles.chooseTokenIcon}>
            <SelectToken onSelect={onSelectToken} selectedPrivacy={selectedPrivacy} supportTokenIds={supportTokenIds} />
          </View>
        </View>
        
      )
    };
  }

  componentDidMount() {
    const { supportTokenIds } = this.state;
    this.getUserProfile();
    this.handleSelectPrivacyToken(CONSTANT_COMMONS.PRV_TOKEN_ID);
    this.setHeaderTitle();
    this.setHeaderData({ onSelectToken: this.handleSelectPrivacyToken, supportTokenIds });
  }

  componentWillUnmount() {
    if (this.reloadBalanceTimeout) {
      clearInterval(this.reloadBalanceTimeout);
      this.reloadBalanceTimeout = undefined;
    }
  }

  setHeaderTitle = () => {
    const { navigation } = this.props;
    let title = navigation.getParam('appName');

    this.setHeaderData({ title });
  }

  setHeaderData = (data = {}) => {
    const { navigation } = this.props;
    navigation.setParams(data);
  }

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
        
        token && await getTokenBalanceBound(token);
      }
      this.getPrivacyToken(tokenID);
    }, duration);
  }

  handleSelectPrivacyToken = tokenID => {
    try {
      if (typeof tokenID === 'string') {
        const { supportTokenIds } = this.state;

        if (!supportTokenIds.includes(tokenID)) {
          throw new CustomError(ErrorCode.papp_the_token_is_not_supported);
        }
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
  }

  getUserProfile = async () => {
    try {
      const userProfile = await getUserProfile();
      this.setState({ userProfile });
      return userProfile;
    } catch (e) {
      new ExHandler(e);
    }
  }

  getPrivacyToken = tokenID => {
    const { selectPrivacyByTokenID } = this.props;
    const selectedPrivacy = selectPrivacyByTokenID(tokenID);
    
    if (selectedPrivacy) {
      this.setState({ selectedPrivacy });
    }

    return selectedPrivacy;
  }

  handleSetListSupportTokenById = tokenIds => {
    if (tokenIds instanceof Array) {
      const ids = [CONSTANT_COMMONS.PRV_TOKEN_ID, ...tokenIds];
      this.setState({ supportTokenIds: ids }, () => {
        this.setHeaderData({ supportTokenIds: ids });
      });
    } else {
      throw new Error('Please use a valid token id list.');
    }
  }

  render() {
    const { isSending, selectedPrivacy, supportTokenIds, url, userProfile } = this.state;
    if (!url) {
      return (
        <SimpleInfo
          text='Can not open pApp without a URL'
          type='warning'
        />
      );
    }

    if (!selectedPrivacy) {
      return <LoadingContainer />;
    }

    return (
      <PappError>
        <PappView
          {...this.props}
          url={url}
          selectedPrivacy={selectedPrivacy}
          supportTokenIds={supportTokenIds}
          userProfile={userProfile}
          onSelectPrivacyToken={this.handleSelectPrivacyToken}
          onSetListSupportTokenById={this.handleSetListSupportTokenById}
        />
        { isSending && <LoadingTx /> }
      </PappError>
    );
  }
}

const mapState = state => ({
  account: accountSeleclor.defaultAccount(state),
  wallet: state.wallet,
  tokens: tokenSeleclor.followed(state),
  selectPrivacyByTokenID: selectedPrivacySeleclor.getPrivacyDataByTokenID(state),
});

const mapDispatch = {
  getAccountBalanceBound: getBalance,
  getTokenBalanceBound: getTokenBalance
};

PappViewContainer.defaultProps = {
  tokens: []
};

PappViewContainer.propTypes = {
  navigation: PropTypes.object.isRequired,
  getAccountBalanceBound: PropTypes.func.isRequired,
  getTokenBalanceBound: PropTypes.func.isRequired,
  selectPrivacyByTokenID: PropTypes.func.isRequired,
  tokens: PropTypes.array,
  account: PropTypes.object.isRequired,
};

export default connect(mapState, mapDispatch)(PappViewContainer);