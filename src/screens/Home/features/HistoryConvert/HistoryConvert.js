import { Header } from '@src/components';
import { BtnInfo } from '@src/components/Button';
import { withLayout_2 } from '@src/components/Layout';
import { selectedPrivacySelector } from '@src/redux/selectors';
import { historyTxsSelector } from '@src/redux/selectors/history';
import { useHistoryEffect } from '@src/screens/Wallet/features/History';
import HistoryList from '@src/screens/Wallet/features/HistoryList';
import EmptyHistory from '@src/screens/Wallet/features/HistoryToken/HistoryToken.empty';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { compose } from 'recompose';
import { PrivacyVersion } from 'incognito-chain-web-js/build/wallet';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const HistoryConvert = () => {
  const selectedPrivacy = useSelector(selectedPrivacySelector.selectedPrivacy);
  const { histories, isEmpty, loading, refreshing, oversize } = useSelector(
    historyTxsSelector,
  );
  const { handleRefresh } = useHistoryEffect({ version: PrivacyVersion.ver1 });
  return (
    <View style={styled.container}>
      <Header title={selectedPrivacy?.name} customHeaderTitle={<BtnInfo />} />
      <View style={{ flex: 1, paddingTop: 15 }}>
        <HistoryList
          histories={histories}
          onRefreshHistoryList={handleRefresh}
          refreshing={refreshing}
          loading={loading}
          renderEmpty={() => <EmptyHistory />}
          showEmpty={isEmpty}
          oversize={oversize}
          containerStyled={{ paddingTop: 15 }}
        />
      </View>
    </View>
  );
};

HistoryConvert.propTypes = {};

export default compose(withLayout_2)(React.memo(HistoryConvert));
