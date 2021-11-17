import React, {memo} from 'react';
import {TouchableOpacity, View} from 'react-native';
import PropTypes from 'prop-types';
import {useDispatch, useSelector} from 'react-redux';
import {actionReadNews, newsSelector} from '@screens/News';
import withNews from '@screens/News/News.enhance';
import TextMarquee from '@screens/MainTabBar/features/Home/AutoScrollText';
import {homeStyled} from '@screens/MainTabBar/MainTabBar.styled';
import {HamburgerIcon, SpeakerIcon} from '@components/Icons';
import routeNames from '@routers/routeNames';
import {useNavigation} from 'react-navigation-hooks';

const NotificationBar = ({ handleFetchNews }) => {
  const { data } = useSelector(newsSelector);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const handleNavNotification = () => navigation.navigate(routeNames.News);
  const latestNew = React.useMemo(() => {
    const news = (data || []).sort((a, b) => a?.Type - b?.Type).map((category) => category);
    if (news && news.length > 0 && news[0].ListNews && news[0].ListNews.length > 0) {
      return news[0].ListNews[0];
    }
    return undefined;
  }, [data]);

  React.useEffect(() => {
    handleFetchNews();
  }, []);
  if (!latestNew) return;

  return (
    <TouchableOpacity
      style={homeStyled.wrapNotify}
      onPress={() => {
        if (latestNew.More) {
          dispatch(actionReadNews(latestNew?.ID));
          navigation.navigate(routeNames.Community, {
            uri: latestNew.More,
          });
        }
      }}
    >
      <View style={{ width: 22, alignItems: 'flex-start' }}>
        <SpeakerIcon />
      </View>
      <View style={{ flex: 1 }}>
        <TextMarquee
          style={homeStyled.notifyText}
          duration={7000}
          loop
          repeatSpacer={50}
          marqueeDelay={500}
          marqueeOnMount
          animationType="scroll"
        >
          {latestNew.Title}
        </TextMarquee>
      </View>
      <TouchableOpacity style={{ width: 22, alignItems: 'flex-end' }} onPress={handleNavNotification}>
        <HamburgerIcon />
      </TouchableOpacity>
    </TouchableOpacity>

  );
};

NotificationBar.propTypes = {
  handleFetchNews: PropTypes.func.isRequired
};

export default withNews(memo(NotificationBar));
