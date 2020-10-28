import React, {useEffect, useState} from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import LocalDatabase from '@utils/LocalDatabase';
import Util from '@utils/Util';
import DeviceInfo from 'react-native-device-info';
import APIService from '@src/services/api/miner/APIService';
import _ from 'lodash';
import {formatNodeAccount} from '@screens/Node/Node.builder';
import {useDispatch} from 'react-redux';
import {actionUpdateListNodeDevice} from '@screens/Node/Node.actions';

const nodeSignInEnhance = WrappedComp => props => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    const user = await LocalDatabase.getUserInfo();
    if (_.isEmpty(user)) {
      setLoading(true);
      const deviceId = DeviceInfo.getUniqueId();
      const params = {
        email: deviceId + '@minerX.com',
        password: Util.hashCode(deviceId)
      };
      let response = await APIService.signUp(params);
      if (response?.status !== 1) {
        response = await APIService.signIn(params);
      }
      const { status, data } = response;
      const listDevice = (status === 1 && await formatNodeAccount(data)) || [];
      setLoading(false);
      dispatch(actionUpdateListNodeDevice({ listDevice }));
    }
  };

  useEffect( () => {
    onSignIn().then();
  }, []);

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          loading
        }}
      />
    </ErrorBoundary>
  );
};

export default nodeSignInEnhance;
