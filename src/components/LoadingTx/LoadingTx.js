import { ActivityIndicator, Text, View } from '@src/components/core';
import accountService from '@src/services/wallet/accountService';
import { COLORS } from '@src/styles';
import PropTypes from 'prop-types';
import React from 'react';
import KeepAwake from 'react-native-keep-awake';
import PureModal from '@components/Modal/features/PureModal';
import moment from 'moment';
import styleSheet from './style';

const LoadingTx = (props) => {
  const [state, setState] = React.useState({
    open: true,
    percent: 0,
    message: '',
    totalTime: 0,
    startTime: null,
  });
  const [startTime, setStartTime] = React.useState(null);
  const { text, descFactories, currentTime, totalTimes } = props;
  const { open, percent, message } = state;

  let displayPercent = percent;

  if (totalTimes) {
    const maxPercentPerTime = 100 / totalTimes;
    const currentTimeStartPercent = currentTime * maxPercentPerTime;

    displayPercent = Math.floor(currentTimeStartPercent + (percent / totalTimes));
  }

  const progress = () => {
    const percent = accountService.getProgressTx();
    const message = accountService.getDebugMessage();
    setState({ ...state, percent, message });
    if (percent === 100) {
      setTimeout(() => handleToggle(false), 1000);
    }
  };
  const handleToggle = (isOpen) => setState({ ...state, open: !!isOpen });

  const renderModalContent = () => {
    return (
      <View style={styleSheet.container}>
        <View style={styleSheet.wrapper}>
          <ActivityIndicator size="large" color={COLORS.black} />
          <Text style={styleSheet.percent}>{`${displayPercent}%`}</Text>
          {!!text && (
            <Text style={[styleSheet.desc, styleSheet.extraDesc]}>{text}</Text>
          )}
          {descFactories ? (
            descFactories?.map((item) => (
              <Text style={[styleSheet.desc, item?.styled]}>{item?.desc}</Text>
            ))
          ) : (
            <Text style={styleSheet.desc}>
              {'Please do not navigate away till this\nwindow closes.'}
            </Text>
          )}
          {!!global.isDebug() && !!message && (
            <Text style={styleSheet.desc}>{message}</Text>
          )}
          {!!global.isDebug() && (
            <Text style={styleSheet.desc}>{moment().diff(startTime, 'seconds')} seconds</Text>
          )}
        </View>
        <KeepAwake />
      </View>
    );
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      progress();
    }, 1000);
    setStartTime(moment());
    return () => clearInterval(interval);
  }, []);

  return <PureModal visible={open} content={renderModalContent()} />;
};

LoadingTx.defaultProps = {
  text: '',
  totalTimes: undefined,
  currentTime: undefined,
  descFactories: null,
};

LoadingTx.propTypes = {
  text: PropTypes.string,
  totalTimes: PropTypes.number,
  currentTime: PropTypes.number,
  descFactories: PropTypes.array,
};

export default React.memo(LoadingTx);
