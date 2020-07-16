import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { selectedPrivacySeleclor, sharedSeleclor } from '@src/redux/selectors';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

export const TokenContext = React.createContext();

const enhance = (WrappedComp) => (props) => {
  const { tokenId } = props;
  const token = useSelector(selectedPrivacySeleclor.getPrivacyDataByTokenID)(
    tokenId,
  );
  const gettingBalance = useSelector(sharedSeleclor.isGettingBalance);
  const isGettingBalance = gettingBalance.includes(tokenId);
  const tokenProps = {
    ...props,
    ...token,
    isGettingBalance,
    symbol: token?.externalSymbol || token?.symbol,
  };
  if (!token || !tokenId) {
    return null;
  }
  return (
    <ErrorBoundary>
      <TokenContext.Provider
        value={{
          tokenProps,
        }}
      >
        <WrappedComp {...tokenProps} />
      </TokenContext.Provider>
    </ErrorBoundary>
  );
};

enhance.defaultProps = {};

enhance.propTypes = {
  tokenId: PropTypes.number.isRequired,
};

export default enhance;
