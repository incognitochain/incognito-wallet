import AsyncStorage from '@react-native-community/async-storage';

const Storage = {
  setItem(key:string, value:string, callback:function) {
    console.debug('SET ITEM', key);
    return new Promise((resolve, reject) => {
      AsyncStorage.setItem(key, value, (err)=> {
        if (typeof callback === 'function') {
          callback(err);
        }
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  },
  getItem(key:string, callback:function) {
    console.debug('GET ITEM', key);
    return new Promise((resolve, reject) => {
      AsyncStorage.getItem(key, (err, rs)=> {
        if (typeof callback === 'function') {
          callback(err, rs);
        }
        if (err) {
          return reject(err);
        }
        return resolve(rs);
      });
    });
  },
  removeItem(key:string, callback:function) {
    console.debug('REMOVE ITEM', key);
    return new Promise((resolve, reject) => {
      AsyncStorage.removeItem(key, (err)=> {
        if (typeof callback === 'function') {
          callback(err);
        }
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  },
  clear(callback:function) {
    return new Promise((resolve, reject) => {
      AsyncStorage.clear((err)=> {
        if (typeof callback === 'function') {
          callback(err);
        }
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }
};

export default Storage;
