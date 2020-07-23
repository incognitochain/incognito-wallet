import React from 'react';
import { Text, TouchableWithoutFeedback, View } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { BtnDelete } from '@src/components/Button';
import { CircleIcon } from '@src/components/Icons';
import Icon from 'react-native-vector-icons/Entypo';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { COLORS } from '@src/styles';
import { useNavigation } from 'react-navigation-hooks';
import { styled } from './Notification.styled';
import {
  actionFetchDelete,
  actionFetchRead,
  actionNavigate,
} from './Notification.actions';

const withNotification = (WrappedComponent) => (props) => {
  const { _onOpen, _onClose, closeSwipe, item } = props;
  const { id } = item;
  const dispatch = useDispatch();
  const handleDeleteItem = () => dispatch(actionFetchDelete({ id }));
  const swipeoutConfigs = {
    autoClose: true,
    close: closeSwipe,
    onOpen: _onOpen,
    onClose: _onClose,
    right: [
      {
        component: <BtnDelete showIcon={false} onPress={handleDeleteItem} />,
      },
    ],
    style: {
      backgroundColor: 'transparent',
    },
  };
  return <WrappedComponent {...{ ...props, swipeoutConfigs }} />;
};

// const Title = React.memo(({ title }) => {
//   if (title.includes('balance updated')) {
//     let accountName = title.substring(0, title.lastIndexOf(' balance updated'));

//     if (accountName.length > 10) {
//       accountName = `${accountName.substring(0, 8)}...`;
//     }

//     return (
//       <Text style={styled.title}>
//         <Text>{accountName}</Text>
//         <Text>&nbsp;balance updated!</Text>
//       </Text>
//     );
//   }

//   return <Text style={styled.title}>{title}</Text>;
// });

const Notification = ({ item, firstChild, lastChild, swipeoutConfigs }) => {
  const { title, desc, read, id } = item;
  const handleReadItem = () => dispatch(actionFetchRead({ id }));
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const handleNav = async () => {
    dispatch(actionNavigate(item, navigation));
    dispatch(handleReadItem());
  };

  return React.useMemo(() => {
    return (
      <Swipeout {...swipeoutConfigs}>
        <TouchableWithoutFeedback
          onPress={handleNav}
          style={{
            flex: 1,
            flexDirection: 'column',
          }}
        >
          <View
            style={[
              styled.notification,
              firstChild ?? styled.firstChild,
              lastChild ?? styled.lastChild,
              read ?? { opacity: 0.8 },
            ]}
          >
            <View style={styled.icon}>
              <CircleIcon
                style={{
                  backgroundColor: read ? COLORS.colorGreyBold : COLORS.black,
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                }}
              />
            </View>
            <View style={styled.info}>
              <Text style={styled.desc}>
                {`${title} `}
                <Text style={styled.action}>
                  {desc}
                  <Icon
                    name="chevron-thin-right"
                    color={COLORS.black}
                    size={13}
                  />
                </Text>
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Swipeout>
    );
  }, [read]);
};

withNotification.propTypes = {
  _onClose: PropTypes.func.isRequired,
  _onOpen: PropTypes.func.isRequired,
  closeSwipe: PropTypes.bool.isRequired,
};

Notification.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    read: PropTypes.bool.isRequired,
    time: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    tokenId: PropTypes.string.isRequired,
    publicKey: PropTypes.string.isRequired,
    action: PropTypes.string.isRequired,
  }).isRequired,
  firstChild: PropTypes.bool.isRequired,
  lastChild: PropTypes.bool.isRequired,
  swipeoutConfigs: PropTypes.any.isRequired,
};

export default withNotification(Notification);
