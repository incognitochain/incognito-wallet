import React from 'react';
import { View, Text } from 'react-native';
import Header from '@src/components/Header';
import { BtnQuestionDefault, ButtonBasic } from '@src/components/Button';
import srcQuestion from '@src/assets/images/icons/question_gray.png';
import { ScrollView } from '@src/components/core';
import { withLayout_2 } from '@src/components/Layout';
import { useSelector } from 'react-redux';

import LoadingTx from '@src/components/LoadingTx';
import { useStreamLine } from './Streamline.useStreamline';
import { styled } from './Streamline.styled';
import { streamlineSelector } from './Streamline.selector';

const Hook = React.memo((props) => {
  const { title, desc, disabled = false } = props?.data;
  if (disabled) {
    return null;
  }
  return (
    <View style={styled.hook}>
      <Text style={styled.hookTitle}>{title}</Text>
      <Text style={styled.hookDesc}>{desc}</Text>
    </View>
  );
});

const Extra = React.memo(() => {
  const {
    handleDefragmentNativeCoin,
    handleNavigateWhyStreamline,
    accountBalance,
    hookFactories,
    shouldDisabledForm,
  } = useStreamLine();
  React.useEffect(() => {}, [accountBalance]);
  return (
    <>
      <View style={styled.tooltipContainer}>
        <Text style={styled.tooltip}>
          Consolidate your UTXOs to ensure successful transactions of any
          amount.
        </Text>
        <BtnQuestionDefault
          style={styled.questionIcon}
          icon={srcQuestion}
          onPress={handleNavigateWhyStreamline}
        />
      </View>
      <ButtonBasic
        btnStyle={styled.btnStyle}
        title="OK"
        onPress={handleDefragmentNativeCoin}
        disabled={shouldDisabledForm}
      />
      {hookFactories.map((item, id) => (
        <Hook data={item} key={id} />
      ))}
    </>
  );
});

const Empty = React.memo(() => {
  return (
    <Text style={styled.emptyText}>
      You’re already operating at peak efficiency. Go you!
    </Text>
  );
});

const Streamline = () => {
  const { hasExceededMaxInputPRV } = useStreamLine();
  const { isFetching } = useSelector(streamlineSelector);
  return (
    <View style={styled.container}>
      <Header title="Streamline" accountSelectable />
      <ScrollView style={styled.scrollview}>
        {hasExceededMaxInputPRV ? <Extra /> : <Empty />}
      </ScrollView>
      {isFetching && <LoadingTx />}
    </View>
  );
};

Streamline.propTypes = {};

export default withLayout_2(Streamline);
