import React from 'react';
import PropTypes from 'prop-types';
import { View, Text } from '@src/components/core';
import stylesheet from './style';


const ExtraInfo = (props) => {
  const { left, right, style, rightStyle, wrapperStyle } = props;

  const LeftWrapper = typeof left === 'object' ? View : Text;
  const RightWrapper = typeof right === 'object' ? View : Text;

  return (
    <View style={[stylesheet.wrapper, wrapperStyle]}>
      <LeftWrapper style={[stylesheet.text, stylesheet.textLeft, style]}>{left}</LeftWrapper>
      <RightWrapper
        numberOfLines={1}
        ellipsizeMode='tail'
        style={[stylesheet.text, stylesheet.textRight, style, rightStyle]}
      >
        {right}
      </RightWrapper>
    </View>
  );
};

ExtraInfo.propTypes = {
  left: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
  right: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.number,
  ]).isRequired,
  style: PropTypes.object,
  wrapperStyle: PropTypes.object,
  rightStyle: PropTypes.object,
};

ExtraInfo.defaultProps = {
  style: null,
  rightStyle: null,
  wrapperStyle: null,
};

export default ExtraInfo;
