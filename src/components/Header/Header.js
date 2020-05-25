import React from 'react';
import { View, Text, TouchableWithoutFeedback } from 'react-native';
import { BtnCircleBack } from '@src/components/Button';
import PropTypes from 'prop-types';
import { useNavigation } from 'react-navigation-hooks';
import { styled, styledHeaderTitle } from './Header.styled';
import SearchBox from './Header.searchBox';
import withHeader from './Header.enhance';

export const HeaderContext = React.createContext({});

const HeaderTitle = () => {
  const { headerProps } = React.useContext(HeaderContext);
  const { onHandleSearch, title, titleStyled, canSearch } = headerProps;
  return (
    <TouchableWithoutFeedback onPress={onHandleSearch}>
      <Text
        numberOfLines={1}
        style={[
          styledHeaderTitle.title,
          canSearch && styledHeaderTitle.searchStyled,
          titleStyled,
        ]}
      >
        {title}
      </Text>
    </TouchableWithoutFeedback>
  );
};

const Header = props => {
  const { rightHeader, toggleSearch, onGoBack } = props;
  const { goBack } = useNavigation();
  const handleGoBack = () =>
    typeof onGoBack === 'function' ? onGoBack() : goBack();
  return (
    <HeaderContext.Provider
      value={{
        headerProps: props,
      }}
    >
      <View style={styled.container}>
        <BtnCircleBack onPress={handleGoBack} />
        {toggleSearch ? <SearchBox /> : <HeaderTitle />}
        {!!rightHeader && rightHeader}
      </View>
    </HeaderContext.Provider>
  );
};

Header.defaultProps = {
  rightHeader: null,
  titleStyled: null,
  canSearch: false,
  dataSearch: [],
  onGoBack: null,
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  rightHeader: PropTypes.element,
  titleStyled: PropTypes.any,
  canSearch: PropTypes.bool,
  dataSearch: PropTypes.array,
  toggleSearch: PropTypes.bool.isRequired,
  onGoBack: PropTypes.func,
};

export default withHeader(React.memo(Header));
