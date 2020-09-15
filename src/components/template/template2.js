import React from 'react';
import { View, StyleSheet } from 'react-native';

const styled = StyleSheet.create({
  container: {},
});

const Template = (props) => {
  return <View style={styled.container} />;
};

Template.propTypes = {};

export default React.memo(Template);
