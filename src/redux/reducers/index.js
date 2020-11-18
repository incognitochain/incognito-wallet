import { combineReducers } from 'redux';
import reduceReducers from 'reduce-reducers';
import { reducer as formReducer } from 'redux-form';
import { modalReducer } from '@src/components/Modal';
import shield from '@screens/Shield/Shield.reducer';
import estimateFee from '@components/EstimateFee/EstimateFee.reducer';
import home from '@screens/Home/Home.reducer';
import setting from '@screens/Setting/Setting.reducer';
import unShield from '@screens/UnShield/UnShield.reducer';
import getStarted from '@screens/GetStarted/GetStarted.reducer';
import performance from '@screens/Performance/Performance.reducer';
import navigation from '@screens/Navigation/Navigation.reducer';
import profile from '@screens/Profile/Profile.reducer';
import news from '@screens/News/News.reducer';
import dev from '@screens/Dev/Dev.reducer';
import streamline from '@screens/Streamline/Streamline.reducer';
import txHistoryDetail from '@screens/Wallet/features/TxHistoryDetail/TxHistoryDetail.reducer';
import node from '@src/screens/Node/Node.reducer';
import wallet from './wallet';
import account from './account';
import server from './server';
import token from './token';
import selectedPrivacy from './selectedPrivacy';
import app from './app';
import dex from './dex';
import pin from './pin';
import globalReducer from './globalReducer';
import receivers from './receivers';
import settings from './settings';

const rootReducer = reduceReducers(
  combineReducers({
    account,
    wallet,
    server,
    token,
    selectedPrivacy,
    app,
    dex,
    pin,
    form: formReducer,
    modal: modalReducer,
    receivers,
    settings,
    shield,
    estimateFee,
    home,
    setting,
    unShield,
    getStarted,
    performance,
    navigation,
    news,
    profile,
    dev,
    streamline,
    txHistoryDetail,
    node
  }),
  globalReducer,
);

export default rootReducer;
