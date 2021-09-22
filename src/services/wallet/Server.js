import storage from '@src/services/storage';
import _ from 'lodash';

export const MAINNET_FULLNODE = 'https://lb-fullnode.incognito.org/fullnode';
export const MAINNET_1_FULLNODE = 'http://51.83.237.20:9338';
export const TESTNET_FULLNODE = 'https://testnet.incognito.org/fullnode';
export const TESTNET1_FULLNODE = 'https://testnet1.incognito.org/fullnode';
export const DEV_TEST_FULLNODE = 'http://139.162.55.124:8334';
export const DEFAULT_SHARD_NUMBER = 8;

let cachedList = [];

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
  pubsubServices: 'https://api-coinservice.incognito.org/txservice',
  requestServices: 'https://api-coinservice.incognito.org/airdrop-service',
  apiServices: 'https://api-service.incognito.org',
  shardNumber: DEFAULT_SHARD_NUMBER,
  IncContractAddress: '0x43D037A562099A4C2c95b1E2120cc43054450629',
  IncBSCContractAddress: '0x43D037A562099A4C2c95b1E2120cc43054450629',
  explorer: 'https://incscan.io',
  portalServices: 'https://api-portalv4.incognito.org',
};
const BETA_SERVER = {
  id: 'beta',
  default: false,
  address: MAINNET_FULLNODE,
  username: '',
  password: '',
  name: 'Beta',
  coinServices: 'https://api-coinservice-beta.incognito.org',
  pubsubServices: 'https://api-coinservice-beta.incognito.org/txservice',
  requestServices: 'https://api-coinservice-beta.incognito.org/airdrop-service',
  apiServices: 'https://api-service.incognito.org',
  shardNumber: DEFAULT_SHARD_NUMBER,
  IncContractAddress: '0x43D037A562099A4C2c95b1E2120cc43054450629',
  IncBSCContractAddress: '0x43D037A562099A4C2c95b1E2120cc43054450629',
  explorer: 'https://incscan.io',
  portalServices: 'http://139.162.55.124:8010',
};
const TEST_NET_SERVER = {
  id: 'testnet',
  default: false,
  address: TESTNET_FULLNODE,
  username: '',
  password: '',
  name: 'Testnet',
  coinServices: 'https://api-coinservice-staging.incognito.org',
  pubsubServices: 'https://api-coinservice-staging.incognito.org/txservice',
  requestServices:
    'https://api-coinservice-staging.incognito.org/airdrop-service',
  apiServices: 'https://staging-api-service.incognito.org',
  shardNumber: DEFAULT_SHARD_NUMBER,
  IncContractAddress: '0x2f6F03F1b43Eab22f7952bd617A24AB46E970dF7',
  IncBSCContractAddress: '0x2f6F03F1b43Eab22f7952bd617A24AB46E970dF7',
  explorer: 'https://testnet.incognito.org',
  portalServices: 'https://api-portalv4-staging.incognito.org',
};
const LOCAL_SERVER = {
  id: 'local',
  default: false,
  address: 'http://localhost:9334',
  username: '',
  password: '',
  name: 'Local',
  portalServices: 'http://139.162.55.124:8010',
};
const TEST_NET_1_SERVER = {
  id: 'testnet1',
  default: false,
  address: TESTNET1_FULLNODE,
  username: '',
  password: '',
  name: 'Testnet 1',
  coinServices: 'https://api-coinservice-staging2.incognito.org',
  pubsubServices: 'https://api-coinservice-staging2.incognito.org/txservice',
  requestServices:
    'https://api-coinservice-staging2.incognito.org/airdrop-service',
  apiServices: 'https://privacyv2-api-service.incognito.org',
  shardNumber: DEFAULT_SHARD_NUMBER,
  IncContractAddress: '0xE0D5e7217c6C4bc475404b26d763fAD3F14D2b86',
  IncBSCContractAddress: '0x1ce57B254DC2DBB41e1aeA296Dc7dBD6fb549241',
  explorer: 'https://testnet1.incognito.org',
  portalServices: 'http://139.162.55.124:8010',
};
const DEV_TEST_SERVER = {
  id: 'devtest',
  default: false,
  address: DEV_TEST_FULLNODE,
  username: '',
  password: '',
  name: 'Dev test server',
  coinServices: 'http://51.161.119.66:9009',
  pubsubServices: 'http://51.161.119.66:8001',
  requestServices: 'http://51.161.119.66:5000',
  apiServices: 'https://privacyv2-api-service.incognito.org',
  shardNumber: 2,
  IncContractAddress: '0xE0D5e7217c6C4bc475404b26d763fAD3F14D2b86',
  IncBSCContractAddress: '0x1ce57B254DC2DBB41e1aeA296Dc7dBD6fb549241',
  explorer: 'https://testnet1.incognito.org',
  portalServices: 'http://139.162.55.124:8010',
};

const PORTAL_SERVER = {
  id: 'portal',
  default: false,
  address: 'http://192.168.146.58:9334',
  username: '',
  password: '',
  name: 'Portal',
  portalServices: 'http://192.168.146.58:8091',
  coinServices: 'https://api-coinservice-staging.incognito.org',
  pubsubServices: 'https://api-coinservice-staging.incognito.org/txservice',
  requestServices:
    'https://api-coinservice-staging.incognito.org/airdrop-service',
  apiServices: 'https://staging-api-service.incognito.org',
  shardNumber: DEFAULT_SHARD_NUMBER,
  IncContractAddress: '0x2f6F03F1b43Eab22f7952bd617A24AB46E970dF7',
  IncBSCContractAddress: '0x2f6F03F1b43Eab22f7952bd617A24AB46E970dF7',
  explorer: 'https://testnet.incognito.org',
};

const DEFAULT_LIST_SERVER = [
  LOCAL_SERVER,
  TEST_NET_SERVER,
  TEST_NODE_SERVER,
  MAIN_NET_SERVER,
  TEST_NET_1_SERVER,
  DEV_TEST_SERVER,
  BETA_SERVER,
  PORTAL_SERVER,
];

export const KEY = {
  SERVER: '$servers',
  DEFAULT_LIST_SERVER,
};

const combineCachedListWithDefaultList = (_cachedList) => {
  if (!_cachedList) return DEFAULT_LIST_SERVER;
  return DEFAULT_LIST_SERVER.map((server) => {
    const cachedServer = _cachedList.find((item) => item.id === server.id);
    return {
      ...server,
      default: cachedServer?.default,
    };
  });
};

export default class Server {
  static get() {
    if (cachedList.length > 0) {
      const servers = combineCachedListWithDefaultList(cachedList);
      return Promise.resolve(servers);
    }
    return storage.getItem(KEY.SERVER).then((strData) => {
      cachedList = combineCachedListWithDefaultList(JSON.parse(strData) || []);
      if (!cachedList || cachedList?.length === 0) {
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
              address: server?.address || '',
              coinServices: server?.coinServices || '',
              pubsubServices: server?.pubsubServices || '',
              requestServices: server?.requestServices || '',
              apiServices: server?.apiServices || '',
              shardNumber: server?.shardNumber || '',
              IncContractAddress: server?.IncContractAddress,
              IncBSCContractAddress: server?.IncContractAddress,
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
      await Server.set(newServers);
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
