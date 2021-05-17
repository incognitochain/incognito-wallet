import { Modal } from 'react-native';
import PropTypes from 'prop-types';
import { ActivityIndicator, Text, View } from '@components/core/index';
import { COLORS } from '@src/styles';
import React from 'react';
import KeepAwake from 'react-native-keep-awake';
import { useSelector } from 'react-redux';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import accountService from '@src/services/wallet/accountService';
import { walletSelector } from '@src/redux/selectors/wallet';
import stylesheet from './style';

const Loading = ({ open }) => {
  const account = useSelector(defaultAccountSelector);
  const wallet = useSelector(walletSelector);
  const [state, setState] = React.useState({
    percent: 0,
    message: '',
  });
  const { percent, message } = state;
  const progress = async () => {
    const [percent, message] = await Promise.all([
      accountService.getProgressTx(account, wallet),
      accountService.getDebugMessage(account, wallet),
    ]);
    percent && setState({ ...state, percent, message });
  };
  React.useEffect(() => {
    const interval = setInterval(() => {
      progress();
    }, 100);
    return () => clearInterval(interval);
  }, []);
  return (
    <Modal animationType="fade" transparent visible={open}>
      <View style={stylesheet.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={stylesheet.desc}>
          {
            'Completing this action...\n\nPlease do not navigate away from the app.'
          }
        </Text>
        <Text style={stylesheet.percent}>{`${percent}%`}</Text>
        {!!global.isDebug() && !!message && (
          <Text style={stylesheet.desc}>{message}</Text>
        )}
        <KeepAwake />
      </View>
    </Modal>
  );
};

Loading.propTypes = {
  open: PropTypes.bool.isRequired,
};

export default Loading;
