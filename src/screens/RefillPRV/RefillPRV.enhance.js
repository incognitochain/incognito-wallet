import React from 'react';
import { compose } from 'recompose';

const enhance = (WrappedComp) => (props) => {
  return (
    <WrappedComp {...{ ...props}} />
  );
};

export default compose(enhance);
