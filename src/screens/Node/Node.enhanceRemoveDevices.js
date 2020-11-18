import React, {useState} from 'react';
import ErrorBoundary from '@src/components/ErrorBoundary';
import LocalDatabase from '@utils/LocalDatabase';
import { updateListNodeDevice } from '@screens/Node/Node.actions';
import { useDispatch } from 'react-redux';

const enhanceRemoveDevices = WrappedComp => props => {
  const { listDevice } = props;
  const dispatch = useDispatch();
  const [removingDevice, setRemovingDevice] = useState(null);

  const handlePressRemoveDevice = async (item) => {
    setRemovingDevice(item);
  };

  const handleConfirmRemoveDevice = async () => {
    const newList = await LocalDatabase.removeDevice(removingDevice, listDevice);
    setRemovingDevice(null);
    dispatch(updateListNodeDevice({
      listDevice: newList,
    }));
  };

  const handleCancelRemoveDevice = () => {
    setRemovingDevice(null);
  };

  return (
    <ErrorBoundary>
      <WrappedComp
        {...{
          ...props,
          removingDevice,

          handlePressRemoveDevice,
          handleConfirmRemoveDevice,
          handleCancelRemoveDevice
        }}
      />
    </ErrorBoundary>
  );
};

export default enhanceRemoveDevices;
