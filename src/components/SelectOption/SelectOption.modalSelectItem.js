import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScrollView, Text, TouchableOpacity } from '@src/components/core';
import Row from '@src/components/Row';
import PropTypes from 'prop-types';
import { FONT } from '@src/styles';
import ModalBottomSheet from '@src/components/Modal/features/ModalBottomSheet';
import { useSelector } from 'react-redux';
import { colorsSelector } from '@src/theme';
import {
  AppIcon,
  PancakeIcon,
  UniIcon,
  CurveIcon,
  SpoonkyIcon,
  JoeIcon,
  TrisolarisIcon,
} from '@src/components/Icons';
import { KEYS_PLATFORMS_SUPPORTED } from '@src/screens/PDexV3/features/Swap';
import { isEmpty } from 'lodash';

const styled = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  touchWrapper: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
  },
  item: {
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...FONT.TEXT.incognitoP1,
    marginLeft: 10,
  },
  titleSelectItem: {
    ...FONT.TEXT.incognitoH6,
    marginLeft: 14,
  },
  desc: {
    fontSize: FONT.SIZE.regular,
    fontFamily: FONT.NAME.regular,
    width: '100%',
  },
  left: {
    flex: 1,
  },
  right: {
    maxWidth: 120,
    marginLeft: 15,
  },
  scrollview: {
    flex: 1,
    paddingHorizontal: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    resizeMode: 'contain',
  },
});

export const mapperIcon = ({ id }) => {
    let icon = null;
    // id = 'uniswap'
    if (id && id.includes(KEYS_PLATFORMS_SUPPORTED.uni)) {
        return <UniIcon style={styled.icon} />;
    }
    switch (id) {
        case KEYS_PLATFORMS_SUPPORTED.incognito:
        case KEYS_PLATFORMS_SUPPORTED.interswap:
            icon = <AppIcon style={styled.icon} />;
            break;
        case KEYS_PLATFORMS_SUPPORTED.pancake:
            icon = <PancakeIcon style={styled.icon} />;
            break;
        case KEYS_PLATFORMS_SUPPORTED.uni:
        case KEYS_PLATFORMS_SUPPORTED.uniEther:
            icon = <UniIcon style={styled.icon} />;
            break;
        case KEYS_PLATFORMS_SUPPORTED.curve:
            icon = <CurveIcon style={styled.icon} />;
            break;
        case KEYS_PLATFORMS_SUPPORTED.spooky:
            icon = <SpoonkyIcon style={styled.icon} />;
            break;
        case KEYS_PLATFORMS_SUPPORTED.joe:
            icon = <JoeIcon style={styled.icon} />;
            break;
        case KEYS_PLATFORMS_SUPPORTED.trisolaris:
            icon = <TrisolarisIcon style={styled.icon} />;
            break;
        default:
            break;
    }
    return icon;
};

export const SelectItem = React.memo(
  ({
    id,
    title,
    desc,
    onPressItem,
    itemStyled,
    isSelectItem,
    lastChild = false,
    firstChild = false,
  }) => {
    const colors = useSelector(colorsSelector);
    let icon = mapperIcon({ id });
    return (
      <TouchableOpacity
        onPress={() => {
          if (typeof onPressItem === 'function') {
            // from props
            onPressItem(id);
          }
        }}
        style={[
          styled.touchWrapper,
          isSelectItem
            ? {
                padding: 0,
                borderRadius: 0,
                paddingHorizontal: 24,
                paddingVertical: 16,
                borderBottomWidth: 2,
                borderBottomColor: lastChild ? 'transparent' : colors.grey8,
                display: 'flex',
                alignItems: 'center',
                flexDirection: 'row',
                borderTopLeftRadius: firstChild ? 24 : 0,
                borderTopRightRadius: firstChild ? 24 : 0,
              }
            : {
                backgroundColor: colors.grey9,
                borderColor: colors.against,
                borderWidth: 1,
              },
        ]}
      >
        <View style={[styled.row, styled.item, itemStyled]}>
          <View style={[styled.row, styled.left]}>
            {icon && icon}
            <Text
              style={isSelectItem ? styled.titleSelectItem : styled.title}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {title}
            </Text>
          </View>
          {!isEmpty(desc) && (
            <View style={styled.right}>
              <Text style={styled.desc} numberOfLines={1} ellipsizeMode="tail">
                {desc}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  },
);

SelectItem.defaultProps = {
  isSelectItem: true,
};

SelectItem.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  desc: PropTypes.string.isRequired,
  srcIcon: PropTypes.any,
  onPressItem: PropTypes.func.isRequired,
  isSelectItem: PropTypes.bool,
};

const SelectOptionModal = ({ options }) => {
  return (
    <ModalBottomSheet
      style={{
        height: 300,
        paddingHorizontal: 0,
        paddingVertical: 0,
      }}
      customContent={(
        <ScrollView style={styled.scrollview}>
          {options.map((option, index, arr) => (
            <SelectItem
              key={option?.id}
              {...{
                ...option,
                lastChild: index === arr.length - 1,
                firstChild: index === 0,
              }}
            />
          ))}
        </ScrollView>
      )}
    />
  );
};

SelectOptionModal.propTypes = {};

export default React.memo(SelectOptionModal);
