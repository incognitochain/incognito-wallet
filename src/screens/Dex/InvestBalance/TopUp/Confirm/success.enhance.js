import React from 'react';
import { useNavigation } from 'react-navigation-hooks';
import { SuccessModal } from '@src/components';
import ROUTE_NAMES from '@routers/routeNames';
import mainStyles from '@screens/Dex/style';

const withSuccess = WrappedComp => (props) => {
  const [success, setSuccess] = React.useState(false);
  const navigation = useNavigation();

  const closeSuccess = () => {
    setSuccess(false);
    navigation.navigate(ROUTE_NAMES.Invest);
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
        title="Top up success"
        buttonStyle={mainStyles.button}
        extraInfo="Please wait a couple of minutes for your pDEX balance to update."
        visible={success}
      />
    </>
  );
};

export default withSuccess;
