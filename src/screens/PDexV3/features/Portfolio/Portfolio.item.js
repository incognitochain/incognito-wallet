import {Row, RowSpaceText} from '@src/components';
import {Text} from '@src/components/core';
import React from 'react';
import {TouchableOpacity} from 'react-native';
import {batch, useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {actionSetPoolModal} from '@screens/PDexV3/features/Portfolio/Portfolio.actions';
import {COLORS} from '@src/styles';
import {actionToggleModal} from '@components/Modal';
import ModalBottomSheet from '@components/Modal/features/ModalBottomSheet';
import PortfolioModal from '@screens/PDexV3/features/Portfolio/Portfolio.detail';
import {portfolioItemStyled as styled} from './Portfolio.styled';
import {getDataByShareIdSelector} from './Portfolio.selector';

const Hook = React.memo(({ label, value }) => (
  <RowSpaceText
    label={label}
    value={value}
    style={{marginBottom: 2}}
    leftStyle={{color: COLORS.lightGrey33}}
    rightStyle={{color: COLORS.black1}}
  />
));

const Extra = React.memo(({ shareId }) => {
  const data = useSelector(getDataByShareIdSelector)(shareId);
  const { token1, token2, apy } = data || {};
  return (
    <Row style={styled.extraContainer} centerVertical spaceBetween>
      <Text style={styled.extraLabel}>
        {`${token1?.symbol} / ${token2?.symbol}`}
      </Text>
      <Text style={styled.extraLabel}>
        {`${apy}% APY`}
      </Text>
    </Row>
  );
});

const PortfolioItem = ({ shareId, isLast, onWithdrawFeeLP }) => {
  const dispatch = useDispatch();
  const data = useSelector(getDataByShareIdSelector)(shareId);
  if (!data) {
    return null;
  }
  const onPress = () => {
    batch(() => {
      dispatch(actionToggleModal({
        visible: true,
        shouldCloseModalWhenTapOverlay: true,
        data: (
          <ModalBottomSheet
            style={{ height: '60%' }}
            customContent={
              <PortfolioModal shareId={data.shareId} onWithdrawFeeLP={onWithdrawFeeLP} />
            }
          />
        )})
      );
    });
  };
  const { hookFactories } = data || {};
  return (
    <TouchableOpacity
      style={[styled.container, isLast && { borderBottomWidth: 0, marginBottom: 50 }]}
      onPress={onPress}
      key={shareId}
    >
      <Extra shareId={shareId} />
      {hookFactories.map((hook) => (
        <Hook {...hook} key={hook.label} />
      ))}
    </TouchableOpacity>
  );
};

PortfolioItem.propTypes = {
  shareId: PropTypes.string.isRequired,
  isLast: PropTypes.bool.isRequired,
  onWithdrawFeeLP: PropTypes.func.isRequired,
};

Extra.propTypes = {
  shareId: PropTypes.string.isRequired
};

Hook.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

export default React.memo(PortfolioItem);
