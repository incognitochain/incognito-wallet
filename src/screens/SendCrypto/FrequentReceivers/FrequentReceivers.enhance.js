import React from 'react';
import { ExHandler } from '@src/services/exception';
import { useNavigationParam, useNavigation } from 'react-navigation-hooks';
import _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { receiversSelector } from '@src/redux/selectors/receivers';
import { actionDelete } from '@src/redux/actions/receivers';
import routeNames from '@src/router/routeNames';
import { compose } from 'recompose';
import { useSearchBox } from '@src/components/Header';
import withSync from './FrequentReceivers.withSync';

const enhance = (WrappedComp) => (props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const keySave = useNavigationParam('keySave');
  const onSelectedItem = useNavigationParam('onSelectedItem');
  const disabledSwipe = useNavigationParam('disabledSwipe');
  const disabledSelectedAddr =
    useNavigationParam('disabledSelectedAddr') || false;
  const { receivers } = useSelector(receiversSelector)[keySave];
  const [result, keySearch] = useSearchBox({
    data: receivers,
    handleFilter: () => [
      ...receivers.filter(
        (item) =>
          _.includes(item?.name.toLowerCase(), keySearch) ||
          _.includes(item?.address.toLowerCase(), keySearch),
      ),
    ],
  });
  const onSelectedAddress = async (receiver = { name: '', address: '' }) => {
    if (typeof onSelectedItem === 'function') {
      return onSelectedItem(receiver);
    }
  };
  const onUpdateReceiver = async (info) => {
    navigation.navigate(routeNames.FrequentReceiversForm, {
      info: {
        ...info,
        toAddress: info?.address,
      },
      keySave,
      action: 'update',
      headerTitle: 'Edit',
    });
  };
  const onDeleteReceiver = async (receiver) => {
    try {
      await dispatch(
        actionDelete({
          keySave,
          receiver,
        }),
      );
    } catch (error) {
      new ExHandler(error).showErrorToast();
    }
  };

  return (
    <WrappedComp
      {...{
        ...props,
        data: result.sort((a, b) => a.name.localeCompare(b.name)),
        keySearch,
        onSelectedAddress,
        disabledSwipe,
        onUpdate: onUpdateReceiver,
        onDelete: onDeleteReceiver,
        shouldDisabledItem: typeof onSelectedItem !== 'function',
        disabledSelectedAddr,
        hideRecently: keySearch.length > 0,
        isEmpty: receivers.length === 0,
      }}
    />
  );
};

export default compose(
  withSync,
  enhance,
);
