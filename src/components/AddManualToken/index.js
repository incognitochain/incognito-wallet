import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import { Toast } from '@src/components/core';
import { accountSelector } from '@src/redux/selectors';
import { setWallet } from '@src/redux/actions/wallet';
import { getPTokenList } from '@src/redux/actions/token';
import accountService from '@src/services/wallet/accountService';
import {
  detectTokenInNetwork,
  addManuallyToken,
} from '@src/services/api/token';
import LoadingContainer from '@src/components/LoadingContainer';
import { ExHandler, CustomError, ErrorCode } from '@src/services/exception';
import { AddManuallyContext } from '../../screens/AddManually/AddManually.enhance';
import AddManualToken from './AddManualToken';

export class AddManualTokenComponent extends Component {
  static contextType = AddManuallyContext;
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      isSearching: false,
    };

    this.handleSearch = debounce(this.handleSearch.bind(this), 1000);
  }

  detectTokenInNetwork = async (address) => {
    const { type } = this.context;
    const data = await detectTokenInNetwork({ address, network: type });
    if (!data) {
      throw new CustomError(ErrorCode.addBep2Token_not_found);
    }
    this.setState({ data });
    return data;
  };

  handleAdd = async (values) => {
    try {
      if (!values) return;
      const { account, wallet, setWallet, getPTokenList } = this.props;
      let newPToken;
      const { name, symbol, address, decimals } = values;
      const { type } = this.context;
      const data = {
        name,
        symbol,
        contractId: address,
        decimals,
        network: type
      };

      newPToken = await addManuallyToken(data);
      // add this new token to user following list

      await accountService.addFollowingTokens(
        [newPToken.convertToToken()],
        account,
        wallet,
      );
      await getPTokenList();
      // update new wallet to store
      setWallet(wallet);
      Toast.showSuccess('Success! You added a coin.');

      // clear prev data
      this.setState({ data: null });
      return newPToken;
    } catch (e) {
      new ExHandler(e).showErrorToast();
      throw e;
    }
  };

  handleSearch = async (values) => {
    try {
      const { address, symbol } = values;
      // clear previous result
      this.setState({ data: null, isSearching: true });

      // search by address/contractId
      if (address) {
        await this.detectTokenInNetwork(address);
      } else if (symbol) {
        // TODO: search by symbol
      }
    } catch (e) {
      new ExHandler(
        e,
        'Can not search this Bep20 coin, please try again.',
      ).showErrorToast();
    } finally {
      this.setState({ isSearching: false });
    }
  };

  render() {
    const { data, isSearching } = this.state;
    const { wallet, account } = this.props;

    if (!wallet || !account) {
      return <LoadingContainer />;
    }

    return (
      <AddManualToken
        data={data}
        isSearching={isSearching}
        onAdd={this.handleAdd}
        onSearch={this.handleSearch}
      />
    );
  }
}

const mapState = (state) => ({
  account: accountSelector.defaultAccount(state),
  wallet: state.wallet,
});

const mapDispatchToProps = {
  setWallet,
  getPTokenList,
};

AddManualTokenComponent.propTypes = {
  account: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  setWallet: PropTypes.func.isRequired,
  getPTokenList: PropTypes.func.isRequired,
};

export default connect(mapState, mapDispatchToProps)(AddManualTokenComponent);
