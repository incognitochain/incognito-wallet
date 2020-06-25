import React from 'react';
import { View, Text, BackHandler } from 'react-native';
import { BtnCircleBack } from '@src/components/Button';
import PropTypes from 'prop-types';
import { useFocusEffect, useNavigation } from 'react-navigation-hooks';
import { BtnSelectAccount } from '@screens/SelectAccount';
import debounce from 'lodash/debounce';
import { TouchableOpacity } from '@src/components/core';
import NavigationService from '@src/services/NavigationService';
import { styled, styledHeaderTitle } from './Header.styled';
import SearchBox from './Header.searchBox';
import withHeader from './Header.enhance';

export const HeaderContext = React.createContext({});

export const HeaderTitle = () => {
  const { headerProps } = React.useContext(HeaderContext);
  const {
    onHandleSearch,
    title,
    titleStyled,
    canSearch,
    customHeaderTitle,
    styledContainerHeaderTitle,
  } = headerProps;
  const Title = () => (
    <View style={[styledHeaderTitle.container]}>
      <View
        style={[styledHeaderTitle.containerTitle, styledContainerHeaderTitle]}
      >
        <Text
          style={[
            styledHeaderTitle.title,
            canSearch && styledHeaderTitle.searchStyled,
            titleStyled,
          ]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {customHeaderTitle && customHeaderTitle}
    </View>
  );
  if (!canSearch) {
    return <Title />;
  }
  return (
    <TouchableOpacity
      style={styledHeaderTitle.container}
      onPress={onHandleSearch}
    >
      <Title />
    </TouchableOpacity>
  );
};
const Header = ({
  title,
  rightHeader,
  titleStyled,
  canSearch,
  dataSearch,
  toggleSearch,
  accountSelectable,
  onGoBack,
  onHandleSearch,
  style,
  onSubmit,
  isNormalSearch,
  onTextSearchChange,
  customHeaderTitle,
  styledContainerHeaderTitle,
  placeHolder,
}) => {
  const { goBack } = useNavigation();
  const handleGoBack = () =>
    typeof onGoBack === 'function' ? onGoBack() : goBack();
  const _handleGoBack = debounce(handleGoBack, 100);

  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        _handleGoBack();
        return true;
      },
    );
    return () => backHandler.remove();
  });

  const renderHeaderTitle = () => {
    if (toggleSearch) {
      if (isNormalSearch) {
        return (
          <SearchBox
            placeHolder={placeHolder || ''}
            onSubmit={isNormalSearch ? onSubmit : () => {}}
            onChange={(text) =>
              isNormalSearch ? onTextSearchChange(text) : () => {}
            }
            isNormalSearch={isNormalSearch}
          />
        );
      }
      return <SearchBox title={title} />;
    }
    return <HeaderTitle />;
  };
  return (
    <HeaderContext.Provider
      value={{
        headerProps: {
          title,
          rightHeader,
          titleStyled,
          canSearch,
          dataSearch,
          toggleSearch,
          onHandleSearch,
          customHeaderTitle,
          styledContainerHeaderTitle,
        },
      }}
    >
      <View style={[styled.container, style]}>
        <BtnCircleBack onPress={_handleGoBack} />
        {renderHeaderTitle()}
        {!!rightHeader && rightHeader}
        {accountSelectable && (
          <View>
            <BtnSelectAccount />
          </View>
        )}
      </View>
    </HeaderContext.Provider>
  );
};
Header.defaultProps = {
  rightHeader: null,
  titleStyled: null,
  canSearch: false,
  dataSearch: [],
  accountSelectable: false,
  onGoBack: null,
  style: null,
  onSubmit: () => {},
  onTextSearchChange: () => {},
  isNormalSearch: false,
  customHeaderTitle: null,
  styledContainerHeaderTitle: null,
  placeHolder: ''
};
Header.propTypes = {
  title: PropTypes.string.isRequired,
  rightHeader: PropTypes.element,
  titleStyled: PropTypes.any,
  canSearch: PropTypes.bool,
  dataSearch: PropTypes.array,
  toggleSearch: PropTypes.bool.isRequired,
  accountSelectable: PropTypes.bool,
  onGoBack: PropTypes.func,
  onHandleSearch: PropTypes.func.isRequired,
  style: PropTypes.any,
  onSubmit: PropTypes.func,
  onTextSearchChange: PropTypes.func,
  isNormalSearch: PropTypes.bool,
  customHeaderTitle: PropTypes.element,
  styledContainerHeaderTitle: PropTypes.any,
  placeHolder: PropTypes.string,
};
export default withHeader(React.memo(Header));
