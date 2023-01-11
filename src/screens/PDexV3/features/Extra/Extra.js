import { Row } from '@src/components';
import { Text } from '@src/components/core';
import PropTypes from 'prop-types';
import { FONT } from '@src/styles';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BtnQuestionDefault } from '@src/components/Button';
import srcQuestionIcon from '@src/assets/images/icons/help-inline.png';
import { useSelector } from 'react-redux';
import { colorsSelector } from '@src/theme';

export const styled = StyleSheet.create({
  container: {
    marginBottom: 30,
  },
  titleContainer: {
    marginBottom: 15,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    marginRight: 10,
  },
  hook: {
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  labelContainer: {
    flex: 1,
    maxWidth: '35%',
    alignItems: 'center',
    marginRight: 5,
  },
  label: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    marginRight: 5,
  },
  value: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    lineHeight: FONT.SIZE.small + 7,
    flex: 1,
    textAlign: 'right',
  },
  bold: {
    fontFamily: FONT.NAME.bold,
  },
  hookCustomStyleBtnQuestion: {
    width: 14,
    height: 14,
  },
});

export const Hook = React.memo((props) => {
  const {
    label,
    value,
    boldLabel,
    boldValue,
    hasQuestionIcon,
    onPressQuestionIcon,
    customValue,
    customStyledValue,
    styledHook,
    customStyledLabel,
    labelNumberOfLine,
    valueNumberOfLine,
  } = props;
  const colors = useSelector(colorsSelector);
  return (
    <Row style={[styled.hook, styledHook]}>
      <Row style={styled.labelContainer}>
        <Text
          style={[
            styled.label,
            { color: colors.subText },
            boldLabel && styled.bold,
            customStyledLabel ?? customStyledLabel,
          ]}
          numberOfLines={labelNumberOfLine || 1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
        {hasQuestionIcon && (
          <BtnQuestionDefault
            icon={srcQuestionIcon}
            onPress={onPressQuestionIcon}
            customStyle={styled.hookCustomStyleBtnQuestion}
          />
        )}
      </Row>
      {customValue ? (
        customValue
      ) : (
        <Text
          numberOfLines={valueNumberOfLine || 1}
          ellipsizeMode="tail"
          style={[
            styled.value,
            { color: colors.mainText },
            boldValue && styled.bold,
            customStyledValue,
          ]}
        >
          {value}
        </Text>
      )}
    </Row>
  );
});

const Extra = (props) => {
  const { title, hooks, containerStyle, titleStyle } = props;
  return (
    <View style={{ ...styled.container, ...containerStyle }}>
      {title && (
        <Row style={styled.titleContainer}>
          <Text style={{ ...styled.title, ...titleStyle }}>{title}</Text>
        </Row>
      )}
      {hooks}
    </View>
  );
};

Hook.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  boldLabel: PropTypes.bool,
  boldValue: PropTypes.bool,
  hasQuestionIcon: PropTypes.bool,
  onPressQuestionIcon: PropTypes.func,
  customValue: PropTypes.any,
  titleStyle: PropTypes.any,
  labelNumberOfLine: PropTypes.number,
  valueNumberOfLine: PropTypes.number,
};

Extra.propTypes = {
  title: PropTypes.string,
  hooks: PropTypes.any,
};

export default React.memo(Extra);
