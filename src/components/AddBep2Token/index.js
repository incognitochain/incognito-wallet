import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { debounce } from 'lodash';
import { Toast } from '@src/components/core';
import { accountSelector } from '@src/redux/selectors';
import { setWallet } from '@src/redux/actions/wallet';
import { getPTokenList } from '@src/redux/actions/token';
import accountService from '@src/services/wallet/accountService';
import { detectBEP2Token, addBEP2Token } from '@src/services/api/token';
import LoadingContainer from '@src/components/LoadingContainer';
import { ExHandler, CustomError, ErrorCode } from '@src/services/exception';
import AddBep2Token from './AddBep2Token';

export class AddBep2TokenContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: null,
      isSearching: false,
    };

    this.handleSearch = debounce(this.handleSearch.bind(this), 1000);
  }

  detectBEP2Token = async symbol => {
    const data = await detectBEP2Token(symbol);
    if (!data) {
      throw new CustomError(ErrorCode.addBep2Token_not_found);
    }
    this.setState({ data });
    return data;
  };

  handleAdd = async values => {
    try {
      if (!values) return;
      const { account, wallet, setWallet, getPTokenList } = this.props;
      let newPToken;
      const {name, symbol, originalSymbol} = values;
      const data = {
        name,
        symbol,
        originalSymbol,
      };
      newPToken = await addBEP2Token(data);

      await accountService.addFollowingTokens([newPToken.convertToToken()], account, wallet);
      await getPTokenList();
      // update new wallet to store
      setWallet(wallet);
      Toast.showSuccess('Success! You added a coin.');
      
      // clear prev data
      this.setState({ data: null });
      return newPToken;
    } catch(e) {
      new ExHandler(e).showErrorToast();
      throw e;
    }
  };

  handleSearch = async (values) => {
    try {
      const { originalSymbol } = values;
      this.setState({data: null, isSearching: true});
      // symbol
      if (originalSymbol) {
        await this.detectBEP2Token(originalSymbol);
      }
    } catch (e) {
      new ExHandler(e, 'Can not search this BEP2 coin, please try again.').showErrorToast();
    } finally {
      this.setState({ isSearching: false });
    }
  };

  render() {
    const { data, isSearching} = this.state;
    const { wallet, account } = this.props;

    if (!wallet || !account) {
      return <LoadingContainer />;
    }

    return (
      <AddBep2Token
        data={data}
        isSearching={isSearching}
        onAdd={this.handleAdd}
        onSearch={this.handleSearch}
      />
    );
  }
}

const mapState = state => ({
  account: accountSelector.defaultAccount(state),
  wallet: state.wallet,
});

const mapDispatchToProps = {
  setWallet,
  getPTokenList
};

AddBep2TokenContainer.propTypes = {
  account: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  setWallet: PropTypes.func.isRequired,
  getPTokenList: PropTypes.func.isRequired,
};

export default connect(mapState, mapDispatchToProps)(AddBep2TokenContainer);
