import React from 'react';
import { listAccountSelector } from '@src/redux/selectors/account';
import { useSelector, useDispatch } from 'react-redux';
import { ExHandler } from '@src/services/exception';
import { actionCreate, actionSyncSuccess } from '@src/redux/actions/receivers';
import LoadingContainer from '@src/components/LoadingContainer';
import { CONSTANT_KEYS } from '@src/constants';
import { receiversSelector } from '@src/redux/selectors/receivers';
import { searchBoxConfig } from '@src/components/Header/Header.searchBox';
import { reset } from 'redux-form';

const enhance = (WrappedComp) => (props) => {
  const [state, setState] = React.useState({
    isFetching: false,
    isFetched: false,
  });
  const dispatch = useDispatch();
  const accounts = useSelector(listAccountSelector);
  const keySave = CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK;
  const { sync = false } = useSelector(receiversSelector)[keySave];
  const syncData = async () => {
    try {
      const isAccListEmpty = accounts.length === 0;
      if (!isAccListEmpty) {
        await Promise.all(
          accounts.map(
            async (account) =>
              await dispatch(
                actionCreate({
                  keySave,
                  receiver: {
                    name: account?.name,
                    address: account?.PaymentAddress,
                    recently: null,
                  },
                  sync: true,
                }),
              ),
          ),
        );
        await dispatch(actionSyncSuccess(keySave));
      }
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const syncReceivers = async () => {
    try {
      await setState({
        ...state,
        isFetching: true,
      });
      await syncData();
      await setState({ ...state, isFetched: true, isFetching: false });
    } catch (error) {
      await setState({
        ...state,
        isFetching: false,
        isFetched: false,
      });
      new ExHandler(error).showErrorToast();
    }
  };

  React.useEffect(() => {
    dispatch(reset(searchBoxConfig.form));
    if (!sync) {
      syncReceivers();
    }
  }, [accounts]);

  const { isFetched } = state;
  if (!sync && !isFetched) {
    return <LoadingContainer />;
  }
  return <WrappedComp {...props} />;
};

export default enhance;
