import React from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import { withLayout_2 } from '@src/components/Layout';
import { compose } from 'recompose';
import { useNavigationParam } from 'react-navigation-hooks';

export const TYPES = {
  ERC20: { label: 'ERC20', value: 'ERC20' },
  BEP2: { label: 'BEP2', value: 'BEP2' },
  BEP20: { label: 'BEP20', value: 'BEP20' },
  POLYGON: { label: 'POLYGON', value: 'POLYGON' },
  FANTOM: { label: 'FANTOM', value: 'FANTOM' },
  AVAX: { label: 'AVAX', value: 'AVAX' },
  AURORA: { label: 'AURORA', value: 'AURORA' },
  NEAR: { label: 'NEAR', value: 'NEAR' },
};

export const AddManuallyContext = React.createContext();

const enhance = (WrappedComp) => (props) => {
  const typeParam = useNavigationParam('type');
  const [state, setState] = React.useState({
    type: typeParam || TYPES.INCOGNITO.value,
    isShowChooseType: false,
  });
  const { type, isShowChooseType } = state;
  const toggleChooseType = async () =>
    await setState({ ...state, isShowChooseType: !isShowChooseType });
  const handlePressChooseType = async (type) =>
    await setState({ ...state, type, isShowChooseType: !isShowChooseType });
  return (
    <ErrorBoundary>
      <AddManuallyContext.Provider
        value={{
          toggleChooseType,
          handlePressChooseType,
          type,
          isShowChooseType,
        }}
      >
        <WrappedComp {...props} />
      </AddManuallyContext.Provider>
    </ErrorBoundary>
  );
};

export default compose(withLayout_2, enhance);
