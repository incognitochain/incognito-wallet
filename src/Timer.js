import React, { useState } from 'react';
import { View, Text, ScrollView, Button } from '@components/core/index';
import { useSelector } from 'react-redux';
import { accountSeleclor } from '@src/redux/selectors';

let interval = null;

const Timer = () => {
  const [timer, setTimer] = React.useState({});
  const account = useSelector(accountSeleclor.defaultAccount);
  const [displayAccount, setDisplayAccount] = useState(null);
  const [visible, setVisible] = useState(false);

  React.useEffect(() => {
    clearInterval(interval);
    interval = setInterval(() => {
      setDisplayAccount(account);
      if (global.timers && account) {
        const timer = global.timers[account.PaymentAddress];

        if (timer) {
          setTimer(timer);
        }
      }
    }, 4000);

    return () => {
      clearInterval(interval);
    };
  }, [account]);

  if (!visible) {
    return (<Button
      style={{
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
      }}
      onPress={() => setVisible(true)}
      title="Timer"
    />);
  }

  return (
    <ScrollView
      style={{
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        width: 200,
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        height: 300,
      }}
    >
      <View>
        <Text style={{ color: 'white' }}>{displayAccount?.name}</Text>
        <Button onPress={() => setVisible(false)} style={{ position: 'absolute', right: 8, width: 50 }} title="X" />
        {Object.keys(timer).map(coinId => (
          <View style={{ marginVertical: 10 }}>
            <Text style={{ color: 'white' }} ellipsizeMode="tail" numberOfLines={1}>{coinId}</Text>
            <Text style={{ color: 'white' }}>Step 1: {timer[coinId]?.getAllOutputCoins?.time / 1000} ({timer[coinId]?.getAllOutputCoins?.data})</Text>
            <Text style={{ color: 'white' }}>Step 2: {timer[coinId]?.deriveSerialNumbers?.time / 1000} ({timer[coinId]?.deriveSerialNumbers?.data})</Text>
            <Text style={{ color: 'white' }}>Step 3: {timer[coinId]?.getUnspentCoin?.time / 1000}</Text>
            <Text style={{ color: 'white' }}>Total: {(timer[coinId]?.getUnspentCoin?.time + timer[coinId]?.deriveSerialNumbers?.time + timer[coinId]?.getAllOutputCoins?.time) / 1000}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

Timer.propTypes = {};

export default Timer;
