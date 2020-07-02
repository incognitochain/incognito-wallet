import React from 'react';
import { useNavigation } from 'react-navigation-hooks';
import { SuccessModal } from '@src/components';
import ROUTE_NAMES from '@routers/routeNames';
import mainStyle from '@screens/PoolV2/style';

const withSuccess = WrappedComp => (props) => {
  const [success, setSuccess] = React.useState(false);
  const navigation = useNavigation();

  const {
    inputText,
    coin,
    account,
  } = props;

  const closeSuccess = () => {
    setSuccess(false);
    navigation.navigate(ROUTE_NAMES.PoolV2);
  };

  return (
    <>
      <WrappedComp
        {...{
          ...props,
          onSuccess: setSuccess,
        }}
      />
      <SuccessModal
        closeSuccessDialog={closeSuccess}
        title="Withdrawal in process."
        buttonTitle="Back to dashboard"
        description={`${inputText} ${coin.symbol} is being withdrawn to ${account.name}.`}
        extraInfo="This may take between 1 to 3 days. Your balance will update when withdrawal is complete."
        visible={success}
        buttonStyle={mainStyle.button}
      />
    </>
  );
};

export default withSuccess;
