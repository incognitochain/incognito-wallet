import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { View, TouchableOpacity, BaseTextInput, Text } from '@components/core';
import { compose } from 'recompose';
import BackButton from '@components/BackButtonV2';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { withLayout_2 } from '@components/Layout/index';
import { VirtualizedList } from 'react-native';
import styled from 'styled-components/native';
import globalStyled from '@src/theme/theme.styled';
import TokenItem from './TokenItem';
import styles from './style';
import withTokenSelect from './enhance';

const CustomTouchableOpacity = styled(TouchableOpacity)`
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border4};
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  padding-top: 8px;
  padding-bottom: 8px;
`;

const TokenSelect = ({
  tokens,
  onSearch,
}) => {
  const placeholder = useNavigationParam('placeholder') || 'Placeholder';
  const onSelectToken = useNavigationParam('onSelectToken') || _.noop();
  const rightField = useNavigationParam('rightField');

  const navigation = useNavigation();
  const selectToken = (token) => {
    onSelectToken(token);
    navigation.goBack();
  };

  const renderTokenItem = (data) => {
    const token = data.item;
    let rightValue = '';
    if (rightField) {
      rightValue = token[rightField];
    }
    return (
      <CustomTouchableOpacity key={token.id} onPress={() => selectToken(token)}>
        <TokenItem
          symbol={token.symbol || token.displaySymbol}
          id={token.id}
          // verified={token.verified || token.isVerified}
          name={token.name}
        />
        {rightField !== '' && (
          <View style={{ marginLeft: 10, paddingRight: 26 }}>
            <Text style={styles.tokenName} numberOfLines={2}>{rightValue}</Text>
          </View>
        )}
      </CustomTouchableOpacity>
    );
  };

  return (
    <>
      <View style={[styles.row, globalStyled.defaultPaddingHorizontal]}>
        <BackButton />
        <BaseTextInput
          placeholder={placeholder}
          onChangeText={onSearch}
          style={styles.input}
        />
      </View>
      <View borderTop style={styles.container}>
        <VirtualizedList
          data={tokens}
          renderItem={renderTokenItem}
          getItem={(data, index) => data[index]}
          getItemCount={data => data.length}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </>
  );
};

TokenSelect.propTypes = {
  tokens: PropTypes.array,
  onSearch: PropTypes.func.isRequired,
};

TokenSelect.defaultProps = {
  tokens: [],
};

export default compose(
  withTokenSelect,
  withLayout_2,
)(React.memo(TokenSelect));
