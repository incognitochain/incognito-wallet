import React from 'react';
import { View, StyleSheet, Text, Clipboard, RefreshControl } from 'react-native';
import { ScrollView, TouchableOpacity, Toast } from '@src/components/core';
import { useSelector } from 'react-redux';
import { ExHandler } from '@src/services/exception';
import { getToken } from '@src/services/auth';
import { withLayout_2 } from '@src/components/Layout';
import Header from '@src/components/Header';
import { FONT, COLORS } from '@src/styles';
import { profileSelector } from './Profile.selector';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  title: {
    fontFamily: FONT.NAME.bold,
    color: COLORS.black,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 4,
    flex: 1,
  },
  value: {
    fontFamily: FONT.NAME.medium,
    color: COLORS.colorGreyBold,
    fontSize: FONT.SIZE.regular,
    lineHeight: FONT.SIZE.regular + 4,
    flex: 5,
    paddingLeft: 25,
  },
});

const Item = (props) => {
  const { title, value } = props;
  const onCopyItem = () => {
    Clipboard.setString(value);
    Toast.showInfo('Copied');
  };
  return (
    <TouchableOpacity onPress={onCopyItem}>
      <View style={styled.item}>
        <Text style={styled.title}>{title}</Text>
        <Text style={styled.value}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Profile = () => {
  const { data } = useSelector(profileSelector);
  const [token, setToken] = React.useState('');
  const getAuthToken = async () => {
    try {
      const tokenData = await getToken();
      setToken(tokenData);
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };
  React.useEffect(() => {
    getAuthToken();
  }, []);
  return (
    <View style={styled.container}>
      <Header title="Profile" />
      <ScrollView
        refreshControl={(
          <RefreshControl
            refreshing={false}
            onRefresh={getAuthToken}
          />
        )}
      >
        {Object.keys(data).map((key, index) => (
          <Item title={key} value={data[key]} key={index} />
        ))}
        <Item title="Token" value={token} />
      </ScrollView>
    </View>
  );
};

Profile.propTypes = {};

export default withLayout_2(Profile);
