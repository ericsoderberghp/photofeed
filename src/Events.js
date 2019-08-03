import React from 'react';
import { Box, Button, Form, FormField, Heading, Text } from 'grommet';
import { Add, Close, Share, Trash } from 'grommet-icons';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import { apiUrl } from './utils';

const Events = () => {
  const session = React.useContext(SessionContext);
  const [events, setEvents] = React.useState();
  const [adding, setAdding] = React.useState();
  const [confirmDelete, setConfirmDelete] = React.useState();

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
    <Box fill overflow="auto">
      <Box
        flex={false}
        direction="row"
        justify="between"
        align="center"
        pad={{ left: 'medium' }}
        margin={{ bottom: 'large' }}
      >
        <Heading size="small" margin="none">Events</Heading>
        <RoutedButton path="/" icon={<Close />} hoverIndicator />
      </Box>
      {events ? (
        <Box flex="grow">
          <Box flex="grow">
            {events.map(event => (
              <Box
                key={event.id}
                direction="row"
                justify="between"
                align="center"
                margin={{ bottom: 'medium' }}
              >
                <Box flex>
                  <RoutedButton fill path={`/events/${event.token}`} hoverIndicator>
                    <Box pad="medium">
                      <Text>{event.name}</Text>
                    </Box>
                  </RoutedButton>
                </Box>
                <Box flex={false} direction="row" align="center">
                  <Button
                    icon={<Share />}
                    hoverIndicator
                    onClick={() => navigator.share({
                      title: event.name,
                      url: `/events/${event.token}`,
                    })}
                  />
                  {(event.id === confirmDelete) && (
                    <Button
                      icon={<Trash color="status-critical" />}
                      hoverIndicator
                      onClick={() => {
                        fetch(`${apiUrl}/events/${event.id}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${session.token}`,
                          },
                        })
                          .then(() => setEvents(events.filter(e => e.id !== event.id)))
                          .then(() => setConfirmDelete(undefined));
                      }}
                    />
                  )}
                  <Button
                    icon={<Trash />}
                    hoverIndicator
                    onClick={() =>
                      setConfirmDelete(confirmDelete === event.id ? undefined : event.id)}
                  />
                </Box>
              </Box>
            ))}
            <Button icon={<Add />} hoverIndicator onClick={() => setAdding(!adding)} />
            {adding && (
              <Form
                value={{ name: '', userId: session.userId  }}
                onSubmit={({ value }) => {
                  const body = JSON.stringify(value);
                  fetch(`${apiUrl}/events`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${session.token}`,
                      'Content-Type': 'application/json; charset=UTF-8',
                      'Content-Length': body.length,
                    },
                    body,
                  })
                    .then(response => response.json())
                    .then((event) => setEvents([event, ...events]))
                    .then(() => setAdding(false));
                }}
              >
                <FormField name="name" placeholder="name" required />
                <Box align="center" margin={{ top: 'large' }}>
                  <Button type="submit" label="Add" />
                </Box>
              </Form>
            )}
          </Box>
          {session.admin && (
            <Box flex={false} alignSelf="center" margin="large">
              <RoutedButton path="/users" label="Users" />
            </Box>
          )}
        </Box>
      ) : (
        <Box pad="medium" animation="fadeIn">
          <Text>Loading ...</Text>
        </Box>
      )}
    </Box>
  );
}

export default Events;
