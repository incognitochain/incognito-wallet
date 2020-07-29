import React from 'react';
import PropTypes from 'prop-types';
import { ScrollView as RNComponent } from 'react-native';
import styleSheet from './style';

const ScrollView = React.forwardRef(({ style, contentContainerStyle, paddingBottom, ...otherProps }, ref) => (
  <RNComponent
    style={[styleSheet.root, style]}
    contentContainerStyle={[paddingBottom && styleSheet.content, contentContainerStyle]}
    keyboardShouldPersistTaps="handled"
    ref={ref}
    showsVerticalScrollIndicator={false}
    {...otherProps}
  />
));

ScrollView.defaultProps = {
  style: null,
  contentContainerStyle: null,
  paddingBottom: false,
};

ScrollView.propTypes = {
  style: PropTypes.object,
  contentContainerStyle: PropTypes.object,
  paddingBottom: PropTypes.bool,
};

export default ScrollView;
