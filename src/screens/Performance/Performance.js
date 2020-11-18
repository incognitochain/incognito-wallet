import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ScrollView } from '@src/components/core';
import { useSelector, useDispatch } from 'react-redux';
import { BtnClose } from '@src/components/Button';
import { performanceSelector } from './Performance.selector';
import { styled } from './Performance.styled';
import {actionClearPerformance, actionToggle} from './Performance.actions';

const NormalText = ({ text }) => {
  return <Text style={styled.text}>{text}</Text>;
};

const Item = ({ title, desc, time, id }) => (
  <View style={styled.item}>
    <NormalText text={`\nid: ${id}`} />
    <NormalText text={title} />
    <NormalText text={desc} />
    <NormalText text={time} />
  </View>
);

const Performance = () => {
  const isDev = global.isDebug();
  const { data, toggle } = useSelector(performanceSelector);
  const dispatch = useDispatch();

  const renderButtonClear = () => {
    return(
      <TouchableOpacity
        onPress={() => dispatch(actionClearPerformance())}
        activeOpacity={0.7}
        style={styled.btnClear}
      >
        <Text>Clear</Text>
      </TouchableOpacity>
    );
  };

  if (!isDev) {
    return null;
  }
  if (!toggle) {
    return (
      <View style={[styled.btn, styled.abs]}>
        <BtnClose onPress={() => dispatch(actionToggle())} />
      </View>
    );
  }
  return (
    <View style={styled.wrapper}>
      <View style={styled.btn}>
        {renderButtonClear()}
        <BtnClose onPress={() => dispatch(actionToggle())} />
      </View>
      <View style={styled.wrapContent}>
        <ScrollView style={{ backgroundColor: 'transparent', marginHorizontal: 4 }}>
          <View>
            {data.map((item, index) => (
              <Item {...{ ...item, id: index }} key={item?.id || index} />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

Performance.propTypes = {};

export default Performance;
