import React from 'react';
import { Box, Heading } from 'grommet';
import { Calendar, Image } from 'grommet-icons';
import Loading from './Loading';
import Header from './Header';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import Photos from './Photos';
import { apiUrl } from './utils';

const Feed = () => {
  const session = React.useContext(SessionContext);
  const [photos, setPhotos] = React.useState();
  const [refreshing, setRefreshing] = React.useState();

  React.useEffect(() => {
    document.title = 'Photo Feed';
  }, []);

  const load = () => {
    fetch(`${apiUrl}/photos`,
      (session
        ? { headers: { 'Authorization': `Bearer ${session.token}` } }
        : undefined),
    )
      .then(response => response.json())
      .then(setPhotos)
      .then(() => setRefreshing(false));
  }

  React.useEffect(load, [session]);

  React.useEffect(() => {
    let scrollTimer;

    const onScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (window.scrollY < 0) {
          // user is holding the scroll position down, refresh
          setRefreshing(true);
          load();
        }
      }, 500);
    }

    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  });

  return (
    <Box
      background={refreshing ? 'accent-1' : 'dark-1'}
      style={{ minHeight: '100vh' }}
    >
      <Header
        margin={undefined}
        background={{ color: 'dark-1', opacity: 'medium' }}
        style={{ position: 'absolute', top: 0, width: '100vw', zIndex: 10 }}
      >
        <RoutedButton path="/events" icon={<Image />} hoverIndicator />
        <Heading size="small" margin="none">Photo Feed</Heading>
        <Box pad="large" />
      </Header>
      {!photos ? <Loading Icon={Calendar} /> : (
          <Photos photos={photos} />
        )}
    </Box>
  );
}

export default Feed;
