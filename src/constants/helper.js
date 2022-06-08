const HELPER_CONSTANT = {
  FEE: {
    title: 'Fee',
    contents: [
      {
        content:
          'By default, Incognito charges only network fees. If you have chosen to boost your trade, the priority fee will also be reflected here. Note that Uniswap and Kyber pools will also incur cross-chain fees.',
      },
    ],
  },
  NETWORK: {
    title: 'Pool',
    contents: [
      {
        content:
          'The best pool for this trade, taking into account prices and fees from Uniswap, Kyber and Incognito.',
      },
    ],
  },
  MAX_PRICE: {
    title: 'Max price',
    contents: [
      {
        content:
          'This is the maximum price you are willing to accept for this trade.\n' +
          '\n' +
          'It takes into account 1% slippage tolerance, which covers the potential price variance between the time of trade request and the time of execution. Your trade will go through at this price or better.',
      },
    ],
  },
  PRICE_IMPACT: {
    title: 'Size impact',
    contents: [
      {
        content:
          'This is the difference between the current price and your estimated trade price, based on current and subsequent pool ratios.' +
          '\n\n' +
          'Size impact is determined by the size of your trade in relation to the balance of liquidity available. Bigger trades have larger size impacts.',
      },
    ],
  },
  WARNING: {
    title: 'Warning',
    contents: [
      {
        content:
          'Do note that due to trade size, the price of this trade varies significantly from market price.',
      },
    ],
  },
  SLIPPAGE: {
    title: 'Slippage tolerance',
    contents: [
      {
        content:
          'Prices may fluctuate in the time between trade request and execution. Adjust your slippage tolerance to set the variance you are willing to accept.',
      },
    ],
  },
  PRIORITY: {
    title: 'Priority',
    contents: [
      {
        content:
          'Here you can choose to prioritize your trade for an extra fee. Doing so will increase the speed of execution and your likelihood of getting a better rate. If you choose to prioritize your trade, you will see your updated fee under Trade details.',
      },
      {
        subTitle: 'More on fees',
        content:
          'By default, Incognito doesn’t charge any trading fees for normal trades. The only fee incurred is the Incognito network fee, paid to validators for verifying transactions. If you are utilizing a Uniswap or Kyber pool, cross-chain fees will also apply.',
      },
    ],
  },
  AMP: {
    title: 'AMP',
    contents: [
      {
        content:
          'Here you can choose to prioritize your trade for an extra fee. Doing so will increase the speed of execution and your likelihood of getting a better rate. If you choose to prioritize your trade, you will see your updated fee under Trade details.',
      },
      {
        subTitle: 'More on fees',
        content:
          'By default, Incognito doesn’t charge any trading fees for normal trades. The only fee incurred is the Incognito network fee, paid to validators for verifying transactions. If you are utilizing a Uniswap or Kyber pool, cross-chain fees will also apply.',
      },
    ],
  },
  PROVIDE: {
    title: 'Provide Terms & Info',
    contents: [
      {
        content:
          'Locked PRV terms are calculated with APR. These rates are guaranteed for the duration of the term. Reward amounts are calculated directly after providing and do not compound. Initial provision and rewards will become available at the end of the term and automatically moved to an unlocked term.' +
          '\n\n' +
          'All other terms are calculated with APY. Rewards compound at the initial provision rate. APY rates are not guaranteed and are subject to change without notice.',
      },
    ],
  },
  LIQUIDITY_APR: {
    title: 'Verified pools',
    contents: [
      {
        subTitle: 'Join a pool and earn rewards',
        content:
          'The real-time APR represents current earnings taken from the trading fees of a pair and liquidity mining rewards from DAO. A liquidity pool consists of a pair of 2 tradable currencies. To join a pool, both sides of the pair must be contributed, at a rate determined by the current trading price. Simply tap on the listed pair to contribute.',
      },
      {
        subTitle: 'How APR is paid out',
        content:
          'Rewards are paid out every block (~40s). They do not compound, and can be withdrawn at any time from the rewards tab. Rewards are paid in PRV and the currencies of the pair.',
      },
      {
        subTitle: 'How APR is calculated',
        content:
          'APR adapts in real-time based on 2 factors – liquidity and trading volume of a particular pool. The formula for determining APR is trading fees earned over 1 year (extrapolated from the last 7 days), divided by current pool liquidity. APR does not take into account any impermanent loss.',
      },
      {
        subTitle: 'Can’t find a pool?',
        content:
          'The liquidity pools listed in this tab are manually verified to avoid scam tokens. Pools not on this list yet may simply be new. Please reach out to us at we.incognito.org/g/support to request verification.',
      },
    ],
  },
};

export default { HELPER_CONSTANT };
