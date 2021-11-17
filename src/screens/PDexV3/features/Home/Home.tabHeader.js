import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import { COLORS, FONT } from '@src/styles';
import PropTypes from 'prop-types';
import {ActivityIndicator} from '@components/core';

export const styled = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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
    textAlign: 'center'
  },
  wrapLoading: {
    position: 'relative',
    alignItems: 'center',
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
