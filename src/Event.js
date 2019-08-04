import React from 'react';
import { Box, Button, Heading, Paragraph } from 'grommet';
import { Blank, Calendar, Image, Share } from 'grommet-icons';
import Loading from './Loading';
import Header from './Header';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import Photo from './Photo';
import AddPhoto from './AddPhoto';
import { apiUrl } from './utils';

const Event = ({ token }) => {
  const session = React.useContext(SessionContext);
  const [event, setEvent] = React.useState();

  React.useEffect(() => {
    fetch(`${apiUrl}/events/${token}`, 
      (session
        ? { headers: { 'Authorization': `Bearer ${session.token}` } }
        : undefined),
    )
      .then(response => response.json())
      .then((event) => {
        document.title = event.name;
        setEvent(event);
      });
  }, [token, session]);

  return (
    <Box fill overflow="auto" background="dark-1">
      <Box flex={false}>
        <Header overflow="hidden" margin={undefined}>
          {(session && session.adming)
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
            ) : <Blank />)
          }
          <Heading size="small" margin="none">{event ? event.name : ''}</Heading>
          {event && (
            <AddPhoto
              session={session}
              event={event}
              onAdd={(photo) =>
                // our proto-photo still needs to be scaled by Photo
                setEvent({
                  ...event,
                  photos: [ photo, ...event.photos ],
                })
              }
            />
          )}
        </Header>
        {!event ? <Loading Icon={Calendar} /> : (
          <Box flex={false}>
            {event.photos.map(photo => (
              <Photo
                key={photo.name}
                photo={photo}
                event={event}
                onDelete={() => {
                  setEvent({
                    ...event,
                    photos: event.photos.filter(p => p.id !== photo.id),
                  })
                }}
              />
            ))}
            {!event.photos.length && (
              <Box basis="medium" align="center" justify="center">
                <Paragraph>We need you to add some photos!</Paragraph>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Event;
