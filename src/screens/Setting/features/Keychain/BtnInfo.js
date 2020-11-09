import React from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import srcQuestion from '@assets/images/icons/question_gray.png';
import { TouchableOpacity } from '@components/core';
import { BtnQuestionDefault } from '@components/Button/index';

const styled = StyleSheet.create({
  wrapper: {
    padding: 10,
  },
});

const BtnInfo = () => {
  const navigation = useNavigation();
  const handlePress = () => navigation.navigate(routeNames.KeysExplained);
  return (
    <TouchableOpacity style={styled.wrapper} onPress={handlePress}>
      <BtnQuestionDefault icon={srcQuestion} onPress={handlePress} />
    </TouchableOpacity>
  );
};

BtnInfo.propTypes = {};

export default React.memo(BtnInfo);
