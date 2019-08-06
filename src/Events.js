import React from 'react';
import { Box, Button, Form, FormField, Heading, Text } from 'grommet';
import { Calendar, Edit, Previous, Share, Trash } from 'grommet-icons';
import Loading from './Loading';
import Header from './Header';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import { apiUrl } from './utils';

const Events = () => {
  const session = React.useContext(SessionContext);
  const [events, setEvents] = React.useState();
  const [add, setAdd] = React.useState();
  const [adding, setAdding] = React.useState();
  const [confirmDelete, setConfirmDelete] = React.useState();
  const [deleting, setDeleting] = React.useState();

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
    <Box>
      <Header>
        <RoutedButton path="/" icon={<Previous />} hoverIndicator />
        <Heading size="small" margin="none">Events</Heading>
        <Box pad="large" />
      </Header>

      {!events ? <Loading Icon={Calendar} /> : (
        <Box flex="grow">
          <Box flex="grow">
            {events.map(event => (
              <Box
                key={event.id}
                direction="row"
                justify="between"
                align="center"
                margin={{ bottom: 'medium' }}
                background={deleting === event.id
                  ? { color: 'dark-2', opacity: 'medium' } : undefined}
              >
                <Box flex>
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
                <Box flex={false} direction="row" align="center">
                  {navigator.share && (event.id !== confirmDelete) && (
                    <Button
                      icon={<Share />}
                      hoverIndicator
                      onClick={() => navigator.share({
                        title: `${event.name} - Photo Feed`,
                        text: `${event.name} - Photo Feed`,
                        url: `/events/${encodeURIComponent(event.token)}`,
                      })}
                    />
                  )}
                  {(event.id !== confirmDelete) && (
                    <RoutedButton
                      path={`/events/edit/${event.id}`}
                      icon={<Edit />}
                      hoverIndicator
                    />
                  )}
                  {(event.id === confirmDelete) && (
                    <Button
                      icon={<Trash color="status-critical" />}
                      hoverIndicator
                      onClick={() => {
                        setDeleting(event.id);
                        setConfirmDelete(undefined);
                        fetch(`${apiUrl}/events/${event.id}`, {
                          method: 'DELETE',
                          headers: {
                            'Authorization': `Bearer ${session.token}`,
                          },
                        })
                        .then(() => setDeleting(undefined))
                        .then(() => setEvents(events.filter(e => e.id !== event.id)));
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

            <Box align="center" margin="large">
              <Button label="New Event" onClick={() => setAdd(!add)} />
            </Box>
            {add && (
              <Box
                pad={{ horizontal: 'large', vertical: 'xlarge' }}
                background="neutral-3"
              >
                <Form
                  value={{ name: '', userId: session.userId  }}
                  onSubmit={({ value }) => {
                    setAdding(true);
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
                      .then(() => setAdd(false))
                      .then(() => setAdding(false))
                      .catch(() => setAdding(false));
                  }}
                >
                  <FormField name="name" placeholder="name" required />
                  <Box align="center" margin={{ top: 'large' }}>
                    {adding
                      ? <Text>Just a sec ...</Text>
                      : <Button type="submit" primary label="Add Event" />}
                  </Box>
                </Form>
              </Box>
            )}
          </Box>

          {session.admin && (
            <Box flex={false} alignSelf="center" margin="xlarge">
              <RoutedButton path="/users" label="Users" />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default Events;
