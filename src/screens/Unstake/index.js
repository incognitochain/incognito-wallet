import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {ActivityIndicator} from '@components/core/index';
import UnstakeVNode from './UnstakeVNode';
import UnstakePNode from './UnstakePNode';

class UnstakeContainer extends PureComponent {
  constructor(props) {
    super(props);
    const { navigation }= props;
    const { params } = navigation.state;
    const { device } = params;
    
    this.state = {
      device
    }; 
  }

  handleCompleteUnstake = async () => {
    const { navigation } = this.props;
    navigation.goBack();
  };

  render() {
    const { wallet } = this.props;
    const { device } = this.state;

    if (!device) {
      return <ActivityIndicator size="small" />;
    }

    if (device.IsPNode && !device.Unstaked) {
      return (
        <UnstakePNode
          device={device}
          wallet={wallet}
          onFinish={this.handleCompleteUnstake}
        />
      );
    }

    return (
      <UnstakeVNode
        device={device}
        wallet={wallet}
        onFinish={this.handleCompleteUnstake}
      />
    );
  }
}

UnstakeContainer.propTypes = {
  wallet: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
};

UnstakeContainer.defaultProps = {};

const mapStateToProps = (state) => ({
  wallet: state?.wallet,
});

export default connect(mapStateToProps)(UnstakeContainer);
