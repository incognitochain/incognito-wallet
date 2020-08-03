import React from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { isIOS } from '@src/utils/platform';
import Header from './Header';
import ChooseAccount from './ChooseAccount';

const styled = StyleSheet.create({
  container: {
    minWidth: 320,
    flex: 1,
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    padding: 20,
    justifyContent: 'center',
  },
});

const AccountModal = (props) => {
  const { onSelectAccount } = props;
  const isPlatformIOS = isIOS();
  const Container = isPlatformIOS ? KeyboardAvoidingView : View;
  const renderContent = () => {
    return <ChooseAccount onSelectAccount={onSelectAccount} />;
  };

  return (
    <Container
      style={styled.container}
      behavior="padding"
      keyboardVerticalOffset={120}
    >
      <Header headerTitle="Choose your wallet" />
      {renderContent()}
    </Container>
  );
};

AccountModal.propTypes = {
  onSelectAccount: PropTypes.func
};

export default AccountModal;
