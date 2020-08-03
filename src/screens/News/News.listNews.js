import React from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { useDispatch, useSelector } from 'react-redux';
import routeNames from '@src/router/routeNames';
import { userIdSelector } from '@screens/Profile';
import Swipeout from 'react-native-swipeout';
import { TouchableOpacity } from '@src/components/core';
import { BtnDelete } from '@src/components/Button';
import { CircleIcon } from '@src/components/Icons';
import Icon from 'react-native-vector-icons/Entypo';
import { COLORS } from '@src/styles';
import PropTypes from 'prop-types';
import { actionReadNews, actionRemoveNews } from './News.actions';
import { listNewsStyled as styled } from './News.styled';
import { TYPE } from './News.constant';

const ListNews = ({ listNews, type }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userId = useSelector(userIdSelector);
  const onPressItem = (item) => {
    navigation.navigate(routeNames.Community, {
      uri: item?.more,
    });
    dispatch(actionReadNews(item?.id));
  };
  const handleRemoveNews = (id) => dispatch(actionRemoveNews(id));
  const Item = React.memo((props) => {
    const { item, isRead, firstChild } = props;
    const { icon, title, description } = item;
    const canTap = !!item?.more;
    const TapItem = (props) => {
      return (
        <TouchableOpacity onPress={() => onPressItem(item)}>
          {props?.children}
        </TouchableOpacity>
      );
    };
    switch (type) {
    case TYPE.news: {
      const Component = () => (
        <View style={[styled.hook, styled.hook1]}>
          <CircleIcon
            style={[
              styled.circle,
              isRead && { backgroundColor: COLORS.colorGreyLight },
            ]}
          />
          <View style={styled.extra}>
            <Text style={styled.desc}>
              {`${title} `}
              {canTap && (
                <Text style={[styled.desc, { color: COLORS.black }]}>
                  {`${description}`}
                  <Icon
                    name="chevron-thin-right"
                    size={14}
                    color={COLORS.black}
                  />
                </Text>
              )}
            </Text>
          </View>
        </View>
      );
      if (canTap) {
        return (
          <TapItem>
            <Component />
          </TapItem>
        );
      }
      return <Component />;
    }
    case TYPE.whatNews: {
      const Component = () => (
        <View style={[styled.hook, styled.hook2]}>
          <Image style={styled.icon} source={{ uri: icon }} />
          <Text style={styled.desc}>
            {`${title} `}{' '}
            {canTap && (
              <Text style={[styled.desc, { color: COLORS.black }]}>
                {`${description}`}
                <Icon
                  name="chevron-thin-right"
                  size={14}
                  color={COLORS.black}
                />
              </Text>
            )}
          </Text>
        </View>
      );
      if (canTap) {
        return (
          <TapItem>
            <Component />
          </TapItem>
        );
      }
      return <Component />;
    }
    case TYPE.whatNext: {
      const Component = () => (
        <View
          style={[styled.hook, styled.hook3, firstChild && { marginTop: 30 }]}
        >
          <Text style={[styled.desc, styled.descNoIcon]}>
            {`${title} `}
            {canTap && (
              <Icon
                name="chevron-thin-right"
                size={14}
                color={COLORS.colorGreyBold}
              />
            )}{' '}
          </Text>
        </View>
      );
      if (canTap) {
        return (
          <TapItem>
            <Component />
          </TapItem>
        );
      }
      return <Component />;
    }
    default: {
      return null;
    }
    }
  });
  const renderListNews = () => {
    return listNews.map((item, index, arr) => {
      const user = item?.listUserNews.find((item) => item?.userId === userId);
      const isRemoved = user?.isRead === -1;
      if (type === 1) {
        if (isRemoved) {
          return null;
        }
        const isRead = user?.isRead === 1;
        return (
          <Swipeout
            autoClose
            style={[
              {
                backgroundColor: 'transparent',
                marginBottom: 15,
              },
              arr.length - 1 === index && { marginBottom: 0 },
            ]}
            right={[
              {
                component: (
                  <BtnDelete
                    showIcon={false}
                    onPress={() => handleRemoveNews(item?.id)}
                  />
                ),
              },
            ]}
          >
            <Item
              item={item}
              firstChild={index === 0}
              isRead={isRead}
              key={item?.id}
            />
          </Swipeout>
        );
      }
      return <Item {...{ item, firstChild: index === 0 }} key={item?.id} />;
    });
  };
  return <View style={styled.listNews}>{renderListNews()}</View>;
};

ListNews.propTypes = {
  listNews: PropTypes.array.isRequired,
  type: PropTypes.number.isRequired,
};

export default ListNews;
