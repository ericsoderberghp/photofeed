import React from 'react';
import { Box, Text } from 'grommet';
import { Add, Calendar, Group } from 'grommet-icons';
import Screen from './components/Screen';
import Loading from './components/Loading';
import Controls from './components/Controls';
import SessionContext from './SessionContext';
import ControlButton from './components/ControlButton';
import RoutedButton from './components/RoutedButton';
import { apiUrl } from './utils';

const Events = () => {
  const session = React.useContext(SessionContext);
  const [events, setEvents] = React.useState();

  React.useEffect(() => {
    fetch(`${apiUrl}/events`, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
      },
    })
      .then(response => response.json())
      .then(setEvents)
      .catch(() => setEvents([]));
  }, [session]);

  return (
    <Screen
      controls={(
        <Controls
          left={session.admin
            ? <ControlButton path="/users" Icon={Group} /> : undefined}
          label="Events"
          right={<ControlButton path="/events/add" Icon={Add} />}
        />
      )}
    >
      {!events ? (
        <Box flex justify="center" align="center">
          <Loading Icon={Calendar} />
        </Box>
      ) : (
        <Box flex="grow">
          <Box>
            <RoutedButton fill path="/" hoverIndicator>
              <Box pad={{ horizontal: 'large', vertical: 'medium' }}>
                <Text weight="bold">Feed</Text>
              </Box>
            </RoutedButton>
          </Box>
          {events.map(event => (
            <Box key={event.id}>
              <RoutedButton
                fill
                path={`/events/${encodeURIComponent(event.token)}`}
                hoverIndicator
              >
                <Box pad={{ horizontal: 'large', vertical: 'medium' }}>
                  <Text weight="bold">{event.name}</Text>
                </Box>
              </RoutedButton>
            </Box>
          ))}
        </Box>
      )}
    </Screen>
  );
}

export default Events;
