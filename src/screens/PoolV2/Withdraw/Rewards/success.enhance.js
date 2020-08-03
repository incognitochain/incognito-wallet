import React from 'react';
import { useNavigation } from 'react-navigation-hooks';
import { SuccessModal } from '@src/components';
import ROUTE_NAMES from '@routers/routeNames';
import mainStyle from '@screens/PoolV2/style';

const withSuccess = WrappedComp => (props) => {
  const [success, setSuccess] = React.useState(false);
  const navigation = useNavigation();

  const {
    displayFullTotalRewards,
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
        title="Withdrawal successful."
        buttonTitle="Back to dashboard"
        description={`${displayFullTotalRewards} PRV in provider rewards has been withdrawn to ${account.name || account.AccountName}.`}
        extraInfo="Please wait for your balance to update."
        visible={success}
        buttonStyle={mainStyle.button}
      />
    </>
  );
};

export default withSuccess;
