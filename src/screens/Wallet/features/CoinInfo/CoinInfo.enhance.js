import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { getTokenInfo } from '@src/services/api/token';
import { useSelector } from 'react-redux';
import { selectedPrivacySeleclor } from '@src/redux/selectors';
import { compose } from 'recompose';
import { withLayout_2 } from '@src/components/Layout';
import { useNavigation } from 'react-navigation-hooks';
import format from '@src/utils/format';
import { CONSTANT_CONFIGS, CONSTANT_COMMONS } from '@src/constants';
import routeNames from '@src/router/routeNames';

const enhance = (WrappedComp) => (props) => {
  const [state, setState] = React.useState({
    info: null,
  });
  const { info } = state;
  const navigation = useNavigation();
  const selectedPrivacy = useSelector(selectedPrivacySeleclor.selectedPrivacy);
  const {
    tokenId,
    isVerified,
    isBep2Token,
    contractId,
    amount,
    pDecimals,
    incognitoTotalSupply,
    networkName,
    externalSymbol,
    symbol,
  } = selectedPrivacy;
  const getNetworkName = () => {
    if (selectedPrivacy?.isErc20Token) {
      return 'Ethereum network (ERC20)';
    }
    if (selectedPrivacy?.isBep2Token) {
      return 'Binance network (BEP2)';
    }
    if (externalSymbol === CONSTANT_COMMONS.CRYPTO_SYMBOL.BNB) {
      return 'Binance network';
    }
    return `${networkName} network`;
  };
  const infosFactories = [
    {
      label: 'Balance',
      value: format.amount(amount, pDecimals),
    },
    {
      label: 'Origin',
      value: getNetworkName(),
    },
    {
      label: 'Original Ticker',
      value: externalSymbol || symbol,
      link:
        isBep2Token &&
        `${CONSTANT_CONFIGS.BINANCE_EXPLORER_URL}/asset/${externalSymbol}`,
    },

    {
      label: 'Coin ID',
      value: tokenId,
      copyable: true,
    },
    {
      label: 'Contract ID',
      value: contractId,
      link: `${CONSTANT_CONFIGS.ETHERSCAN_URL}/token/${contractId}`,
    },
    {
      label: 'Coin supply',
      value: incognitoTotalSupply
        ? format.amount(incognitoTotalSupply, pDecimals)
        : null,
    },
    {
      label: 'Owner name',
      value: info?.ownerName,
      copyable: true,
    },
    {
      label: 'Owner address',
      value: info?.ownerAddress,
      copyable: true,
    },
    { label: 'Owner email', value: info?.ownerEmail, copyable: true },
    {
      label: 'Owner website',
      value: info?.ownerWebsite,
      link: info?.ownerWebsite,
    },
  ];
  const handleGetIncognitoTokenInfo = async () => {
    if (!tokenId) return;
    try {
      const infoData = await getTokenInfo({ tokenId });
      await setState({ ...state, info: infoData });
    } catch (e) {
      console.log(e);
    }
  };
  const handlePressVerifiedInfo = () =>
    navigation.navigate(routeNames.CoinInfoVerify);
  React.useEffect(() => {
    handleGetIncognitoTokenInfo();
  }, [tokenId]);
  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          infosFactories,
          handlePressVerifiedInfo,
          tokenId,
          isVerified,
        }}
      />
    </ErrorBoundary>
  );
};

export default compose(
  withLayout_2,
  enhance,
);
