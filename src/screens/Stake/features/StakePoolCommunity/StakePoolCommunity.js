import React from 'react';
import {View, Text, Image, TouchableOpacity} from 'react-native';
import {v4} from 'uuid';
import srcIconConstant from '@assets/images/icons/constant_icon.png';
import srcIconJSServer from '@assets/images/icons/jserver_icon.png';
import {ArrowRightPrimaryIcon} from '@src/components/Icons';
import PropTypes from 'prop-types';
import LinkingService from '@src/services/linking';
import {ExHandler} from '@src/services/exception';
import {styled} from './StakePoolCommunity.styled';

const Item = props => {
  const {pool, icon, link} = props;
  const handleOnPressItem = async () => {
    try {
      LinkingService.openUrl(link);
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  return (
    <TouchableOpacity onPress={handleOnPressItem}>
      <View style={styled.item}>
        <Image source={icon} style={styled.icon} />
        <Text style={styled.pool}>{pool}</Text>
        <ArrowRightPrimaryIcon />
      </View>
    </TouchableOpacity>
  );
};

const StakePoolCommunity = props => {
  const poolFactories = [
    {
      pool: 'Constant',
      icon: srcIconConstant,
      link: 'https://www.myconstant.com/staking',
    },
    {
      pool: 'JServers',
      icon: srcIconJSServer,
      link: 'http://jservers.com/',
    },
  ];
  return (
    <View style={styled.container}>
      <Text style={styled.title}>Or try a community-run service:</Text>
      {poolFactories.map(item => (
        <Item key={v4()} {...item} />
      ))}
    </View>
  );
};

Item.propTypes = {
  pool: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

StakePoolCommunity.propTypes = {};

export default React.memo(StakePoolCommunity);
