import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { WebView } from 'react-native-webview';
import { ButtonBasic } from '@src/components/Button';
import { Row } from '@src/components';
import { COLORS, FONT } from '@src/styles';
import SelectedPrivacy from '@src/models/selectedPrivacy';
import { ExHandler } from '@src/services/exception';
import convert from '@src/utils/convert';
import { actionGetPDexV3Inst } from '@screens/PDexV3';
import { ScreenWidth } from '@src/utils/devices';
import Server from '@src/services/wallet/Server';
import { ActivityIndicator } from '@src/components/core';
import format from '@src/utils/format';
import minBy from 'lodash/minBy';
import { poolSelectedSelector } from './Chart.selector';

const styled = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 250,
    marginBottom: 16,
  },
  btnStyle: {
    height: 24,
    backgroundColor: COLORS.lightGrey19,
    flex: 1,
    marginRight: 10,
  },
  titleStyle: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 5,
    color: COLORS.black,
  },
});

const periods = [
  '15m',
  '1h',
  '4h',
  '1d',
  'W',
  // 'M',
  // 'Y'
];

export const Period = React.memo(({ handleFetchData }) => {
  const [actived, setActived] = React.useState(periods[0]);
  return (
    <Row
      style={{
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
      }}
    >
      {periods?.map((period, index, arr) => (
        <ButtonBasic
          btnStyle={{
            ...styled.btnStyle,
            ...(index === arr.length - 1 ? { marginRight: 0 } : {}),
          }}
          titleStyle={{
            ...styled.titleStyle,
            ...(period === actived ? { color: COLORS.colorTradeBlue } : {}),
          }}
          title={period}
          key={period}
          onPress={async () => {
            if (actived === period) {
              return;
            }
            setActived(period);
            handleFetchData(period);
          }}
        />
      ))}
    </Row>
  );
});

const PriceHistoryCandles = () => {
  const [initted, setInitted] = React.useState(false);
  const [uri, setURI] = React.useState('');
  const ref = React.useRef({});
  const pool = useSelector(poolSelectedSelector);
  const dispatch = useDispatch();
  const token2: SelectedPrivacy = pool?.token2;
  const handlePostMessage = (message) => {
    if (ref?.current) {
      ref.current.postMessage(message);
    }
  };
  const handleFetchData = async (actived) => {
    try {
      const pdexV3Inst = await dispatch(actionGetPDexV3Inst());
      let intervals = '';
      let period = '';
      switch (actived) {
      case '15m':
        period = 'PT15M';
        intervals = 'P1D';
        break;
      case '1h':
        period = 'PT1H';
        intervals = 'P7D';
        break;
      case '4h':
        period = 'PT4H';
        intervals = 'P30D';
        break;
      case '1d':
        period = 'P1D';
        intervals = 'P60D';
        break;
      case 'W':
        period = 'P1W';
        intervals = 'P1Y';
        break;
        // case 'M':
        //   period = 'P1M';
        //   intervals = 'P1Y';
        //   break;
        // case 'Y':
        //   period = 'P1M';
        //   intervals = 'P12M';
        //   break;
      default:
        break;
      }
      const { poolId: poolid } = pool;
      const { pDecimals }: SelectedPrivacy = pool?.token2;
      const res =
        (await pdexV3Inst.getPriceHistory({
          poolid,
          period,
          intervals,
        })) || [];
      const candles = res.map((c, index) => {
        const { open, close, high, low, timestamp } = c;
        const result = {
          open: convert.toHumanAmountVer2(open, pDecimals),
          close: convert.toHumanAmountVer2(close, pDecimals),
          high: convert.toHumanAmountVer2(high, pDecimals),
          low: convert.toHumanAmountVer2(low, pDecimals),
          time: timestamp,
        };
        return result;
      });
      if (candles) {
        let width = Number(ScreenWidth) - 50;
        const minLow = minBy(candles, (c) => c?.low)?.low || 0;
        const precision =
          format.getDecimalsFromHumanAmount(minLow) || token2?.pDecimals;
        const minMove = 1 / Math.pow(10, precision);
        handlePostMessage(
          `configsChart|${JSON.stringify({
            chartConfigs: {
              lwChartConfigs: {
                width,
                height: 250,
              },
              lwChartOptions: {
                timeScale: {
                  timeVisible: true,
                },
              },
              candlesStickConfigs: {
                upColor: '#53B987',
                downColor: '#EC4D5C',
              },
              candlesStickOptions: {
                priceFormat: {
                  precision,
                  minMove,
                },
              },
            },
            candles,
          })}`,
        );
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const handleOnMessage = async (e) => {
    const data = e.nativeEvent.data;
    const parseData = JSON.parse(data);
    if (parseData?.initted) {
      await setInitted(true);
      handleFetchData(periods[0]);
    }
  };
  const handleInit = async () => {
    try {
      const server = await Server.getDefault();
      setURI(server?.webviewChartServices);
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  React.useEffect(() => {
    handleInit();
  }, []);
  return (
    <View style={styled.container}>
      {!initted && <ActivityIndicator />}
      <WebView
        ref={ref}
        style={{
          width: '100%',
          height: 250,
        }}
        source={{ uri }}
        onMessage={handleOnMessage}
      />
      <Period {...{ handleFetchData }} />
    </View>
  );
};

PriceHistoryCandles.propTypes = {};

export default React.memo(PriceHistoryCandles);
