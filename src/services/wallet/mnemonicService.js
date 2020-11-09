import { MnemonicGenerator } from 'incognito-chain-web-js/build/wallet';

const generator = new MnemonicGenerator();

export const generateNewMnemonic = () => {
  const entropy = generator.newEntropy(128);
  return generator.newMnemonic(entropy);
};
