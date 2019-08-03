import React from 'react';
import { Box, Heading, Paragraph, Text } from 'grommet';
import { Apps } from 'grommet-icons';
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
        <Box
          flex={false}
          direction="row"
          justify="between"
          align="center"
          overflow="hidden"
        >
          {session && <RoutedButton path="/events" icon={<Apps />} hoverIndicator />}
          <Heading size="small" margin="none">{event ? event.name : ''}</Heading>
          {event && (
            <AddPhoto
              session={session}
              event={event}
              onAdd={(photo) =>
                // our proto-photo still needs to be scaled by Photo
                setEvent({
                  ...event,
                  photos: [
                    { ...photo, userId: session.userId, eventId: event.id },
                    ...event.photos,
                  ],
                })
              }
            />
          )}
        </Box>
        {event ? (
          <Box flex={false}>
            {event.photos.map(photo => (
              <Photo
                key={photo.name}
                photo={photo}
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
        ) : (
          <Box
            flex={false}
            margin="medium"
            pad="xlarge"
            justify="center"
            align="center"
            background="dark-2"
            animation="fadeIn"
            round
          >
            <Text>Loading ...</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Event;
