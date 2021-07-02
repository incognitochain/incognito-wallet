import { Portal } from 'incognito-chain-web-js/build/wallet';
import config from '@src/constants/config';

class PortalService {
  constructor(chainName) {
    this.Portal = new Portal(chainName);
  }

  static isPortalToken(tokenID) {
    return Portal.isPortalToken(tokenID);
  }

  async generateBTCShieldingAddress(incAddress) {
    return this.Portal.generateBTCMultisigAddress(incAddress);
  }
}

const chainName = config.isMainnet ? 'mainnet' : 'testnet';
const portalService = new PortalService(chainName);

export {
  PortalService,
  portalService,
};



