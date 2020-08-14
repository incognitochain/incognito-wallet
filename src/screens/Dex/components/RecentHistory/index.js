import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Text, TouchableOpacity, View} from '@components/core';
import routeNames from '@routers/routeNames';
import { LIMIT_HISTORY } from '@screens/Dex/constants';
import HISTORY_TYPES from '@src/components/DexHistoryItem';
import { MAX_ERROR_TRIED, NOT_CHANGE_STATUS, RETRY_STATUS } from '@src/redux/actions/dex';
import { mainStyle } from '@screens/Dex/style';
import stylesheet from './style';

class RecentHistory extends React.PureComponent {
  focus = true;
  getting = false;

  componentDidMount() {
    const { navigation } = this.props;
    this.focusListener = navigation.addListener('didFocus', () => {
      this.focus = true;
    });

    this.blurListener = navigation.addListener('didBlur', () => {
      this.focus = false;
    });
  }

  componentWillUnmount() {
    this.focusListener.remove();
    this.blurListener.remove();
  }

  componentDidUpdate() {
    if (this.focus) {
      this.getStatus();
    }
  }

  getStatus = () => {
    if (this.getting) {
      return;
    }

    const { histories, onGetHistoryStatus } = this.props;
    const promises = [];
    this.getting = true;

    (histories || []).forEach(item => {
      if ((!NOT_CHANGE_STATUS.includes(item.status)) ||
        (RETRY_STATUS.includes(item.status) && item.errorTried < MAX_ERROR_TRIED)) {
        promises.push(onGetHistoryStatus(item));
      }
    });

    Promise.all(promises)
      .then(() => this.getting = false)
      .catch(() => this.getting = false);
  };

  goToDetail(history) {
    const { navigation } = this.props;
    navigation.navigate(routeNames.DexHistoryDetail, { history });
  }

  goToHistory = () => {
    const { navigation } = this.props;
    navigation.navigate(routeNames.DexHistory);
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

    const allHistories = _.orderBy(histories, ['updatedAt'], ['desc']).slice(0, LIMIT_HISTORY);
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
  onGetHistoryStatus: PropTypes.func.isRequired,
};

export default RecentHistory;
