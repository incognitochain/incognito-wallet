import React from 'react';
import PropTypes from 'prop-types';
import { Container, ScrollView, Text } from '@components/core/index';
import QrCodeAddress from '@components/QrCodeAddress/index';
import { homeStyle } from './style';

class ReceiveCrypto extends React.Component {
  render() {
    const { selectedPrivacy } = this.props;

    return (
      <ScrollView style={homeStyle.container}>
        <Container style={homeStyle.mainContainer}>
          <Text style={[homeStyle.desc, { marginBottom: 5, marginTop: 10 }]}>
            This is your Incognito multi-currency wallet address.
            Use it to receive privacy coins from another Incognito wallet.
          </Text>
          <QrCodeAddress
            data={selectedPrivacy.paymentAddress}
            iconStyle={{ marginLeft: 5 }}
          />
        </Container>
      </ScrollView>
    );
  }
}

ReceiveCrypto.propTypes = {
  selectedPrivacy: PropTypes.object.isRequired
};

export default ReceiveCrypto;
