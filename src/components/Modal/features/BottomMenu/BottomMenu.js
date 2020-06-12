import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { COLORS, FONT } from '@src/styles';

const styled = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    flex: 1,
    zIndex: 1,
  },
  menu: {
    backgroundColor: COLORS.white,
    borderTopRightRadius: 13,
    borderTopLeftRadius: 13,
    paddingTop: 15,
    paddingBottom: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  icon: {
    flex: 1,
    padding: 2,
  },
  hook: {
    flex: 5,
  },
  title: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 3,
    color: COLORS.black,
  },
  desc: {
    fontFamily: FONT.NAME.medium,
    fontSize: FONT.SIZE.medium,
    lineHeight: FONT.SIZE.medium + 3,
    color: COLORS.colorGreyBold,
    marginTop: 5,
  },
  lastChild: {
    borderBottomWidth: 0,
  },
});

const MenuItem = ({ data, lastChild }) => {
  const { title, desc, icon, onPressItem } = data;
  return (
    <TouchableOpacity onPress={onPressItem}>
      <View style={[styled.item, lastChild ? styled.lastChild : null]}>
        {icon && <View style={styled.icon}>{icon}</View>}
        <View style={styled.hook}>
          <Text style={styled.title}>{title}</Text>
          <Text style={styled.desc}>{desc}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const Menu = ({ data }) => {
  return (
    <View style={styled.container}>
      <View style={styled.menu}>
        {data.map((item, index) => (
          <MenuItem
            data={item}
            lastChild={data.length - 1 === index}
            key={item?.id || index}
          />
        ))}
      </View>
    </View>
  );
};

Menu.propTypes = {
  data: PropTypes.array.isRequired,
};

MenuItem.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    icon: PropTypes.element.isRequired,
    onPressItem: PropTypes.func.isRequired,
  }).isRequired,
  lastChild: PropTypes.bool.isRequired,
};

export default Menu;
