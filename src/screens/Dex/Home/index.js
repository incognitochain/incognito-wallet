import React from 'react';
import PropTypes from 'prop-types';
import {
  View,
  ScrollView,
  RefreshControl, Text, TouchableOpacity, FlexView,
} from '@components/core/index';
import { MAX_FEE_PER_TX } from '@components/EstimateFee/EstimateFee.utils';
import Header from '@components/Header/Header';
import RightHeader from '@screens/Dex/RightHeader';
import { withLayout_2 } from '@components/Layout/index';
import ButtonGroup from '@components/ButtonGroup/index';
import { compose } from 'recompose';
import withDefaultAccount from '@components/Hoc/withDefaultAccount';
import withDexAccounts from '@screens/Dex/dexAccount.enhance';
import { LoadingContainer, Row } from '@src/components';
import { ArrowRightGreyIcon } from '@components/Icons/index';
import routeNames from '@routers/routeNames';
import AddPool from '../AddPool/Form';
import RemovePool from '../RemovePool/Form';
import { mainStyle } from './style';

const MODES = {
  ADD: 'add',
  REMOVE: 'remove',
};

const buttons = [
  {
    id: 'add',
    title: 'Add',
  },
  {
    id: 'remove',
    title: 'Remove',
  }
];

class Index extends React.Component {
  state = {
    mode: MODES.ADD,
    addLiquidityParams: {
      adding: false,
      inputToken: undefined,
      inputValue: undefined,
      inputFee: MAX_FEE_PER_TX,
      pTokens: [],
      inputList: [],
      outputList: [],
      outputToken: undefined,
      outputValue: undefined,
      outputFee: MAX_FEE_PER_TX,
      shareBalance: undefined,
      prvBalance: 0,
      inputError: undefined,
      showSuccess: false,
    },
    removeLiquidityParams: {
      pair: null,
      userPairs: [],
      topText: 0,
      bottomText: 0,
      prvBalance: 0,
      fee: MAX_FEE_PER_TX,
      showSuccess: false,
    }
  };

  changeMode = (mode) =>{
    this.setState({ mode });
  };

  updateAddLiquidityParams = (params, cb) => {
    const { addLiquidityParams } = this.state;
    this.setState({ addLiquidityParams : { ...addLiquidityParams, ...params }}, cb);
  };

  updateRemoveLiquidityParams = (params, cb) => {
    const { removeLiquidityParams } = this.state;
    this.setState({ removeLiquidityParams : { ...removeLiquidityParams, ...params }}, cb);
  };

  renderPool() {
    const {
      wallet,
      histories,
      onAddHistory,
      onUpdateHistory,
      onGetHistoryStatus,
      tokens,
      pairs,
      dexMainAccount,
      pairTokens,
      shares,
      isLoading,
      navigation,
      accounts,
    } = this.props;
    const { addLiquidityParams, mode, removeLiquidityParams } = this.state;

    if (mode === MODES.ADD) {
      return (
        <AddPool
          account={dexMainAccount}
          wallet={wallet}
          histories={histories}
          onAddHistory={onAddHistory}
          onUpdateHistory={onUpdateHistory}
          onGetHistoryStatus={onGetHistoryStatus}
          onUpdateParams={this.updateAddLiquidityParams}
          params={addLiquidityParams}
          tokens={tokens}
          pairTokens={pairTokens}
          pairs={pairs}
          isLoading={isLoading}
          navigation={navigation}
        />
      );
    }
    
    return (
      <RemovePool
        accounts={accounts}
        account={dexMainAccount}
        wallet={wallet}
        histories={histories}
        onAddHistory={onAddHistory}
        onUpdateHistory={onUpdateHistory}
        onGetHistoryStatus={onGetHistoryStatus}
        onUpdateParams={this.updateRemoveLiquidityParams}
        params={removeLiquidityParams}
        tokens={tokens}
        pairTokens={pairTokens}
        pairs={pairs}
        shares={shares}
        isLoading={isLoading}
        navigation={navigation}
      />
    );
  }

  renderRefreshControl() {
    const { isLoading, onLoadData } = this.props;
    return (
      <RefreshControl
        refreshing={isLoading}
        onRefresh={onLoadData}
      />
    );
  }

  handleHistory = () => {
    const { navigation } = this.props;

    navigation.navigate(routeNames.InvestHistory);
  };

  render() {
    const { tokens, pairs, histories } = this.props;
    const { mode } = this.state;

    if (!tokens.length || !pairs.length) {
      return <LoadingContainer />;
    }

    return (
      <FlexView>
        <Header
          title="Liquidity"
          rightHeader={tokens?.length ? <RightHeader coins={tokens} /> : null}
        />
        <ScrollView
          refreshControl={this.renderRefreshControl()}
          style={mainStyle.container}
          paddingBottom
        >
          <ButtonGroup
            buttons={buttons}
            onPress={this.changeMode}
            selectedButton={mode}
          />
          {this.renderPool()}
        </ScrollView>
        {!!histories?.length && (
          <View style={mainStyle.rateChange}>
            <TouchableOpacity onPress={this.handleHistory}>
              <Row center spaceBetween style={mainStyle.flex}>
                <Text style={mainStyle.rateStyle}>History</Text>
                <ArrowRightGreyIcon style={[{marginLeft: 10}]} />
              </Row>
            </TouchableOpacity>
          </View>
        )}
      </FlexView>
    );
  }
}

Index.propTypes = {
  accounts: PropTypes.array.isRequired,
  tokens: PropTypes.array.isRequired,
  wallet: PropTypes.object.isRequired,
  histories: PropTypes.array.isRequired,
  onAddHistory: PropTypes.func.isRequired,
  onUpdateHistory: PropTypes.func.isRequired,
  onGetHistoryStatus: PropTypes.func.isRequired,
  onLoadData: PropTypes.func.isRequired,
  dexMainAccount: PropTypes.object.isRequired,
  pairs: PropTypes.array.isRequired,
  pairTokens: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  shares: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
};

export default compose(
  withLayout_2,
  withDefaultAccount,
  withDexAccounts,
)(Index);


