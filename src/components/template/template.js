import React from 'react';
import { View } from 'react-native';
import { styled } from './template.styled';

const Template = (props) => {
  return <View style={styled.container} />;
};

Template.propTypes = {};

export default React.memo(Template);
