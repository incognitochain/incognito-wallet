import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, ScrollView, TouchableOpacity } from '@components/core';
import mainStyles from '@screens/PoolV2/style';
import { Row } from '@src/components/';
import { ArrowRightGreyIcon } from '@components/Icons/index';
import { useNavigation } from 'react-navigation-hooks';
import ROUTE_NAMES from '@routers/routeNames';
import { CONSTANT_COMMONS } from '@src/constants';
import { RefreshControl } from 'react-native';
import styles from './style';

const CoinList = ({
  coins,
  data,
  histories,
  withdrawable,
  loading,
  onLoad,
  account,
}) => {
  const navigation = useNavigation();

  const handleHistory = () => {
    navigation.navigate(ROUTE_NAMES.PoolV2History, {
      coins,
    });
  };

  const renderEmpty = () => {
    return (
      <>
        <Row style={mainStyles.coin}>
          <Text style={mainStyles.coinName}>Provide liquidity for pDEX</Text>
        </Row>
        <ScrollView
          refreshControl={(
            <RefreshControl
              refreshing={loading}
              onRefresh={() => onLoad(account)}
            />
          )}
          style={styles.scrollView}
        >
          {coins.map(item => (
            <Row style={mainStyles.coin} key={item.symbol}>
              <Text style={mainStyles.coinName}>{item.name}</Text>
              <Text
                style={[mainStyles.coinInterest, mainStyles.textRight, mainStyles.flex]}
              >{item.displayInterest}
              </Text>
            </Row>
          ))}
        </ScrollView>
      </>
    );
  };

  const renderUserData = () => {
    return (
      <ScrollView
        refreshControl={(
          <RefreshControl
            refreshing={loading}
            onRefresh={() => onLoad(account)}
          />
        )}
        style={styles.scrollView}
      >
        {data.map(item => (
          <View style={mainStyles.coin} key={item.symbol}>
            <Row>
              <View>
                <Text style={mainStyles.coinName}>{item.symbol}</Text>
                <Text style={mainStyles.coinInterest}>
                  {coins.find(coin => coin.id === item.id).displayInterest}
                </Text>
              </View>
              <View style={[mainStyles.flex]}>
                <Text style={[mainStyles.coinName, mainStyles.textRight]}>{item.displayBalance}</Text>
                {!!item.displayPendingBalance &&
                  <Text style={[mainStyles.coinName, mainStyles.textRight]}>+ {item.displayPendingBalance}</Text>
                }
                {!!item.displayUnstakeBalance &&
                <Text style={[mainStyles.coinName, mainStyles.textRight]}>- {item.displayUnstakeBalance}</Text>
                }
                <Text style={[mainStyles.coinExtra, mainStyles.textRight]}>
                  {CONSTANT_COMMONS.PRV_SPECIAL_SYMBOL}&nbsp;
                  {item.displayReward}
                </Text>
                {!!item.displayWithdrawReward &&
                <Text style={[mainStyles.coinExtra, mainStyles.textRight]}>- {item.displayWithdrawReward}</Text>
                }
              </View>
            </Row>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderBottom = () => {
    if (histories?.length > 0) {
      return (
        <TouchableOpacity onPress={handleHistory}>
          <Row center spaceBetween style={mainStyles.flex}>
            <Text style={styles.rateStyle}>Provider history</Text>
            <ArrowRightGreyIcon style={[{marginLeft: 10}]} />
          </Row>
        </TouchableOpacity>
      );
    }

    return (
      <Text style={styles.rateStyle}>Rates subject to change at any time.</Text>
    );
  };

  const renderContent = () => {
    if (withdrawable) {
      return renderUserData();
    }

    return renderEmpty();
  };

  return (
    <View style={mainStyles.coinContainer}>
      {renderContent()}
      <View style={styles.rateChange}>
        {renderBottom()}
      </View>
    </View>
  );
};

CoinList.propTypes = {
  coins: PropTypes.array,
  data: PropTypes.array,
  histories: PropTypes.array,
  withdrawable: PropTypes.bool,
  onLoad: PropTypes.func,
  loading: PropTypes.bool,
  account: PropTypes.object.isRequired,
};

CoinList.defaultProps = {
  coins: [],
  data: [],
  histories: [],
  withdrawable: false,
  onLoad: undefined,
  loading: false,
};

export default React.memo(CoinList);
