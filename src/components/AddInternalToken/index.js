import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { withNavigation } from 'react-navigation';
import { accountSelector } from '@src/redux/selectors';
import AddInternalToken from './AddInternalToken';

const AddInternalTokenContainer = ({
  wallet,
  defaultAccount,
  ...otherProps
}) => {
  return (
    <AddInternalToken
      wallet={wallet}
      account={defaultAccount}
      {...otherProps}
    />
  );
};

const mapState = state => ({
  defaultAccount: accountSelector.defaultAccount(state),
  wallet: state.wallet
});

AddInternalTokenContainer.defaultProps = {
  isPrivacy: true,
  isCreate: false,
};

AddInternalTokenContainer.propTypes = {
  defaultAccount: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  isPrivacy: PropTypes.bool,
  isCreate: PropTypes.bool,
  navigation: PropTypes.object.isRequired
};

export default compose(
  connect(mapState),
  withNavigation
)(AddInternalTokenContainer);
