import React, {memo, useMemo} from 'react';
import PropTypes from 'prop-types';
import style from '@screens/Node/style';
import routeNames from '@routers/routeNames';
import BtnAdd from '@components/Button/BtnAdd';
import {useNavigation} from 'react-navigation-hooks';
import {Header} from '@src/components';

const HeaderNode = (props) => {
  const { disable }   = props;
  const navigation    = useNavigation();

  const RightButton = useMemo(() => {
    if (disable) return null;
    return (
      <BtnAdd
        btnStyle={style.rightButton}
        onPress={() => navigation.navigate(routeNames.AddNode)}
      />
    );
  }, [disable]);

  return (
    <Header
      title='Power'
      style={{ paddingHorizontal: 25 }}
      rightHeader={RightButton}
    />
  );
};

HeaderNode.propTypes = {
  disable: PropTypes.bool.isRequired
};

export default memo(HeaderNode);