import React from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { TouchableOpacity } from '@src/components/core';
import { Row, ImageFastWrapper } from '@src/components';
import { FONT } from '@src/styles';
import { styles } from '@components/Token/Token.follow';
import { BtnInfo } from '@components/Button';
import { PRVIDSTR } from 'incognito-chain-web-js/build/wallet';
import { Name, NormalText, Symbol } from './Token';
import withToken1 from './Token.enhance1';

const styled = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  row: {
    alignItems: 'center',
  },
  row1: {
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'flex-start',
    marginBottom: 2,
  },
  name: {
    ...FONT.TEXT.incognitoP2,
  },
  symbol: {
    marginTop: 2,
    ...FONT.TEXT.incognitoH6,
  },
  icon: {
    width: 32,
    height: 32,
    marginRight: 14,
  },
});

const TokenTrade = (props) => {
  const {
    style,
    onPress,
    network,
    shortName,
    tokenId,
    iconUrl,
    colors,
    ...rest
  } = props;

  return (
    <TouchableOpacity
      style={[styled.container, { borderBottomColor: colors.grey8 }]}
      onPress={onPress}
    >
      <Row style={styled.row}>
        <ImageFastWrapper {...rest} uri={iconUrl} style={styled.icon} />
        <Row style={styled.row1}>
          <Row>
            <Symbol
              {...rest}
              styledSymbol={styled.symbol}
              visibleNetworkName={false}
            />
            <BtnInfo tokenId={tokenId} style={styles.btnInfo} version={2} />
          </Row>
          <Row>
            <Name
              {...rest}
              name={shortName}
              styledName={[styled.name, { color: colors.subText }]}
              shouldShowInfo={false}
              isVerified={false}
            />
            {!!network && tokenId !== PRVIDSTR && (
              <NormalText
                style={[
                  styles.networkLabel,
                  { backgroundColor: colors.background3, color: colors.grey1 },
                ]}
                text={network}
              />
            )}
          </Row>
        </Row>
      </Row>
    </TouchableOpacity>
  );
};

TokenTrade.defaultProps = {
  style: null,
  showBalance: false,
  rightTopExtra: null,
  shouldShowFollowed: false,
};
TokenTrade.propTypes = {
  onPress: PropTypes.func.isRequired,
  style: PropTypes.any,
  showBalance: PropTypes.bool,
  rightTopExtra: PropTypes.element,
  shouldShowFollowed: PropTypes.bool,
  network: PropTypes.string.isRequired,
  shortName: PropTypes.string.isRequired,
  tokenId: PropTypes.string.isRequired,
};

export default withToken1(React.memo(TokenTrade));
