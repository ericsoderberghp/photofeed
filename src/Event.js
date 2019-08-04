import React from 'react';
import { Box, Button, Heading, Stack } from 'grommet';
import { Calendar, Image, Share } from 'grommet-icons';
import Loading from './Loading';
import Header from './Header';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import Photos from './Photos';
import AddPhoto from './AddPhoto';
import { apiUrl } from './utils';

const Event = ({ token }) => {
  const session = React.useContext(SessionContext);
  const [event, setEvent] = React.useState();
  const [photos, setPhotos] = React.useState();

  React.useEffect(() => {
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
  }, [token, session]);

  const canAdd = event && (!event.locked
    || (session && (session.admin || session.userId === event.userId)));

  return (
    <Box fill overflow="auto" background="dark-1">
      <Box flex={false}>
        <Stack>
          {!photos ? <Loading Icon={Calendar} /> : (
            <Photos event={event} photos={photos} />
          )}
          <Header overflow="hidden" margin={undefined}>
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
                onAdd={(photo) =>
                  // our proto-photo still needs to be scaled by Photo
                  setPhotos([ photo, ...photos ])
                }
              />
            ) : <Box pad="large" />}
          </Header>
        </Stack>
      </Box>
    </Box>
  );
}

export default Event;
