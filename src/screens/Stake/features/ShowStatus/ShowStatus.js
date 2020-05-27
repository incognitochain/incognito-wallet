import React from 'react';
import { View, StyleSheet, Text, Share } from 'react-native';
import { CheckedGreenIcon } from '@src/components/Icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  activeFlowSelector,
  storageStakeSelector,
  stakeDataSelector,
  pStakeAccountSelector,
} from '@screens/Stake/stake.selector';
import { COLORS, FONT } from '@src/styles';
import { BtnDefault } from '@src/components/Button';
import PropTypes from 'prop-types';
import { useNavigation } from 'react-navigation-hooks';
import { actionToggleModal } from '@src/components/Modal';
import routeNames from '@src/router/routeNames';
import { DEPOSIT_FLOW, WITHDRAW_FLOW } from '@screens/Stake/stake.constant';
import Hook from '@screens/Stake/features/Hook';
import format from '@src/utils/format';
import { ExHandler } from '@src/services/exception';
import isEmpty from 'lodash/isEmpty';
import Capitalize from 'lodash/capitalize';
import { v4 } from 'uuid';
import rnfs from 'react-native-fs';
import { isAndroid, isIOS } from '@src/utils/platform';
import { actionBackupCreateStake } from '@screens/Stake/stake.actions';
import ShowStatusDeposit from './ShowStatus.deposit';
import withShowStatus from './ShowStatus.enhance';

const styled = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingVertical: 50,
    paddingHorizontal: 30,
  },
  heading: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 6,
    color: COLORS.black,
    marginTop: 10,
  },
  break: {
    height: 2,
    width: '100%',
    backgroundColor: COLORS.lightGrey5,
    marginVertical: 25,
  },
  warning: {
    color: COLORS.red,
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    textAlign: 'center',
  },
  btnSubmit: {
    marginTop: 25,
  },
});

export const BlockChecked = props => {
  const { title } = props;
  return (
    <View style={styled.heading}>
      <CheckedGreenIcon />
      <Text style={styled.title}>{title}</Text>
    </View>
  );
};

const ShowStatus = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {
    account,
    amount,
    headerTitle,
    btnSubmitStatus,
    titleStatus,
    warningStatus,
    activeFlow,
  } = useSelector(activeFlowSelector);
  const pStakeAccount = useSelector(pStakeAccountSelector);
  const { backup } = useSelector(storageStakeSelector);
  const { symbol, pDecimals } = useSelector(stakeDataSelector);
  const hookFactories = [
    {
      id: 0,
      leftText: 'Amount:',
      rightText: `${format.amount(amount, pDecimals)} ${symbol} `,
    },
    {
      id: 1,
      leftText: `${headerTitle}:`,
      rightText: account?.name || account?.AccountName,
      rightTextStyle: {
        maxWidth: '40%',
      },
    },
  ];

  const handleShareAccount = async () => {
    try {
      const message = Object.keys(pStakeAccount)
        .filter(key => !isEmpty(pStakeAccount[key]))
        .map(key =>
          key === 'name' || key === 'AccountName' || key === 'PrivateKey'
            ? `${Capitalize(key)}: ${pStakeAccount[key]}\n`
            : '',
        )
        .reduce((prevVal, curVal) => prevVal + curVal);
      const title = 'Backup your staking pool account';
      let dir = null;
      if (isAndroid()) {
        dir = rnfs.ExternalDirectoryPath;
      }
      if (isIOS()) {
        dir = rnfs.DocumentDirectoryPath;
      }
      if (!dir) {
        throw 'Can\'t create a dir';
      }
      const url = `${dir}/pStake_keys_${v4()}.txt`;
      const result = await Share.share({
        message,
        title,
        url,
      });
      const shared = result?.action === Share.sharedAction;
      console.log('shared', shared);
      await dispatch(actionBackupCreateStake());
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

  const onHandlePress = async () => {
    switch (activeFlow) {
    case DEPOSIT_FLOW: {
      if (backup) {
        navigation.navigate(routeNames.StakeHistory);
      } else {
        await handleShareAccount();
      }
      break;
    }
    case WITHDRAW_FLOW: {
      navigation.navigate(routeNames.StakeHistory);
      break;
    }
    default: {
      break;
    }
    }
    await dispatch(actionToggleModal());
  };
  if (activeFlow === DEPOSIT_FLOW) {
    return (
      <ShowStatusDeposit
        btnSubmitStatus={btnSubmitStatus}
        onHandlePress={onHandlePress}
      />
    );
  }
  return (
    <View style={styled.container}>
      <BlockChecked title={titleStatus} />
      {hookFactories.map(item => (
        <Hook data={item} key={item.id} />
      ))}
      {!!warningStatus && (
        <View style={styled.warningContainer}>
          <View style={styled.break} />
          <Text style={styled.warning}>{warningStatus}</Text>
        </View>
      )}
      <BtnDefault
        title={btnSubmitStatus}
        btnStyle={styled.btnSubmit}
        onPress={onHandlePress}
      />
    </View>
  );
};

ShowStatus.propTypes = {};

BlockChecked.propTypes = {
  title: PropTypes.string.isRequired,
};

export default withShowStatus(ShowStatus);
