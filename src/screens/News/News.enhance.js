import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
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
  return (
    <ErrorBoundary>
      <WrappedComp {...{ ...props, handleFetchNews }} />
    </ErrorBoundary>
  );
};

export default enhance;
