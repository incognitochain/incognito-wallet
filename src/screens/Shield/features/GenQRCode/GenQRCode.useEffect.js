import React from 'react';
import { formatTime } from '@src/utils/convert';

export const useCountDown = props => {
  const [state, setState] = React.useState({
    time: 3600,
  });
  const { time } = state;
  const handleCountDown = async () => {
    await setState({ ...state, time: time - 1 });
  };

  React.useEffect(() => {
    const intervalId = setInterval(handleCountDown, 1000);
    return () => {
      clearInterval(intervalId);
    };
  });
  return [formatTime(time)];
};
