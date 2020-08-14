import {
  ACTION_CREATE,
  ACTION_DELETE,
  ACTION_UPDATE,
  ACTION_UPDATE_RECENTLY,
  ACTION_DELETE_ALL,
  ACTION_SYNC_SUCCESS,
} from '@src/redux/actions/receivers';
import { isReceiverExist } from '@src/redux/utils/receivers';
import { CONSTANT_KEYS } from '@src/constants';

const initialState = {
  [CONSTANT_KEYS.REDUX_STATE_RECEIVERS_IN_NETWORK]: {
    receivers: [],
    sync: false,
  },
  [CONSTANT_KEYS.REDUX_STATE_RECEIVERS_OUT_NETWORK]: {
    receivers: [],
  },
};

export default (state = initialState, action) => {
  switch (action.type) {
  case ACTION_CREATE: {
    const { keySave, receiver, sync = false } = action.payload;
    const oldReceivers = state[keySave].receivers;
    const exist = isReceiverExist(oldReceivers, receiver);
    if (sync && exist) {
      return state;
    }
    if (exist) {
      throw new Error('User exist!');
    }
    return {
      ...state,
      [keySave]: {
        ...state[keySave],
        receivers: [
          ...oldReceivers,
          {
            ...receiver,
            createdAt: new Date().getTime(),
            updatedAt: null,
          },
        ],
      },
    };
  }
  case ACTION_UPDATE: {
    const { keySave, receiver } = action.payload;
    const oldReceivers = state[keySave].receivers;
    return {
      ...state,
      [keySave]: {
        ...state[keySave],
        receivers: [
          ...oldReceivers.map((item) =>
            item.address === receiver.address
              ? {
                ...item,
                name: receiver.name,
                updatedAt: new Date().getTime(),
                networkName: receiver?.networkName,
              }
              : item,
          ),
        ],
      },
    };
  }
  case ACTION_DELETE: {
    const { keySave, receiver } = action.payload;
    const { name, address } = receiver;
    const oldReceivers = state[keySave].receivers;
    const exist = isReceiverExist(oldReceivers, receiver);
    if (!exist) {
      throw Error('User is not exist! Can not delete');
    }
    return {
      ...state,
      [keySave]: {
        ...state[keySave],
        receivers: [
          ...oldReceivers.filter(
            (item) => item?.name !== name && item?.address !== address,
          ),
        ],
      },
    };
  }
  case ACTION_UPDATE_RECENTLY: {
    const { keySave, receiver } = action.payload;
    const oldReceivers = state[keySave].receivers;
    const exist = oldReceivers.some(
      (item) => item?.address === receiver.address,
    );
    if (!exist) {
      return state;
    }
    return {
      ...state,
      [keySave]: {
        ...state[keySave],
        receivers: [
          ...oldReceivers.map((item) =>
            item.address === receiver.address
              ? { ...item, recently: new Date().getTime() }
              : item,
          ),
        ],
      },
    };
  }
  case ACTION_DELETE_ALL: {
    const { keySave } = action.payload;
    return {
      ...state,
      [keySave]: {
        ...state[keySave],
        receivers: [],
      },
    };
  }
  case ACTION_SYNC_SUCCESS: {
    const keySave = action.payload;
    return {
      ...state,
      [keySave]: {
        ...state[keySave],
        sync: true,
      },
    };
  }
  default:
    return state;
  }
};
