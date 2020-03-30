import types from '@src/redux/types/uniswap';
import LocalDatabase from '@src/utils/LocalDatabase';

const initialState = {
  histories: [],
};

function updateHistory(history, histories = []) {
  for (let i = 0; i < histories.length; i++) {
    if (histories[i].id === history.id) {
      histories[i] = history;
    }
  }

  const newHistories = [...histories];
  LocalDatabase.saveUniswapHistory(newHistories);
  return newHistories;
}

function addHistory(history, histories = []) {
  const newHistories = [...histories, history];
  LocalDatabase.saveUniswapHistory(newHistories);
  return newHistories;
}

function deleteHistory(history, histories = []) {
  const newHistories = [...histories.filter(item => item.id !== history.id)];
  LocalDatabase.saveUniswapHistory(newHistories);
  return newHistories;
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
  case types.GET_HISTORIES:
    return {
      ...state,
      histories: action.payload,
    };
  case types.GET_HISTORY_STATUS:
    return {
      ...state,
      histories: updateHistory(action.payload, state.histories),
    };
  case types.ADD_HISTORY:
    return {
      ...state,
      histories: addHistory(action.payload, state.histories),
    };
  case types.UPDATE_HISTORY:
    return {
      ...state,
      histories: updateHistory(action.payload, state.histories),
    };
  case types.DELETE_HISTORY:
    return {
      ...state,
      histories: deleteHistory(action.payload, state.histories),
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
