import React from 'react';
import { Box, Button, Heading, Keyboard } from 'grommet';
import { Calendar, Image, Share } from 'grommet-icons';
import Loading from './Loading';
import Header from './Header';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import Photos from './Photos';
import AddPhoto from './AddPhoto';
import Player from './Player';
import { apiUrl } from './utils';

const Event = ({ token }) => {
  const session = React.useContext(SessionContext);
  const [event, setEvent] = React.useState();
  const [photos, setPhotos] = React.useState();
  const [refreshing, setRefreshing] = React.useState();
  const [play, setPlay] = React.useState();

  const load = () => {
    fetch(`${apiUrl}/events?token=${token}`, 
      (session
        ? { headers: { 'Authorization': `Bearer ${session.token}` } }
        : undefined),
    )
      .then(response => response.json())
      .then((event) => {
        document.title = `${event.name} - Photo Feed`;
        setEvent(event);
        fetch(`${apiUrl}/photos?eventId=${event.id}`, 
          (session
            ? { headers: { 'Authorization': `Bearer ${session.token}` } }
            : undefined),
        )
          .then(response => response.json())
          .then(setPhotos)
          .then(() => setRefreshing(false));
      });
  }

  React.useEffect(load, [token, session]);

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

  React.useEffect(() => {
    const onTouchStart = (event) => {
      if (event.touches.length === 3) {
        setPlay(true);
      }
    }

    document.addEventListener('touchstart', onTouchStart);
    return () => document.removeEventListener('touchstart', onTouchStart);
  }, [play]);

  if (play) {
    return <Player event={event} photos={photos} onDone={() => setPlay(false)} />;
  }

  const onKeyDown = (event) => {
    if (event.key === 'p') {
      setPlay(true);
    }
  }

  const canAdd = event && (!event.locked
    || (session && (session.admin || session.userId === event.userId)));

  return (
    <Keyboard target="document" onKeyDown={onKeyDown}>
      <Box
        background={refreshing ? 'accent-1' : 'dark-1'}
        style={{ minHeight: '100vh' }}
      >
        <Header
          overflow="hidden"
          margin={undefined}
          background={{ color: 'dark-1', opacity: 'medium' }}
          style={{ position: 'absolute', top: 0, width: '100vw', zIndex: 10 }}
        >
          {(session && session.admin)
            ? <RoutedButton path="/events" icon={<Image />} hoverIndicator />
            : (navigator.share ? (
              <Button
                icon={<Share />}
                hoverIndicator
                onClick={() => navigator.share({
                  title: event.name,
                  text: event.name,
                  url: `/events/${encodeURIComponent(event.token)}`,
                })}
              />
            ) : <Box pad="large" />)
          }
          <Heading size="small" margin="none">{event ? event.name : ''}</Heading>
          {canAdd ? (
            <AddPhoto
              session={session}
              event={event}
              onAdd={(photo) => {
                // our proto-photo still needs to be scaled by Photo
                setPhotos([ photo, ...photos ]);
              }}
            />
          ) : <Box pad="large" />}
        </Header>
        {!photos ? <Loading Icon={Calendar} /> : (
          <Photos
            event={event}
            photos={photos}
            onDelete={(photo) => setPhotos(photos.filter(p => p.id !== photo.id))}
          />
        )}
      </Box>
    </Keyboard>
  );
}

export default Event;
