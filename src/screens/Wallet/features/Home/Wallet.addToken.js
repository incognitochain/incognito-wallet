import React, {memo} from 'react';
import {Text, View} from 'react-native';
import {useNavigation} from 'react-navigation-hooks';
import routeNames from '@routers/routeNames';
import {TouchableOpacity} from '@components/core';
import {styledAddToken} from '@screens/Wallet/features/Home/Wallet.styled';

const AddToken = () => {
  const navigation = useNavigation();
  const handleFollowToken = () => navigation.navigate(routeNames.FollowToken);
  return (
    <TouchableOpacity onPress={handleFollowToken}>
      <View style={styledAddToken.container}>
        <Text style={styledAddToken.title}>Add a coin +</Text>
      </View>
    </TouchableOpacity>
  );
};

export default memo(AddToken);
