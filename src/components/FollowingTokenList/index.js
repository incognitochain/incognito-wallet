import React, { Component } from 'react';
import { connect } from 'react-redux';
import { accountSelector, tokenSelector } from '@src/redux/selectors';
import FollowingTokenList from './FollowingTokenList';


class FollowingTokenListContainer extends Component {
  constructor() {
    super();
  }

  render() {
    return (
      <FollowingTokenList {...this.props} />
    );
  }
}

FollowingTokenListContainer.defaultProps = {
};

FollowingTokenListContainer.propTypes = {
};

const mapState = (state, props) => ({
  tokens: props?.tokens || tokenSelector.followed(state),
  account: props?.account ||  accountSelector.defaultAccount(state),
  wallet: state.wallet,
  getAccountByName: accountSelector.getAccountByName(state)
});

export default connect(
  mapState,
)(FollowingTokenListContainer);
