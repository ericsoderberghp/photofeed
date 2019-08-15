import React from 'react';
import { Box, Button, Form, FormField, Text } from 'grommet';
import { Calendar, Previous } from 'grommet-icons';
import { RouterContext } from './Router';
import Screen from './components/Screen';
import Loading from './components/Loading';
import Controls from './components/Controls';
import SessionContext from './SessionContext';
import ControlButton from './components/ControlButton';
import { apiUrl } from './utils';

const AddEvent = () => {
  const session = React.useContext(SessionContext);
  const { push } = React.useContext(RouterContext);
  const [adding, setAdding] = React.useState();
  return (
    <Screen
      controls={(
        <Controls
          left={<ControlButton path="/events" Icon={Previous} />}
          label="New Event"
        />
      )}
    >
      {adding ? <Loading Icon={Calendar} /> : (
        <Box flex={false} alignSelf="center" width="large" pad="large">
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
                .then(() => push('/events'))
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
    </Screen>
  );
}

export default AddEvent;
