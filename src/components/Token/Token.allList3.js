import { View } from '@src/components/core';
import Empty from '@src/components/Empty';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import BigList from 'react-native-big-list';

const styles = StyleSheet.create({
  listContentContainer: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 40,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

const ListAllToken3 = (props) => {
  const {
    tokensFactories,
    renderItem,
  } = props;

  const memoizedValue = useMemo(() => renderItem, [tokensFactories]);
  const renderKeyExtractor = useCallback(
    (item) => item.tokenId || item.paymentAddress || item.contractId,
    [],
  );

  const renderEmpty = () => {
    return (
      <View
        style={{
          width: Dimensions.get('window').width,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',

        }}
        borderTop
      >
        <Empty />
      </View>
    );
  };

  return (
    <BigList
      keyExtractor={renderKeyExtractor}
      sections={[tokensFactories]}
      renderItem={memoizedValue}
      sectionHeaderHeight={40}
      sectionFooterHeight={40}
      itemHeight={75}
      maxToRenderPerBatch={50}
      initialNumToRender={10}
      windowSize={25}
      renderEmpty={renderEmpty}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContentContainer}
    />
  );
};

ListAllToken3.defaultProps = {
};

ListAllToken3.propTypes = {
  tokensFactories: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
};

export default React.memo(ListAllToken3);
