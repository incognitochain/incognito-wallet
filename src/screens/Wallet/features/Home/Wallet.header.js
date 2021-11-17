import React, {memo} from 'react';
import { headerStyled } from '@screens/Wallet/features/Home/Wallet.styled';
import { NotificationIcon, QRCodeIcon } from '@components/Icons';
import { homeStyled } from '@screens/MainTabBar/MainTabBar.styled';
import { actionToggleModal } from '@components/Modal';
import AddressModal from '@screens/MainTabBar/features/Home/Home.qrCode';
import { Row } from '@src/components';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from 'react-navigation-hooks';
import { newsSelector } from '@screens/News';
import routeNames from '@routers/routeNames';
import { View } from '@components/core';
import SelectAccountButton from '@components/SelectAccountButton';

const Notification = React.memo(() => {
  const navigation = useNavigation();
  const { isReadAll } = useSelector(newsSelector);
  const handleNavNotification = () => navigation.navigate(routeNames.News, {'lastNewsID': isReadAll});
  return (
    <View>
      <NotificationIcon style={headerStyled.icon} onPress={handleNavNotification} />
      {isReadAll !== 0 && (
        <View style={homeStyled.notify} />
      )}
    </View>
  );
});

const Header = () => {
  const dispatch = useDispatch();
  const onShowAddress = React.useCallback(() => {
    dispatch(actionToggleModal({
      data: (<AddressModal />),
      visible: true,
      shouldCloseModalWhenTapOverlay: true
    }));
  }, []);
  return (
    <Row style={headerStyled.container} centerVertical spaceBetween>
      <QRCodeIcon
        style={headerStyled.icon}
        onPress={onShowAddress}
      />
      <Row centerVertical>
        <Notification />
        <SelectAccountButton />
      </Row>
    </Row>
  );
};

Header.propTypes = {};

export default memo(Header);
