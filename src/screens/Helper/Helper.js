import React, {memo} from 'react';
import { Text, View, StyleSheet, ScrollView } from 'react-native';
import {Header} from '@src/components';
import { COLORS, FONT } from '@src/styles';
import PropTypes from 'prop-types';
import withEnhance from './Helper.enhance';

const HelperScreen = ({ title, content }) => (
  <View style={styles.container}>
    <Header title={title} />
    <ScrollView>
      <Text style={styles.wrapper}>
        {content}
      </Text>
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  wrapper: {
    ...FONT.STYLE.normal,
    marginTop: 43,
    lineHeight: 25,
    color: COLORS.newGrey,
    fontSize: FONT.SIZE.regular
  }
});

HelperScreen.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

export default withEnhance(memo(HelperScreen));