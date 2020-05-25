import React from 'react';
import { DeleteIcon } from '@src/components/Icons';
import { COLORS } from '@src/styles';
import { StyleSheet } from 'react-native';
import Button from './Button';

const styled = StyleSheet.create({
  container: {
    backgroundColor: COLORS.red,
  },
});

const BtnDelete = props => (
  <Button
    {...{
      ...props,
      icon: <DeleteIcon />,
      title: 'Remove',
      styledContainer: styled.container,
    }}
  />
);

export default BtnDelete;
