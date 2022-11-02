/* eslint-disable import/no-extraneous-dependencies */
import rootReducer from '@src/redux/reducers';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
import AsyncStorage from '@react-native-community/async-storage';
import { persistStore, persistReducer } from 'redux-persist';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import logger from 'redux-logger';
import { DEBUG } from '@src/utils/logger';

export default function configureStore(preloadedState) {
  const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
    whitelist: ['receivers'],
    blacklist: [
      'stakeHistory',
      'stake',
      'home',
      'unShield',
      'setting',
      'getStarted',
      'profile',
      'dev',
      'streamline',
      'txHistoryDetail',
      'node',
      'trade',
      'pDexV3',
    ],
    stateReconciler: autoMergeLevel2,
  };
  const persistedReducer = persistReducer(persistConfig, rootReducer);
  const _composedEnhancers = composeWithDevTools(
    DEBUG
      ? applyMiddleware(thunkMiddleware, logger)
      : applyMiddleware(thunkMiddleware),
  );
  const store = createStore(
    persistedReducer,
    preloadedState,
    _composedEnhancers,
  );
  const persistor = persistStore(store);
  if (__DEV__ && module.hot) {
    module.hot.accept('@src/redux/reducers', () => {
      const nextRootReducer = require('@src/redux/reducers').default;
      store.replaceReducer(persistReducer(persistConfig, nextRootReducer));
    });
  }

  return { store, persistor };
}
