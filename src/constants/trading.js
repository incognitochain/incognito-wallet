const PROTOCOLS = {
  OX: '0x',
  KYBER: 'Kyber',
  UNISWAP: 'Uniswap',
};

let KYBER_TRADE_ADDRESS = '';
let UNISWAP_TRADE_ADDRESS = '';

const setDAppAddresses = ({
  Kyber,
  Uniswap,
}) => {
  if (Kyber) {
    KYBER_TRADE_ADDRESS = Kyber;
  }

  if (Uniswap) {
    UNISWAP_TRADE_ADDRESS = Uniswap;
  }
};

const getDAppAddresses = () => {
  return {
    KYBER_TRADE_ADDRESS,
    UNISWAP_TRADE_ADDRESS
  };
};

export default {
  PROTOCOLS,
  setDAppAddresses,
  getDAppAddresses,
};
