import React, { Fragment } from 'react';
import { Box, Button, Heading } from 'grommet';
import { Image, Share } from 'grommet-icons';
import Loading from './Loading';
import Header from './Header';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import AddPhoto from './AddPhoto';
import Photos from './Photos';
import { apiUrl } from './utils';

const Event = ({ token }) => {
  const session = React.useContext(SessionContext);
  const [event, setEvent] = React.useState();
  const [photos, setPhotos] = React.useState();
  const [adding, setAdding] = React.useState();

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
          .then(setPhotos);
      });
  }

  React.useEffect(load, [token, session]);

  const canAdd = event && (!event.locked
    || (session && (session.admin || session.userId === event.userId)));

  return (
    <Photos
      event={event}
      photos={photos}
      onRefresh={load}
      onDelete={(photo) => setPhotos(photos.filter(p => p.id !== photo.id))}
      header={(
        <Fragment>
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
                onAdding={setAdding}
                onAdd={(photo) => setPhotos([ photo, ...photos ])}
              />
            ) : <Box pad="large" />}
          </Header>
          {adding && (
            <Box
              basis="medium"
              background={{ color: 'light-2', opacity: 'medium' }}
              align="center"
              justify="center"
            >
              <Loading Icon={Image} />
            </Box>
          )}
        </Fragment>
      )}
    />
  );
}

export default Event;
