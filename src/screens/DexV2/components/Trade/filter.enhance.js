import React from 'react';
import _ from 'lodash';
import convertUtil from '@utils/convert';

const withFilter = WrappedComp => (props) => {
  const [outputToken, setOutputToken] = React.useState(null);
  const [outputList, setOutputList] = React.useState([]);
  const { inputToken, pairs, pairTokens } = props;
  const filter = () => {
    try {
      let newOutputToken = outputToken;
      let outputPairs = pairs.filter(pair => pair[inputToken.id]);
      let outputList = outputPairs
        .map(pair => {
          const id = pair.keys.find(key => key !== inputToken.id);
          const pool = pair[id];
          return ({ id, pool });
        })
        .map(({ id, pool }) => ({
          ...pairTokens.find(token => token.id === id),
          pool: convertUtil.toRealTokenValue(pairTokens, id, pool),
        }))
        .filter(item => item)
        .filter(item => item.name && item.symbol);

      if (inputToken.address) {
        outputList = outputList.concat(pairTokens.filter(token => token.address && token.id !== inputToken.id));
      }

      outputList = _(outputList)
        .orderBy([
          'priority',
          'hasIcon',
          'pool',
          item => item.symbol && item.symbol.toLowerCase(),
        ], ['asc', 'desc', 'desc', 'asc'])
        .value();

      if (outputToken && !outputList.find(item => item.id === outputToken.id)) {
        newOutputToken = null;
      }

      newOutputToken = newOutputToken || outputList[0];
      setOutputToken(newOutputToken);
      setOutputList(outputList);
    } catch (error) {
      console.debug('FILTER OUTPUT LIST', error);
    }
  };

  React.useEffect(() => {
    if (inputToken) {
      filter();
    }
  }, [inputToken, pairs]);

  return (
    <WrappedComp
      {...{
        ...props,
        onChangeOutputToken: setOutputToken,
        outputList,
        outputToken,
      }}
    />
  );
};

export default withFilter;
