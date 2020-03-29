import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Text, TouchableOpacity, View} from '@components/core';
import routeNames from '@routers/routeNames';
import { LIMIT_HISTORY } from '@screens/Uniswap/constants';
import HISTORY_TYPES from '@src/components/UniswapHistoryItem';
import { mainStyle } from '@screens/Uniswap/style';
import stylesheet from './style';

class RecentHistory extends React.PureComponent {
  goToDetail(history) {
    const { navigation } = this.props;
    navigation.navigate(routeNames.UniswapHistoryDetail, { history });
  }

  goToHistory = () => {
    const { navigation } = this.props;
    navigation.navigate(routeNames.UniswapHistory);
  };

  renderHistory(list, history, index) {
    const History = HISTORY_TYPES[history.type];
    return (
      <History
        {...history}
        key={history.txId}
        onPress={this.goToDetail.bind(this, history)}
        isLastItem={index === list.length - 1}
        style={stylesheet.history}
      />
    );
  }

  render() {
    const { histories } = this.props;

    if (histories.length <= 0) {
      return null;
    }

    const allHistories = _.orderBy(histories, ['updatedAt', 'lockTime'], ['desc', 'desc']).slice(0, LIMIT_HISTORY);

    return (
      <View style={[mainStyle.content, stylesheet.recentHistory]}>
        <View style={stylesheet.wrapper}>
          <View style={[mainStyle.twoColumns, stylesheet.header]}>
            <Text style={stylesheet.title}>Recent transactions</Text>
            {histories?.length > LIMIT_HISTORY && (
              <TouchableOpacity onPress={this.goToHistory} style={mainStyle.textRight}>
                <Text style={stylesheet.viewHistoryText}>View all</Text>
              </TouchableOpacity>
            )}
          </View>
          <View>
            {allHistories.map(this.renderHistory.bind(this, allHistories))}
          </View>
        </View>
      </View>
    );
  }
}

RecentHistory.propTypes = {
  histories: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
};

export default RecentHistory;
