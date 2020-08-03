import React from 'react';
import PropTypes from 'prop-types';

export const useMigrate = (props) => {
  const [state, setState] = React.useState({
    isFetching: true,
    isFetched: false,
  });
  const { getDataWillMigrate } = props;
  const handleMigrateData = async () => {
    try {
      if (typeof getDataWillMigrate === 'function') {
        await getDataWillMigrate();
      }
    } catch (error) {
      console.log(error);
    } finally {
      await setState({ ...state, isFetched: true, isFetching: false });
    }
  };
  React.useEffect(() => {
    handleMigrateData();
  }, []);
  return { ...state };
};

useMigrate.propTypes = {
  getDataWillMigrate: PropTypes.func.isRequired,
};
