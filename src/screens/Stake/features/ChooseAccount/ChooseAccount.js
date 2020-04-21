import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {COLORS, FONT} from '@src/styles';
import {accountSeleclor} from '@src/redux/selectors';
import {useSelector, useDispatch} from 'react-redux';
import {AccountIcon} from '@src/components/Icons';
import format from '@src/utils/format';
import PropTypes from 'prop-types';
import {actionChangeFlowAccount} from '@screens/Stake/stake.actions';
import srcAccountIcon from '@src/assets/images/icons/account_staking_pool.png';
import {
  stakeDataSelector,
  activeFlowSelector,
} from '@screens/Stake/stake.selector';
import {DEPOSIT_FLOW} from '@screens/Stake/stake.constant';
import {ExHandler} from '@src/services/exception';
import {calInterestRate} from '@screens/Stake/stake.utils';
import withChoseAccount from './ChooseAccount.enhance';

const styled = StyleSheet.create({
  account: {
    flexDirection: 'row',
    padding: 20,
    borderBottomColor: COLORS.lightGrey1,
    borderBottomWidth: 0.5,
    alignItems: 'center',
  },
  accountName: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    color: COLORS.black,
    marginLeft: 20,
    maxWidth: '100%',
    textAlign: 'left',
    flex: 1,
  },
  accountBalance: {
    fontFamily: FONT.NAME.regular,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 6,
    color: COLORS.lightGrey1,
    textAlign: 'right',
    maxWidth: 100,
    marginLeft: 5,
  },
  lastChild: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderBottomColor: 'transparent',
  },
  icon: {
    width: 20,
    height: 20,
  },
  balanceContainer: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
});

const Account = props => {
  const {account, lastChild, isLoadingBalance} = props;
  const dispatch = useDispatch();
  const {
    pDecimals,
    symbol,
    balance,
    currentRewardRate,
    rewardDateToMilSec,
    nodeTime,
    localTime,
    shouldCalInterestRate,
    totalBalance,
  } = useSelector(stakeDataSelector);
  const {activeFlow} = useSelector(activeFlowSelector);
  const shouldShowBalance = activeFlow === DEPOSIT_FLOW;
  const onChooseAccount = async () => {
    try {
      if (isLoadingBalance) {
        return;
      }
      let balancePStake = totalBalance;
      if (shouldCalInterestRate) {
        const localTimeCurrent = new Date().getTime();
        const nodeTimeCurrent = nodeTime + (localTimeCurrent - localTime);
        const interestRate = calInterestRate({
          nowToMilSec: nodeTimeCurrent,
          balance,
          rate: currentRewardRate,
          rewardDateToMilSec,
        });
        balancePStake += interestRate;
      }
      await dispatch(
        actionChangeFlowAccount({
          account,
          balancePStake,
        }),
      );
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  const renderBalance = () => {
    if (isLoadingBalance) {
      return <ActivityIndicator size="small" />;
    }
    if (shouldShowBalance) {
      return (
        <View style={styled.balanceContainer}>
          <Text style={styled.accountBalance} numberOfLines={1}>
            {`${format.amount(account?.value || 0, pDecimals)}`}
          </Text>
          <Text style={styled.accountBalance}>{symbol}</Text>
        </View>
      );
    }
    return null;
  };
  return (
    <TouchableWithoutFeedback onPress={onChooseAccount}>
      <View style={[styled.account, lastChild ? styled.lastChild : null]}>
        <AccountIcon source={srcAccountIcon} style={styled.icon} />

        <Text style={styled.accountName} numberOfLines={1}>
          {account?.name || account?.AccountName}
        </Text>
        {renderBalance()}
      </View>
    </TouchableWithoutFeedback>
  );
};

const ChooseAccount = props => {
  const {fetchData} = props;
  const accountList = useSelector(accountSeleclor.listAccount);
  const isGettingBalance = useSelector(accountSeleclor.isGettingBalance);
  const refreshing = isGettingBalance.length > 0;
  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchData} />
      }
    >
      {accountList.map((account, index) => (
        <Account
          isLoadingBalance={isGettingBalance.includes(
            account?.name || account?.AccountName,
          )}
          account={account}
          key={account?.name || account?.AccountName}
          lastChild={accountList.length - 1 === index}
        />
      ))}
    </ScrollView>
  );
};

Account.propTypes = {
  account: PropTypes.any.isRequired,
  lastChild: PropTypes.bool.isRequired,
  isLoadingBalance: PropTypes.bool.isRequired,
};

ChooseAccount.propTypes = {
  fetchData: PropTypes.func.isRequired,
};

export default withChoseAccount(ChooseAccount);
