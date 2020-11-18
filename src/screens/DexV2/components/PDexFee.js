import React, { memo, useMemo } from 'react';
import { View } from 'react-native';
import PropTypes from 'prop-types';
import ExtraInfo from '@screens/DexV2/components/ExtraInfo';
import styles from '@screens/DexV2/components/Trade/style';
import { Text } from '@components/core';
import stylesheet from '@screens/DexV2/components/ExtraInfo/style';
import Help from '@components/Help';
import format from '@utils/format';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import helperConst  from '@src/constants/helper';

const PDexFee = ({
  isErc20,
  feeToken,
  quote,
  fee,
  leftStyle
}) => {
  const navigation = useNavigation();

  const pDexFee = useMemo(() => {
    let pDexFee = fee;
    if (isErc20 && quote?.erc20Fee) {
      pDexFee += quote?.erc20Fee;
    }
    return pDexFee;
  }, [fee, quote, isErc20]);

  const onHelpPress = () => {
    navigation.navigate(routeNames.Helper, helperConst.HELPER_CONSTANT.FEE);
  };

  const renderFee = () => (
    <>
      <ExtraInfo
        token={feeToken}
        left={(
          <View style={styles.row}>
            <Text style={[stylesheet.text, stylesheet.textLeft, leftStyle]}>Fee</Text>
            <Help onPress={onHelpPress} />
          </View>
        )}
        right={`${format.amount(pDexFee, feeToken.pDecimals)} ${
          feeToken.symbol
        }`}
        style={styles.extra}
      />
    </>
  );

  return (
    <View>
      { renderFee() }
    </View>
  );
};

PDexFee.propTypes = {
  isErc20: PropTypes.bool,
  feeToken: PropTypes.object.isRequired,
  quote: PropTypes.object,
  fee: PropTypes.number.isRequired,
  leftStyle: PropTypes.object.isRequired
};


PDexFee.defaultProps = {
  quote: null,
  isErc20: false,
};


export default memo(PDexFee);