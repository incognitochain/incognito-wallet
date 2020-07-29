import React from 'react';
import { View, Text } from 'react-native';
import PropTypes from 'prop-types';
import Button from '@screens/Home/features/Button';
import { BtnNotification, BtnHasNotification } from '@src/components/Button';
import { useNavigation } from 'react-navigation-hooks';
import routeNames from '@src/router/routeNames';
import { newsSelector } from '@screens/News';
import { useSelector } from 'react-redux';
import { styled } from './Category.styled';
import withCategory from './Category.enhance';

// eslint-disable-next-line react/prop-types
const Title = React.memo(({ title }) => (
  <Text style={styled.title} numberOfLines={1} ellipsizeMode="tail">
    {title}
  </Text>
));

const Category = (props) => {
  const { title, buttons, interactionById, isDisabled, firstChild } = props;
  const { isReadAll } = useSelector(newsSelector);
  const navigation = useNavigation();
  const handleNavNotification = () => navigation.navigate(routeNames.News, {'lastNewsID': isReadAll});
  const renderTitle = () => {
    const titleComp = <Title title={title} />;
    if (!firstChild) {
      return titleComp;
    }
    return (
      <View style={styled.hook}>        
        {titleComp}
        {isReadAll == 0 ? (
          <BtnNotification onPress={handleNavNotification} />
        ) : (
          <BtnHasNotification onPress={handleNavNotification} />
        )}
      </View>
    );
  };
  return (
    <View style={styled.container}>
      {renderTitle()}
      {buttons.map((button) => (
        <Button
          {...button}
          key={button?.id}
          disabled={isDisabled(button)}
          onPress={() => interactionById(button)}
        />
      ))}
    </View>
  );
};

Category.propTypes = {
  title: PropTypes.string.isRequired,
  buttons: PropTypes.array.isRequired,
  interactionById: PropTypes.func.isRequired,
  isDisabled: PropTypes.func.isRequired,
  firstChild: PropTypes.bool.isRequired,
};

export default withCategory(React.memo(Category));
