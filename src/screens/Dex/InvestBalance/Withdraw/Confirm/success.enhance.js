import React from 'react';
import { useNavigation } from 'react-navigation-hooks';
import { SuccessModal } from '@src/components';
import ROUTE_NAMES from '@routers/routeNames';
import mainStyles from '@screens/Dex/style';
import AddPin from '@screens/AddPIN';

const withSuccess = WrappedComp => (props) => {
  const [success, setSuccess] = React.useState(false);
  const navigation = useNavigation();

  const { account } = props;

  const closeSuccess = () => {
    setSuccess(false);
    navigation.navigate(ROUTE_NAMES.Invest);

    if (AddPin.waiting) {
      navigation.navigate(ROUTE_NAMES.AddPin, { action: 'login' });
    }
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
        title="Withdraw success"
        buttonStyle={mainStyles.button}
        extraInfo={`Please wait a few minutes for your ${account.name} balance to update.`}
        visible={success}
      />
    </>
  );
};

export default withSuccess;
