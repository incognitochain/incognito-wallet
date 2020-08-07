import PropTypes from 'prop-types';
import React from 'react';
import { RefreshControl } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import { ScrollView, View } from '@components/core';
import {
  getHistories,
  getHistoryStatus,
  NOT_CHANGE_STATUS,
  MAX_ERROR_TRIED,
  RETRY_STATUS
} from '@src/redux/actions/dex';
import routeNames from '@routers/routeNames';
import HistoryItem from '@src/components/DexHistoryItem';
import { Header } from '@src/components';
import { withLayout_2 } from '@components/Layout/index';
import styles from './style';

class DexHistory extends React.Component {
  state = {
    isFetching: false,
  };

  componentDidMount() {
    const { navigation } = this.props;
    this.loadData();
    this.listener = navigation.addListener('didFocus', this.loadData);
  }

  componentWillUnmount() {
    this.listener.remove();
  }

  loadData = () => {
    const { isFetching } = this.state;
    const { getHistories } = this.props;

    if (isFetching) {
      return;
    }

    this.setState({ isFetching: true });
    getHistories()
      .then(this.getStatus);
  };

  getStatus = () => {
    const { histories, getHistoryStatus } = this.props;
    histories.forEach(item => {
      if ((!NOT_CHANGE_STATUS.includes(item.status)) ||
        (RETRY_STATUS.includes(item.status) && item.errorTried < MAX_ERROR_TRIED)) {
        getHistoryStatus(item);
      }
    });

    this.setState({ isFetching: false });
  };

  goToDetail(history) {
    const { navigation } = this.props;
    navigation.navigate(routeNames.InvestHistoryDetail, { history });
  }

  renderHistory(list, history) {
    return (
      <HistoryItem
        history={history}
        key={history.txId}
        onPress={this.goToDetail.bind(this, history)}
      />
    );
  }

  renderList(list) {
    if (list.length <= 0) {
      return null;
    }

    return (
      <View>
        {list.map(this.renderHistory.bind(this, list))}
      </View>
    );
  }

  render() {
    let { histories } = this.props;
    const { isFetching } = this.state;

    const allHistories = _.orderBy(histories, ['lockTime'], ['desc']);

    return (
      <View>
        <Header title="History" />
        <ScrollView
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={this.loadData} />}
          style={styles.scrollView}
        >
          {this.renderList(allHistories)}
        </ScrollView>
      </View>
    );
  }
}

const mapState = state => ({
  histories: state.dex.histories,
});

const mapDispatch = {
  getHistories,
  getHistoryStatus,
};

DexHistory.propTypes = {
  histories: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  getHistories: PropTypes.func.isRequired,
  getHistoryStatus: PropTypes.func.isRequired,
};

export default connect(
  mapState,
  mapDispatch
)(withLayout_2(DexHistory));
