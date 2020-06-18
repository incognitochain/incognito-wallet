import {
  ACTION_CREATE,
  ACTION_SYNC_SUCCESS,
  ACTION_DELETE,
  ACTION_UPDATE,
} from './AddressBook.constant';
import { isExist, isExistByField } from './AddressBook.utils';

const initialState = {
  sync: false,
  migrate: false,
  data: {},
};

const addressBookReducer = (state = initialState, action) => {
  switch (action.type) {
  case ACTION_CREATE: {
    const { data } = state;
    const { address, name } = action.payload;
    const id = address;
    const exist = isExist({ address, name, id }, data);
    if (exist) {
      throw new Error('Address book is exist!');
    }
    return {
      ...state,
      data: {
        ...data,
        [id]: {
          ...action.payload,
          createdAt: new Date().getTime(),
          updatedAt: null,
          id,
        },
      },
    };
  }
  case ACTION_SYNC_SUCCESS: {
    return {
      ...state,
      sync: true,
    };
  }
  case ACTION_DELETE: {
    const id = action.payload;
    const { data } = state;
    const exist = !!data[id];
    if (!exist) {
      throw new Error('Address book is not exist! Can not delete');
    }
    return {
      ...state,
      data: {
        ...Object.keys(data).reduce((obj, key) => {
          if (key !== id) {
            obj[key] = data[key];
          }
          return obj;
        }, {}),
      },
    };
  }
  case ACTION_UPDATE: {
    const { id, name } = action.payload;
    const { data } = state;
    const exist = !!data[id];
    const duplicateName = isExistByField('name', name, data);
    if (!exist) {
      throw new Error('Address book is not exist! Can not edit');
    }
    if (duplicateName) {
      throw new Error('Address book is exist! Can not edit');
    }
    return {
      ...state,
      data: {
        ...data,
        [id]: {
          ...data[id],
          ...action.payload,
          updatedAt: new Date().getTime(),
        },
      },
    };
  }
  default:
    return state;
  }
};

export default addressBookReducer;
