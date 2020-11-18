import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import Header from '@components/Header';
import { withLayout_2 } from '@components/Layout';
import { View } from '@components/core';
import Trade from '@screens/DexV2/components/Trade';
import { isEmpty } from 'lodash';
import LoadingContainer from '@components/LoadingContainer/index';
import withPairs from '@screens/DexV2/components/pdexPair.enhance';
import styles from './style';

class Dex extends React.Component {
  renderTrade() {
    const { tokens, pairTokens, pairs, loading, onLoadPairs } = this.props;
    return (
      <Trade
        pairs={pairs}
        tokens={tokens}
        pairTokens={pairTokens}
        isLoading={loading}
        onLoadPairs={onLoadPairs}
      />
    );
  }

  renderMode() {
    const { pairTokens, pairs, tokens } = this.props;

    if (isEmpty(tokens) || isEmpty(pairs) || isEmpty(pairTokens)) {
      return <LoadingContainer />;
    }

    return this.renderTrade();
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <Header title="pDEX" accountSelectable />
        {this.renderMode()}
      </View>
    );
  }
}

Dex.propTypes = {
  tokens: PropTypes.array.isRequired,
  pairs: PropTypes.array.isRequired,
  pairTokens: PropTypes.array.isRequired,
  onLoadPairs: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default compose(
  withLayout_2,
  withPairs,
)(Dex);
