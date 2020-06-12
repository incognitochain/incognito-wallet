import LoadingContainer from '@src/components/LoadingContainer';
import React from 'react';
import { getToken } from '@services/firebase';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';
import { useNavigationParam } from 'react-navigation-hooks';

const enhance = (WrappedComponent) => (props) => {
  const account = useNavigationParam('account');
  const title = account?.name ? `${account?.name}'s keys` : 'Your keys';
  const [state, setState] = React.useState({
    token: null,
  });
  const { token } = state;
  const loadDeviceToken = async () => {
    const token = await getToken();
    setState({ ...state, token });
  };
  React.useEffect(() => {
    loadDeviceToken();
  }, []);
  if (!account) {
    return <LoadingContainer />;
  }
  return <WrappedComponent {...{ ...props, account, token, title }} />;
};

export default compose(
  withLayout_2,
  enhance,
);
