import { ScrollView } from '@src/components/core';
import DialogLoader from '@src/components/DialogLoader';
import { onClickView } from '@src/utils/ViewUtil';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import RNRestart from 'react-native-restart';
import { View } from 'react-native';
import { withLayout_2 } from '@src/components/Layout';
import Header from '@src/components/Header';
import NetworkItem, { networkItemShape } from './NetworkItem';
import { styled } from './NetworkSetting.styled';

class NetworkSetting extends Component {
  constructor() {
    super();
    this.state = {
      activeNetworkId: null,
      loading: false,
    };
  }

  componentDidMount() {
    const { networks } = this.props;
    this.findDefaultNetwork(networks);
  }

  findDefaultNetwork = (networks) => {
    const found = networks?.find((_) => _.default);
    this.setState({ activeNetworkId: found?.id });
  };

  handleActive = async (network) => {
    const { setDefaultNetwork } = this.props;
    this.setState({ loading: true });
    await setDefaultNetwork(network);
    this.setState({ loading: false }, () => {
      RNRestart.Restart();
    });
  };

  render() {
    const { activeNetworkId, loading } = this.state;
    const { networks, reloadNetworks } = this.props;

    return (
      <View style={styled.container}>
        <Header title="Network" />
        <View style={styled.wrapper}>
          <ScrollView>
            {networks &&
              networks.map(
                (network) =>
                  network && (
                    <NetworkItem
                      key={network?.id}
                      network={network}
                      active={network?.id === activeNetworkId}
                      onActive={onClickView(() => this.handleActive(network))}
                      reloadNetworks={reloadNetworks}
                    />
                  ),
              )}
            <DialogLoader loading={loading} />
          </ScrollView>
        </View>
      </View>
    );
  }
}

NetworkSetting.defaultProps = {
  networks: [],
};
NetworkSetting.defaultProps = {
  setDefaultNetwork: undefined,
  networks: undefined,
};
NetworkSetting.propTypes = {
  setDefaultNetwork: PropTypes.func,
  reloadNetworks: PropTypes.func.isRequired,
  networks: PropTypes.arrayOf(networkItemShape),
};

export default withLayout_2(NetworkSetting);
