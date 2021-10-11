import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { compose } from 'recompose';
import ErrorBoundary from '@src/components/ErrorBoundary';
import Wizard from '@screens/Wizard';
import { useSelector, useDispatch } from 'react-redux';
import { login } from '@src/services/auth';
import { ANALYTICS, CONSTANT_KEYS } from '@src/constants';
import { reloadWallet } from '@src/redux/actions/wallet';
import { getPTokenList, getInternalTokenList } from '@src/redux/actions/token';
import { loadPin } from '@src/redux/actions/pin';
import routeNames from '@src/router/routeNames';
import { CustomError, ErrorCode, ExHandler } from '@src/services/exception';
import serverService from '@src/services/wallet/Server';
import { actionInit as initNotification } from '@src/screens/Notification';
import { actionFetch as actionFetchHomeConfigs } from '@screens/Home/Home.actions';
import { useNavigation, useFocusEffect } from 'react-navigation-hooks';
import { useMigrate } from '@src/components/UseEffect/useMigrate';
import storageService from '@src/services/storage';
import { LoadingContainer, Text, View } from '@src/components/core';
import { actionFetch as actionFetchProfile } from '@screens/Profile';
import { KEYS } from '@src/constants/keys';
import { getFunctionConfigs } from '@services/api/misc';
import {
  loadAllMasterKeyAccounts,
  loadAllMasterKeys,
} from '@src/redux/actions/masterKey';
import { masterKeysSelector } from '@src/redux/selectors/masterKey';
import Welcome from '@screens/GetStarted/Welcome';
import withPin from '@components/pin.enhance';
import KeepAwake from 'react-native-keep-awake';
import { COLORS, FONT } from '@src/styles';
import { accountServices } from '@src/services/wallet';
import { actionLogEvent } from '@src/screens/Performance';
import { requestUpdateMetrics } from '@src/redux/actions/app';
import {
  wizardSelector,
  isFollowedDefaultPTokensSelector,
} from './GetStarted.selector';
import {
  actionToggleShowWizard,
  actionToggleFollowDefaultPTokens,
} from './GetStarted.actions';
import withDetectStatusNetwork from './GetStarted.enhanceNetwork';

const subStyled = StyleSheet.create({
  mainText: {
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 5,
    textAlign: 'center',
  },
  subText: {
    color: COLORS.colorGreyBold,
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 5,
    textAlign: 'center',
    marginTop: 5,
  },
});

const SubComponent = React.memo((props) => {
  const { isFetched, statusConfigs } = props;
  return (
    <LoadingContainer
      size="large"
      custom={
        isFetched && (
          <View>
            <Text style={{ ...subStyled.mainText, marginTop: 30 }}>
              This may take a couple of minutes.
            </Text>
            {statusConfigs === 'loading all master keys' && (
              <Text style={subStyled.mainText}>
                Please do not navigate away from the app.
              </Text>
            )}
            <Text style={subStyled.subText}>{`(${statusConfigs}...)`}</Text>
          </View>
        )
      }
    />
  );
});

