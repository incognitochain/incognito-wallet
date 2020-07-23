import React from 'react';
import { SafeAreaView, RefreshControl } from 'react-native';
import PropTypes from 'prop-types';
import Header from '@src/components/Header';
import LoadingContainer from '@src/components/LoadingContainer';
import { FlatList } from '@src/components/core/FlatList';
import { ScrollView } from '@src/components/core';
import { styled } from './Notification.styled';
import withNotification from './Notification.enhance';
import NotificationItem from './Notification.item';

const Notification = (props) => {
  const {
    list,
    handleLoadmore,
    showActivityIndicator,
    refreshing,
    onRefresh,
  } = props;
  const [state, setState] = React.useState({
    activeRowKey: null,
  });
  const { activeRowKey } = state;
  const _onClose = () => {
    !!activeRowKey ?? setState({ ...state, activeRowKey: null });
  };
  const _onOpen = (rowId) => {
    setState({ ...state, activeRowKey: rowId });
  };
  return (
    <SafeAreaView style={styled.container}>
      <Header title="Bulletin" style={styled.padding25} />
      <ScrollView>
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          style={[styled.flatlist, styled.padding25]}
          data={list}
          renderItem={({ item, index }) => {
            const { id } = item;
            return (
              <NotificationItem
                {...{
                  item,
                  firstChild: index === 0,
                  lastChild: list.length - 1 === index,
                  _onClose: () => _onClose(id),
                  _onOpen: () => _onOpen(id),
                  closeSwipe: activeRowKey !== id,
                }}
              />
            );
          }}
          keyExtractor={(item) => item.id}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadmore}
          ListFooterComponent={showActivityIndicator ? LoadingContainer : null}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

Notification.propTypes = {
  list: PropTypes.array.isRequired,
  handleLoadmore: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  showActivityIndicator: PropTypes.bool.isRequired,
  refreshing: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default withNotification(Notification);
