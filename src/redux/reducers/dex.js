import types from '@src/redux/types/dex';
import LocalDatabase from '@src/utils/LocalDatabase';

const initialState = {
  histories: [],
};

function updateHistory(history, histories = [], walletName) {
  for (let i = 0; i < histories.length; i++) {
    if (histories[i].txId === history.txId) {
      histories[i] = history;
    }
  }

  const newHistories = [...histories];
  LocalDatabase.saveDexHistory(newHistories, walletName);
  return newHistories;
}

function addHistory(history, histories = [], walletName) {
  const newHistories = [...histories, history];
  LocalDatabase.saveDexHistory(newHistories, walletName);
  return newHistories;
}

function deleteHistory(history, histories = [], walletName) {
  const newHistories = [...histories.filter(item => item.txId !== history.txId)];
  LocalDatabase.saveDexHistory(newHistories, walletName);
  return newHistories;
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
  case types.GET_HISTORIES:
    return {
      ...state,
      histories: action.payload,
      walletName: action.extra,
    };
  case types.GET_HISTORY_STATUS:
    return {
      ...state,
      histories: updateHistory(action.payload, state.histories, state.walletName),
    };
  case types.ADD_HISTORY:
    return {
      ...state,
      histories: addHistory(action.payload, state.histories, state.walletName),
    };
  case types.UPDATE_HISTORY:
    return {
      ...state,
      histories: updateHistory(action.payload, state.histories, state.walletName),
    };
  case types.DELETE_HISTORY:
    return {
      ...state,
      histories: deleteHistory(action.payload, state.histories, state.walletName),
    };
  case types.UPDATE_PAIRS:
    return {
      ...state,
      pairs: action.payload,
    };
  default:
    return state;
  }
};

export default reducer;