const enhance = (WrappedComp) => (props) => {
  const [statusConfigs, setStatusConfigs] = React.useState('');
  const [loadMasterKeys, setLoadMasterKeys] = useState(false);
  const { isFetching, isFetched } = useSelector(wizardSelector);
  const pin = useSelector((state) => state?.pin?.pin);
  const isFollowedDefaultPTokensMainnet = useSelector(
    isFollowedDefaultPTokensSelector,
  );
  const masterKeys = useSelector(masterKeysSelector);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const initialState = {
    isInitialing: true,
    isCreating: false,
    errorMsg: null,
  };
  const [state, setState] = React.useState({
    ...initialState,
  });
  const { errorMsg, isInitialing, isCreating } = state;

  const handleMigrateWizard = async () => {
    try {
      if (!isFetching && isFetched) {
        return;
      }
      const isDisplayed = await storageService.getItem(
        CONSTANT_KEYS.DISPLAYED_WIZARD,
      );
      if (isDisplayed) {
        await dispatch(actionToggleShowWizard({ isFetched: !!isDisplayed }));
      }
    } catch (error) {
      console.debug(error);
    }
  };

  const handleMigrateFollowToken = async () => {
    try {
      if (isFollowedDefaultPTokensMainnet) {
        await dispatch(
          actionToggleFollowDefaultPTokens({
            keySave: KEYS.IS_FOLLOW_DEFAULT_PTOKENS,
          }),
        );
      }
    } catch (error) {
      console.debug(error);
    }
  };

  const getDataWillMigrate = async () => {
    try {
      await new Promise.all([
        handleMigrateWizard(),
        handleMigrateFollowToken(),
      ]);
    } catch (error) {
      console.debug(error);
    }
  };

  const { isFetching: isMigrating, isFetched: isMigrated } = useMigrate({
    getDataWillMigrate,
  });

  const getExistedWallet = async () => {
    try {
      const defaultAccountName = await accountServices.getDefaultAccountName();
      const wallet = await dispatch(reloadWallet(defaultAccountName));
      if (wallet) {
        return wallet;
      }
      return null;
    } catch (e) {
      throw new CustomError(ErrorCode.wallet_can_not_load_existed_wallet, {
        rawError: e,
      });
    }
  };

  const getErrorMsg = (error) => {
    const errorMessage = new ExHandler(
      error,
      'Something\'s not quite right. Please make sure you\'re connected to the internet.\n' +
        '\n' +
        'If your connection is strong but the app still won\'t load, please contact us at go@incognito.org.\n',
    )?.writeLog()?.message;
    return errorMessage;
  };

  const goHome = async () => {
    try {
      dispatch(initNotification());
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

  const initApp = async () => {
    let errorMessage = null;
    try {
      await setState({ ...initialState, isInitialing: true });
      const wallet = await getExistedWallet();
      await dispatch(
        actionLogEvent({
          desc: 'LOAD_WALLET',
        }),
      );
      await goHome({ wallet });
    } catch (e) {
      console.log('INIT APP ERROR', e);
      errorMessage = getErrorMsg(e);
    } finally {
      await setState({
        ...state,
        isInitialing: false,
        isCreating: false,
        errorMsg: errorMessage,
      });
      dispatch(requestUpdateMetrics(ANALYTICS.ANALYTIC_DATA_TYPE.OPEN_APP));
    }
  };

  const configsApp = async () => {
    try {
      await dispatch(
        actionLogEvent({
          restart: true,
          desc: 'CONFIGS_APP',
        }),
      );
      await setStatusConfigs('loading pin');
      await dispatch(loadPin());
      await dispatch(
        actionLogEvent({
          desc: 'LOAD_PIN',
        }),
      );
      await setStatusConfigs('getting info');
      await login();
      await dispatch(
        actionLogEvent({
          desc: 'LOGIN',
        }),
      );
      await setStatusConfigs('getting configs');
      const [servers] = await new Promise.all([
        serverService.get(),
        getFunctionConfigs().catch((e) => e),
        dispatch(actionFetchHomeConfigs()),
        dispatch(getPTokenList()),
        dispatch(getInternalTokenList()),
        dispatch(actionFetchProfile()),
      ]);
      if (!servers || servers?.length === 0) {
        await serverService.setDefaultList();
      }
      await dispatch(
        actionLogEvent({
          desc: 'CONFIGS',
        }),
      );
      await setStatusConfigs('loading all master keys');
      await dispatch(loadAllMasterKeys());
      await dispatch(
        actionLogEvent({
          desc: 'LOAD_ALL_MASTER_KEYS',
        }),
      );
      await setStatusConfigs('loading all master keys keychain');
      await dispatch(loadAllMasterKeyAccounts());
      await dispatch(
        actionLogEvent({
          desc: 'LOAD_ALL_MASTER_KEYS_ACCOUNTS',
        }),
      );
    } catch (error) {
      console.log('CONFIGS APP ERROR', error);
      await setState({
        ...state,
        errorMsg: getErrorMsg(error),
      });
      throw error;
    }
    setLoadMasterKeys(true);
  };

  const onRetry = async () => {
    try {
      await configsApp();
      await initApp();
    } catch {
      //
    }
  };

  React.useEffect(() => {
    requestAnimationFrame(async () => {
      await configsApp();
    });
  }, []);

  React.useEffect(() => {
    if (!masterKeys || !loadMasterKeys || isFetching) {
      return;
    }
    if (masterKeys.length) {
      initApp();
    }
  }, [masterKeys, loadMasterKeys, isFetching]);

  useFocusEffect(
    React.useCallback(() => {
      if (
        masterKeys?.length > 0 &&
        !isInitialing && //init app success
        !isCreating && //created wallet
        isMigrated && //migrate old data success
        isFetched && //finish splash screen
        !errorMsg //no error
      ) {
        navigation.navigate(routeNames.HomePDexV3);
      }
    }, [masterKeys, isInitialing, isCreating, isMigrated, isFetched, errorMsg]),
  );

  useEffect(() => {
    if (pin) {
      navigation.navigate(routeNames.AddPin, {
        action: 'login',
      });
    }
  }, [pin]);

  const renderMain = () => {
    if (isFetching) {
      return <Wizard />;
    }
    if (!errorMsg) {
      if (isMigrating || !loadMasterKeys) {
        return <SubComponent {...{ isFetched, statusConfigs }} />;
      }
      if (masterKeys.length === 0) {
        return <Welcome />;
      }
    }
    return (
      <WrappedComp
        {...{ ...props, errorMsg, isInitialing, isCreating, onRetry }}
      />
    );
  };

  return (
    <ErrorBoundary>
      {renderMain()}
      <KeepAwake />
    </ErrorBoundary>
  );
};

export default compose(
  withDetectStatusNetwork,
  withPin,
  enhance,
);
