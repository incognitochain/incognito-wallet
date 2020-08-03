import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useDispatch } from 'react-redux';
import { actionLoadAllBalance } from '@src/redux/actions/account';
import { COLORS } from '@src/styles';
import { Toast } from '@src/components/core';

const styled = StyleSheet.create({
  accountContainer: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    maxHeight: '50%',
    minHeight: '40%',
  },
});

const enhance = WrappedComp => props => {
  const dispatch = useDispatch();
  const fetchData = async () => {
    try {
      await dispatch(actionLoadAllBalance());
    } catch (error) {
      Toast.showError(
        'This seems to be taking longer than usual. Please try again later.',
      );
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <ErrorBoundary>
      <View style={styled.accountContainer}>
        <WrappedComp {...{ ...props, fetchData }} />
      </View>
    </ErrorBoundary>
  );
};

export default enhance;
