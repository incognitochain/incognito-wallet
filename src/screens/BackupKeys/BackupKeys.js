/* eslint-disable import/no-cycle */
import { ScrollView, TouchableOpacity } from '@src/components/core';
import PropTypes from 'prop-types';
import React from 'react';
import CopiableText from '@src/components/CopiableText';
import { View, Text } from 'react-native';
import Header from '@src/components/Header';
import IconCopy from '@src/components/Icons/icon.copy';
import { ButtonBasic } from '@src/components/Button';
import { ArrowRightGreyIcon } from '@src/components/Icons';
import style from './BackupKeys.styled';
import withBackupKeys from './BackupKeys.enhance';

const BackupKeys = (props) => {
  const { onSaveAs, onCopyAll, backupData, getNameKey } = props;

  const renderAccountItem = (name, key) => {
    return (
      <CopiableText
        key={name}
        text={`${name}: ${key}`}
        copiedMessage={`"${name}" private key was copied`}
        style={style.accountItemContainer}
      >
        <View style={style.accountItemHeader}>
          <Text style={style.title}>{name}</Text>
          <IconCopy />
        </View>
        <Text numberOfLines={1} ellipsizeMode="middle" style={style.desc}>
          {key}
        </Text>
      </CopiableText>
    );
  };

  return (
    <View style={style.container}>
      <Header title="Back up private keys" />
      <View style={style.wrapper}>
        <ScrollView>
          <View style={style.topGroup}>
            {backupData?.map((pair) => {
              const [name, key] = getNameKey(pair);
              return renderAccountItem(name, key);
            })}
          </View>
          <View style={style.bottomGroup}>
            <Text style={style.title}>Back up all keys</Text>
            <TouchableOpacity onPress={onSaveAs}>
              <View style={style.saveAsBtn}>
                <Text style={style.desc}>Choose back up option</Text>
                <ArrowRightGreyIcon />
              </View>
            </TouchableOpacity>
            <ButtonBasic
              btnStyle={style.copyAllButton}
              title="Copy all keys"
              onPress={onCopyAll}
            />
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

BackupKeys.defaultProps = {
  backupData: [],
};

BackupKeys.propTypes = {
  backupData: PropTypes.arrayOf(PropTypes.object),
  onSaveAs: PropTypes.func.isRequired,
  onCopyAll: PropTypes.func.isRequired,
  getNameKey: PropTypes.func.isRequired,
};

export default withBackupKeys(BackupKeys);
