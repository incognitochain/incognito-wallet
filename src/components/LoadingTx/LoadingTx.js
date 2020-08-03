import { ActivityIndicator, Text, View } from '@src/components/core';
import accountService from '@src/services/wallet/accountService';
import { COLORS } from '@src/styles';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import KeepAwake from 'react-native-keep-awake';
import PureModal from '@components/Modal/features/PureModal';
import styleSheet from './style';

class LoadingTx extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      percent: 0,
    };

    this.timer = null;
  }

  componentDidMount() {
    this.handleToggle(true);
    this.timer = setInterval(() => {
      this.progress();
    }, 1000);
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  clearTimer = () => this.timer && clearInterval(this.timer);

  progress = () => {
    const percent = accountService.getProgressTx();
    percent &&
      this.setState({ percent }, () => {
        if (percent === 100) {
          this.clearTimer();
          setTimeout(() => this.handleToggle(false), 1000);
        }
      });
  };

  handleToggle = (isOpen) => {
    this.setState(({ open }) => ({ open: isOpen ?? !open }));
  };

  renderModalContent = () => {
    const { percent } = this.state;
    const { text } = this.props;
    return (
      <View style={styleSheet.container}>
        <View style={styleSheet.wrapper}>
          <ActivityIndicator size="large" color={COLORS.black} />
          <Text style={styleSheet.percent}>{`${percent}%`}</Text>
          {!!text && (
            <Text style={[styleSheet.desc, styleSheet.extraDesc]}>{text}</Text>
          )}
          <Text style={styleSheet.desc}>
            {'Please do not navigate away till this\nwindow closes.'}
          </Text>
        </View>
        <KeepAwake />
      </View>
    );
  };

  render() {
    const { open } = this.state;
    return <PureModal visible={open} content={this.renderModalContent()} />;
  }
}

LoadingTx.defaultProps = {
  text: '',
};

LoadingTx.propTypes = {
  text: PropTypes.string,
};

export default LoadingTx;
