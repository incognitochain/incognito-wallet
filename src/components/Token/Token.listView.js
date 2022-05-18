import PropTypes from 'prop-types';
import React from 'react';
import { RefreshControl } from 'react-native';
import BigList from 'react-native-big-list';

const ListView = React.memo((props) => {
  const { data, visible, renderItem, onRefresh, isRefreshing } = props;
  if (!visible || data.length === 0) {
    return null;
  }

  return (
    <BigList
      data={data}
      refreshControl={
        <RefreshControl
          tintColor="white"
          refreshing={isRefreshing}
          onRefresh={onRefresh}
        />
      }
      renderItem={renderItem}
      itemHeight={75}
      showsVerticalScrollIndicator={false}
    />
  );
});

ListView.defaultProps = {
  styledListToken: null,
  data: [],
};

ListView.propTypes = {
  data: PropTypes.array,
  visible: PropTypes.bool.isRequired,
  styledListToken: PropTypes.any,
  renderItem: PropTypes.any.isRequired,
  isRefreshing: PropTypes.bool,
  onRefresh: PropTypes.func,
};

export default ListView;
