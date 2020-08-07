import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from '@components/core';
import _ from 'lodash';
import { Icon } from 'react-native-elements';
import { COLORS } from '@src/styles';
import Row from '@components/Row/index';
import stylesheet from './style';

const HistoryItem = ({
  style,
  onPress,
  history,
}) => {
  const { status, type } = history;
  return (
    <TouchableOpacity style={[stylesheet.history, style]} onPress={onPress}>
      <View style={[stylesheet.shortInfo]}>
        <Text style={stylesheet.historyType}>{_.capitalize(type)}</Text>
      </View>
      <Row center spaceBetween style={stylesheet.flex}>
        <Text style={stylesheet.shortDesc} numberOfLines={2}>
          {history.shortDescription}
        </Text>
        <Row style={[stylesheet.historyStatus]}>
          {status === undefined ?
            <ActivityIndicator size="small" style={stylesheet.textRight} /> :
            <Text style={[stylesheet.textRight, stylesheet[status]]}>{_.capitalize(status)}</Text>
          }
          <View style={stylesheet.icon}>
            <Icon name="chevron-right" color={COLORS.lightGrey1} />
          </View>
        </Row>
      </Row>
    </TouchableOpacity>
  );
};

export default HistoryItem;
