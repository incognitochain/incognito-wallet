import React from 'react';
import { View, StyleSheet, TextInputProps } from 'react-native';
import PropTypes from 'prop-types';
import Row from '@src/components/Row';
import { COLORS, FONT } from '@src/styles';
import { SearchIcon } from '@src/components/Icons';
import BaseTextInput from './BaseTextInput';

const styled = StyleSheet.create({
  container: {
    backgroundColor: COLORS.colorGrey4,
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  inputStyle: {
    flex: 1,
    color: COLORS.black,
    fontSize: FONT.SIZE.small,
    fontFamily: FONT.NAME.medium,
  },
});

const BaseTextInputCustom = (props) => {
  const inputProps: TextInputProps = props?.inputProps;
  const { canSearch, renderCustom, style } = props;
  const handleRenderCustom = () => {
    if (renderCustom) {
      return renderCustom;
    }
    return <View>{canSearch && <SearchIcon />}</View>;
  };
  return (
    <Row style={[styled.container, style]}>
      <BaseTextInput
        {...{
          ...inputProps,
          style: { ...styled.inputStyle, ...inputProps?.style },
        }}
        placeholderTextColor={COLORS.lightGrey34}
      />
      {handleRenderCustom()}
    </Row>
  );
};

BaseTextInputCustom.defaultProps = {
  inputProps: {},
  canSearch: true,
  renderCustom: undefined,
  style: undefined
};

BaseTextInputCustom.propTypes = {
  inputProps: PropTypes.object,
  canSearch: PropTypes.bool,
  renderCustom: PropTypes.element,
  style: PropTypes.object
};

export default React.memo(BaseTextInputCustom);
