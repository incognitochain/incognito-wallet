import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import { COLORS, FONT } from '@src/styles';
import PropTypes from 'prop-types';

export const styled = StyleSheet.create({
  container: {
  },
  title: {
    color: COLORS.lightGrey33,
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 5,
  },
  desc: {
    color: COLORS.black,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.superLarge,
    lineHeight: FONT.SIZE.superLarge + 8,
  },
  wrapLoading: {
    position: 'relative',
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: FONT.SIZE.superLarge + 8
  }
});

const HomeTabHeader = ({ title, desc, loading }) => {
  return (
    <View style={styled.container}>
      <Text style={styled.title}>{title}</Text>
      {loading ? (
        <View style={styled.wrapLoading}>
          <ActivityIndicator />
        </View>
      ) : (
        <Text style={styled.desc}>{desc}</Text>
      )}
    </View>
  );
};

HomeTabHeader.defaultProps = {
  loading: false
};

HomeTabHeader.propTypes = {
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  loading: PropTypes.bool
};

export default React.memo(HomeTabHeader);
