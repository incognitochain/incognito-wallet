import PropTypes from 'prop-types';
import React from 'react';
import { RefreshControl } from 'react-native';
import {connect} from 'react-redux';
import _ from 'lodash';
import {ScrollView, Text, View} from '@components/core';
import {getHistories, getHistoryStatus} from '@src/redux/actions/uniswap';
import routeNames from '@routers/routeNames';
import HISTORY_TYPES from '@src/components/UniswapHistoryItem';
import stylesheet from './style';

class UniswapHistory extends React.Component {
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

  loadData = async () => {
    const { isFetching } = this.state;
    const { getHistories } = this.props;

    if (isFetching) {
      return;
    }

    try {
      this.setState({isFetching: true});
      await getHistories();
    } catch {
      //
    } finally {
      this.setState({isFetching: false});
    }
  };

  goToDetail(history) {
    const { navigation } = this.props;
    navigation.navigate(routeNames.UniswapHistoryDetail, { history });
  }

  renderHistory = (list, history, index) => {
    const History = HISTORY_TYPES[history.type];

    return (
      <History
        {...history}
        key={history.txId}
        onPress={this.goToDetail.bind(this, history)}
        isLastItem={index === list.length - 1}
      />
    );
  };

  renderList(list, title) {
    if (list.length <= 0) {
      return null;
    }

    return (
      <View style={stylesheet.wrapper}>
        <Text style={stylesheet.title}>{title}</Text>
        <View>
          {list.map((item, index) => this.renderHistory(list, item, index))}
        </View>
      </View>
    );
  }

  render() {
    const { histories } = this.props;
    const { isFetching } = this.state;

    const allHistories = _.orderBy([...histories], ['updatedAt'], ['desc']);

    console.debug('HISTORIES', allHistories, histories);

    return (
      <View style={stylesheet.container}>
        <ScrollView refreshControl={<RefreshControl refreshing={isFetching} onRefresh={this.loadData} />}>
          <View style={stylesheet.listContainer}>
            {this.renderList(allHistories, 'Activity')}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const mapState = state => ({
  histories: state.uniswap.histories,
});

const mapDispatch = {
  getHistories,
  getHistoryStatus,
};

UniswapHistory.propTypes = {
  histories: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired,
  getHistories: PropTypes.func.isRequired,
  getHistoryStatus: PropTypes.func.isRequired,
};

export default connect(
  mapState,
  mapDispatch
)(UniswapHistory);
