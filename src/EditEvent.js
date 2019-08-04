import React from 'react';
import { Box, Button, CheckBox, Form, FormField, Heading, Text } from 'grommet';
import { Calendar, Close } from 'grommet-icons';
import Loading from './Loading';
import Header from './Header';
import SessionContext from './SessionContext';
import { Pusher } from './Router';
import RoutedButton from './RoutedButton';
import { apiUrl } from './utils';

const EditEvent = ({ id, push }) => {
  const session = React.useContext(SessionContext);
  const [event, setEvent] = React.useState();
  const [busy, setBusy] = React.useState();

  React.useEffect(() => {
    fetch(`${apiUrl}/events/${id}`, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
      },
    })
      .then(response => response.json())
      .then((event) => {
        document.title = `${event.name} - Photo Feed`;
        setEvent(event);
      });
  }, [id, session]);

  return (
    <Box fill overflow="auto">
      <Header margin={undefined}>
        <Box pad="large" />
        <Heading size="small" margin="none">{event ? event.name : ''}</Heading>
        <RoutedButton path="/events" icon={<Close />} hoverIndicator />
      </Header>
      {!event ? <Loading Icon={Calendar} /> : (
        <Box
          flex={false}
          pad={{ horizontal: 'medium', vertical: 'large' }}
          background="neutral-3"
        >
          <Form
            value={{ name: event.name, locked: event.locked }}
            onSubmit={({ value: nextEvent }) => {
              setBusy(true);
              fetch(`${apiUrl}/events/${event.id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${session.token}`,
                  'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify(nextEvent),
              })
                .then(response => response.json())
                .then(() => push('/events'))
                .catch(() => setBusy(false));
            }}
          >
            <FormField name="name" placeholder="name" required />
            <FormField name="locked" pad component={CheckBox} label="locked?" />
            <Box align="center" margin={{ top: 'large' }}>
              {busy
                ? <Text>Just a sec ...</Text>
                : <Button type="submit" primary label="Update" />
              }
            </Box>
          </Form>
        </Box>
      )}
    </Box>
  );
}

export default ({ id }) => (
  <Pusher>
    {(push) => <EditEvent id={id} push={push} />}
  </Pusher>
);
