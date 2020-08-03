import React from 'react';
import { RefreshControl, View } from 'react-native';
import PropTypes from 'prop-types';
import { ScrollView } from '@src/components/core';
import styles from './style';
import withHome from './Home.enhance';
import Category from './features/Category';

const Home = (props) => {
  const { getHomeConfiguration, categories, isFetching } = props?.homeProps;
  return (
    <ScrollView
      refreshControl={(
        <RefreshControl
          refreshing={isFetching}
          onRefresh={getHomeConfiguration}
        />
      )}
    >
      <View style={styles.contentContainer}>
        {categories.map((category, index) => (
          <Category
            key={category?.id}
            {...{ ...category, firstChild: index === 0 }}
          />
        ))}
      </View>
    </ScrollView>
  );
};

Home.propTypes = {
  homeProps: PropTypes.shape({
    getHomeConfiguration: PropTypes.func.isRequired,
    categories: PropTypes.array.isRequired,
    isFetching: PropTypes.bool.isRequired,
  }).isRequired,
};

export default withHome(Home);
