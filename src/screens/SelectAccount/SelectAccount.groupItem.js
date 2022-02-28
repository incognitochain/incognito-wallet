import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from '@src/components/core';
import { FONT } from '@src/styles';
import { Row } from '@src/components';
import { ArrowFillIcon } from '@components/Icons';
import styled from 'styled-components/native';

const styles = StyleSheet.create({
  title: {
    ...FONT.STYLE.medium,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 10,
    marginRight: 4,
  },
  group: {
    marginTop: 24
  },
  wrapArrow: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center'
  },
  child: {
    marginTop: 16
  }
});

const CustomRow = styled(Row)`
  background-color: ${({ theme }) => theme.btnBG3};
  height: 50px;
  border-radius: 8px;
  padding-left: 16px;
  padding-right: 16px;
`;

const GroupItem = ({ name, child, isLast, isDefaultExpand }) => {
  const [expand, setExpand] = useState(isDefaultExpand);

  const toggleExpand = () => {
    setExpand(!expand);
  };

  return (
    <View style={[isLast && { marginBottom: 30 }]}>
      <TouchableOpacity style={styles.group} onPress={toggleExpand}>
        <CustomRow centerVertical spaceBetween>
          <Text style={styles.title}>{name}</Text>
          <View style={styles.wrapArrow}>
            <ArrowFillIcon position={expand ? 'DOWN' : 'UP'} />
          </View>
        </CustomRow>
      </TouchableOpacity>
      {expand && (
        <View style={styles.child}>
          {child}
        </View>
      )}
    </View>
  );
};

GroupItem.propTypes = {
  name: PropTypes.string.isRequired,
  child: PropTypes.any.isRequired,
  isLast: PropTypes.bool.isRequired,
  isDefaultExpand: PropTypes.bool.isRequired,
};

export default GroupItem;
