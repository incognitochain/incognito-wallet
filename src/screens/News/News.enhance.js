import React, { useCallback } from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { useFocusEffect } from 'react-navigation-hooks';
import { useDispatch } from 'react-redux';
import { actionFetchNews } from './News.actions';

const enhance = (WrappedComp) => (props) => {
  const dispatch = useDispatch();
  const handleFetchNews = async () => {
    try {
      dispatch(actionFetchNews());
    } catch (error) {
      console.log(error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      handleFetchNews();
    }, []),
  );
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, handleFetchNews }} />
    </ErrorBoundary>
  );
};

export default enhance;
