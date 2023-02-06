import { Button, Text, Toast, View } from '@src/components/core';
import { MAX_FEE_PER_TX } from '@src/components/EstimateFee/EstimateFee.utils';
import FullScreenLoading from '@src/components/FullScreenLoading';
import Header from '@src/components/Header';
import { withLayout_2 } from '@src/components/Layout';
import LoadingTx from '@src/components/LoadingTx';
import { COINS } from '@src/constants';
import Device from '@src/models/device';
import { defaultAccountSelector } from '@src/redux/selectors/account';
import format from '@utils/format';
import { walletSelector } from '@src/redux/selectors/wallet';
import routeNames from '@src/router/routeNames';
import { ExHandler } from '@src/services/exception';
import accountService from '@src/services/wallet/accountService';
import LocalDatabase from '@src/utils/LocalDatabase';
import {
  ACCOUNT_CONSTANT,
  PrivacyVersion,
} from 'incognito-chain-web-js/build/wallet';
import { TextInput } from '@src/components/Input';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { Overlay } from 'react-native-elements';
import { useNavigation } from 'react-navigation-hooks';
import { useSelector } from 'react-redux';
import { compose } from 'redux';
import { COLORS } from '@src/styles';
import { TextStyle, ViewStyle } from 'react-native';

const fee = MAX_FEE_PER_TX;
const amount = ACCOUNT_CONSTANT.StakingAmount;

const StakeConfirm: React.FC = (props: any) => {
  const { params } = props?.navigation?.state;

  const navigation = useNavigation();

  const { type, account } = params;

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [prvBalance, setPrvBalance] = useState<number>(0);

  const wallet: any = useSelector(walletSelector);

  const [stakeAmount, setStakeAmount] = useState<any>(
    type === 'stake_shard' ? 1750 : '',
  );

  const getPrvBalance = async () => {
    const prvBalance = await accountService.getBalance({
      account,
      wallet,
      tokenID: COINS.PRV_ID,
      version: PrivacyVersion?.ver2,
    });
    setPrvBalance(prvBalance);
  };

  useEffect(() => {
    getPrvBalance();
  }, []);

  const handleStake = async () => {
    try {
      setIsLoading(true);
      const stakingType = type === 'stake_shard' ? 0 : 1;

      const rs = await accountService.createAndSendStakingTx({
        account,
        wallet: account.Wallet,
        fee: MAX_FEE_PER_TX,
        stakeAmount,
        stakingType
      });
      console.log('result', rs);
      handleStakeSuccess(rs);
    } catch (e) {
      new ExHandler(e).showErrorToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnStake = async () => {
    if (isLoading) {
      return;
    }
    try {
      setIsLoading(true);
      const name = account.AccountName;
      const rs = await accountService.createAndSendStopAutoStakingTx({
        account,
        wallet: account.Wallet,
        fee,
      });
      console.log('res', rs);
      const listDevice: any = (
        (await LocalDatabase.getListDevices()) || []
      ).map((device) => Device.getInstance(device));
      await LocalDatabase.saveListDevices(listDevice);
      const deviceIndex = listDevice.findIndex((item) =>
        _.isEqual(item.AccountName, name),
      );
      listDevice[deviceIndex].SelfUnstakeTx = rs.txId;
      await LocalDatabase.saveListDevices(listDevice);
      Toast.showInfo('Unstaking complete.');
    } catch (e) {
      new ExHandler(e).showErrorToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStakeSuccess = async (rs) => {
    const name = account.AccountName;
    const listDevice: any = ((await LocalDatabase.getListDevices()) || []).map(
      (device) => Device.getInstance(device),
    );
    const deviceIndex = listDevice.findIndex((item) =>
      _.isEqual(item.AccountName, name),
    );
    listDevice[deviceIndex].SelfStakeTx = rs.txId;
    await LocalDatabase.saveListDevices(listDevice);
    Toast.showInfo('You staked successfully.');
    navigation.navigate(routeNames.Node, {
      refresh: new Date().getTime(),
    });
  };

  const onPressButtonConfirm = () => {
    if (type === 'stake_shard' || type === 'stake_beacon') {
      return handleStake();
    } else {
      return handleUnStake();
    }
  };

  const validateAmount = () => {
    // if(amount > prvBalance)
  };
  // get route params
  return (
    <View style={{ flex: 1 }}>
      <Header title="Stake confirm" />
      <View style={{ flex: 1, padding: 16 }}>
        {type === 'stake_beacon' && (
          <TextInput
            label="Stake amount"
            value={stakeAmount}
            onChange={(value) => setStakeAmount(value)}
            style={{
              width: '100%',
              height: 40,
              borderBottomWidth: 1,
              borderColor: COLORS.lightGrey17,
            }}
            placeholder="0.0"
            containerStyled={{ marginTop: 16, flex: 0 }}
          />
        )}
        <View style={itemContainerStyle}>
          <Text style={labelTextStyle}>Staking type:</Text>
          <Text style={valueTextStyle}>
            {type === 'stake_shard' ? 'Shard' : 'Beacon'}
          </Text>
        </View>
        {type === 'stake_shard' && (
          <View style={itemContainerStyle}>
            <Text style={labelTextStyle}>Amount:</Text>
            <Text style={valueTextStyle}>{stakeAmount} PRV</Text>
          </View>
        )}
        <View style={itemContainerStyle}>
          <Text style={labelTextStyle}>Account:</Text>
          <Text style={valueTextStyle}>{account?.AccountName}</Text>
        </View>
        <View style={itemContainerStyle}>
          <Text numberOfLines={1} ellipsizeMode="middle" style={labelTextStyle}>
            ValidatorPubkey:
          </Text>
          <Text numberOfLines={1} ellipsizeMode="middle" style={valueTextStyle}>
            {account?.BLSPublicKey}
          </Text>
        </View>
        <View style={itemContainerStyle}>
          <Text style={labelTextStyle}>Balance:</Text>
          <Text style={valueTextStyle}>
            {format.amountVer2(prvBalance, 9)} PRV
          </Text>
        </View>
      </View>

      <Button
        title="Confirm"
        style={{ margin: 16 }}
        onPress={onPressButtonConfirm}
      />
      {isLoading && <LoadingTx />}
    </View>
  );
};

export default compose(withLayout_2)(React.memo(StakeConfirm));

const itemContainerStyle: ViewStyle = {
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: 16,
};

const labelTextStyle: TextStyle = {
  flex: 1,
};

const valueTextStyle: TextStyle = {
  flex: 2,
  marginLeft: 16,
};
