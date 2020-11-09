import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator } from '@components/core/index';
import routeNames from '@routers/routeNames';
import UnstakeVNode from './UnstakeVNode';
import UnstakePNode from './UnstakePNode';

class UnstakeContainer extends PureComponent {
  constructor(props) {
    super(props);
    const { navigation } = props;
    const { params } = navigation.state;
    const { device } = params;

    this.state = {
      device,
    };
  }

  handleCompleteUnstake = async () => {
    const { navigation } = this.props;
    navigation.navigate(routeNames.Node, {
      refresh: new Date().getTime()
    });
  };

  render() {
    const { device } = this.state;

    if (!device) {
      return <ActivityIndicator size="small" />;
    }

    if (device.IsPNode && !device.IsFundedUnstaked) {
      return (
        <>
          <UnstakePNode
            device={device}
            onFinish={this.handleCompleteUnstake}
          />
        </>
      );
    }

    return (
      <>
        <UnstakeVNode
          device={device}
          onFinish={this.handleCompleteUnstake}
        />
      </>
    );
  }
}

UnstakeContainer.propTypes = {
  navigation: PropTypes.object.isRequired,
};


export default UnstakeContainer;
