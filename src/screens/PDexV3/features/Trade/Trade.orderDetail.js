import React from 'react';
import { StyleSheet } from 'react-native';
import ClipboardService from '@src/services/clipboard';
import { FONT } from '@src/styles';
import { Row } from '@src/components';
import { Text } from '@src/components/core';
import { BtnCopy, BtnOpenUrl } from '@src/components/Button';

export const styled = StyleSheet.create({
  label: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    width: 120,
  },
  row: {
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    minHeight: 24,
  },
  btn: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  value: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.small,
    textAlign: 'left',
    flex: 1,
  },
  rowValue: {
    alignItems: 'flex-start',
    marginLeft: 15,
    flex: 1,
  },
});

export const OrderDetailValue = React.memo(
  ({ copiable, openUrl, handleOpenUrl, value, containerStyle, valueStyle = {}}) => {
    const handleCopy = () => ClipboardService.set(value);
    return (
      <Row style={[styled.rowValue, containerStyle || {}]}>
        <Text style={[styled.value, valueStyle]} ellipsizeMode="middle" numberOfLines={1}>
          {value}
        </Text>
        {copiable && (
          <BtnCopy onPress={handleCopy} containerStyle={styled.btn} />
        )}
        {openUrl && (
          <BtnOpenUrl onPress={handleOpenUrl} containerStyle={[styled.btn, { marginTop: 3 }]} />
        )}
      </Row>
    );
  },
);

const OrderDetail = ({
  label,
  value,
  copiable,
  openUrl,
  handleOpenUrl,
  customValue,
  hookStyled,
  labelStyle,
  valueStyle,
  valueContainerStyle
}) => {
  if (!value || value === 'undefined' || value === 'null') return null;
  return (
    <Row style={{ ...styled.row, ...hookStyled }}>
      <Text
        style={[styled.label, labelStyle || {}]}
        ellipsizeMode="middle"
        numberOfLines={1}
      >
        {`${label}: `}
      </Text>
      {customValue ? (
        customValue
      ) : (
        <OrderDetailValue
          {...{
            copiable,
            openUrl,
            handleOpenUrl,
            value,
            valueStyle,
            containerStyle: valueContainerStyle || {},
          }}
        />
      )}
    </Row>
  );
};

OrderDetail.propTypes = {};

export default React.memo(OrderDetail);
