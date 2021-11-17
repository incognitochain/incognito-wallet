import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { Text } from '@src/components/core';
import Row from '@src/components/Row';
import { ArrowRightGreyIcon, ChevronIcon } from '@src/components/Icons';
import { FONT } from '@src/styles';

const styled = StyleSheet.create({
  container: {},
  row: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    marginRight: 10,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
  },
  rightArrowRow: {
    justifyContent: 'flex-start',
  },
});

const ToggleArrow = (props) => {
  const {
    toggle,
    label,
    handlePressToggle,
    style,
    useRightArrow = false,
    labelStyle,
  } = props;
  return (
    <TouchableOpacity
      style={{
        ...styled.container,
        ...style,
      }}
      onPress={() => {
        if (typeof handlePressToggle === 'function') {
          handlePressToggle();
        }
      }}
    >
      <Row
        style={{
          ...styled.row,
          ...(useRightArrow ? styled.rightArrowRow : {}),
        }}
      >
        <Text style={{ ...styled.label, ...labelStyle }}>{label}</Text>
        {useRightArrow ? (
          <ArrowRightGreyIcon />
        ) : (
          <ChevronIcon toggle={toggle} />
        )}
      </Row>
    </TouchableOpacity>
  );
};

ToggleArrow.propTypes = {
  toggle: PropTypes.bool.isRequired,
  label: PropTypes.bool.isRequired,
  handlePressToggle: PropTypes.func.isRequired,
  useRightArrow: PropTypes.bool,
  labelStyle: PropTypes.object,
};

export default React.memo(ToggleArrow);
