import storage from '@src/services/storage';
import _ from 'lodash';

export const MAINNET_FULLNODE = 'https://lb-fullnode.incognito.org/fullnode';
export const MAINNET_1_FULLNODE = 'http://51.83.237.20:9338';
export const TESTNET_FULLNODE = 'https://testnet.incognito.org/fullnode';
export const TESTNET1_FULLNODE = 'http://51.83.36.184:20002/fullnode';
export const DEV_TEST_FULLNODE = 'http://139.162.55.124:8334';

let cachedList = null;

const TEST_NODE_SERVER = {
  id: 'testnode',
  default: false,
  address: 'http://51.161.117.88:6354',
  username: '',
  password: '',
  name: 'Test Node',
};
const MAIN_NET_SERVER = {
  id: 'mainnet',
  default: true,
  address: MAINNET_FULLNODE,
  username: '',
  password: '',
  name: 'Mainnet',
  coinServices: 'https://api-coinservice.incognito.org',
};
const TEST_NET_SERVER = {
  id: 'testnet',
  default: false,
  address: TESTNET_FULLNODE,
  username: '',
  password: '',
  name: 'Testnet',
  coinServices: 'https://api-coinservice-staging.incognito.org',
};
const LOCAL_SERVER = {
  id: 'local',
  default: false,
  address: 'http://localhost:9334',
  username: '',
  password: '',
  name: 'Local',
};
const TEST_NET_1_SERVER = {
  id: 'testnet1',
  default: false,
  address: TESTNET1_FULLNODE,
  username: '',
  password: '',
  name: 'Testnet 1',
};
const DEV_TEST_SERVER = {
  id: 'devtest',
  default: false,
  address: DEV_TEST_FULLNODE,
  username: '',
  password: '',
  name: 'Dev test server',
  coinServices: 'http://51.161.119.66:9009',
  pubsubServices: 'http://51.161.119.66:8001'
};

const DEFAULT_LIST_SERVER = [
  LOCAL_SERVER,
  TEST_NET_SERVER,
  TEST_NODE_SERVER,
  MAIN_NET_SERVER,
  TEST_NET_1_SERVER,
  DEV_TEST_SERVER,
];

export const KEY = {
  SERVER: '$servers',
  DEFAULT_LIST_SERVER,
};

export default class Server {
  static get() {
    if (cachedList) {
      return Promise.resolve(cachedList);
    }
    return storage.getItem(KEY.SERVER).then((strData) => {
      cachedList = JSON.parse(strData) || [];
      if (!cachedList || cachedList.length === 0) {
        return DEFAULT_LIST_SERVER;
      }

      if (!cachedList.find((item) => item.id === DEV_TEST_SERVER.id)) {
        cachedList.push(DEV_TEST_SERVER);
      }
      if (!cachedList.find((item) => item.id === TEST_NODE_SERVER.id)) {
        cachedList.push(TEST_NODE_SERVER);
      }
      if (!cachedList.find((item) => item.id === TEST_NET_1_SERVER.id)) {
        cachedList.push(TEST_NET_1_SERVER);
      }
      if (
        cachedList.find(
          (item) =>
            item.id === TEST_NODE_SERVER.id && !item.address.includes('http'),
        )
      ) {
        const item = cachedList.find((item) => item.id === TEST_NODE_SERVER.id);
        item.address = TEST_NODE_SERVER.address;
      }

      storage.setItem(KEY.SERVER, JSON.stringify(cachedList));
      return cachedList;
    });
  }

  static getDefault() {
    return Server.get().then((result) => {
      if (result && result.length) {
        for (const s of result) {
          if (s.default) {
            const id = s?.id;
            const server = DEFAULT_LIST_SERVER.find((item) => item?.id === id);
            return {
              ...s,
              coinServices: server?.coinServices,
              pubsubServices: server?.pubsubServices
            };
          }
        }
      }
      this.setDefault(MAIN_NET_SERVER);
      return MAIN_NET_SERVER;
    });
  }

  static async getDefaultIfNullGettingDefaulList() {
    const list =
      (await Server.get().catch(console.log)) || KEY.DEFAULT_LIST_SERVER;
    return list?.find((_) => _.default);
  }

  static async setDefault(defaultServer) {
    try {
      const servers = await Server.get();
      const newServers = servers.map((server) => {
        if (defaultServer.id === server.id) {
          return {
            ...defaultServer,
            default: true,
          };
        }
        return { ...server, default: false };
      });
      Server.set(newServers);

      return newServers;
    } catch (e) {
      throw e;
    }
  }

  static isMainnet(network): Boolean {
    return _.isEqual(network?.id, 'mainnet');
  }

  static setDefaultList() {
    try {
      cachedList = KEY.DEFAULT_LIST_SERVER;
      const strData = JSON.stringify(cachedList);
      return storage.setItem(KEY.SERVER, strData);
    } catch (e) {
      throw e;
    }
  }

  static set(servers) {
    cachedList = servers;
    const strData = JSON.stringify(cachedList);
    return storage.setItem(KEY.SERVER, strData);
  }
}
