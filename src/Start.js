import React from 'react';
import { Box, Button, Form, FormField, Heading, Paragraph, Text } from 'grommet';
import { apiUrl } from './utils';

const Start = ({ onSession }) => {
  const [busy, setBusy] = React.useState();
  return (
    <Box fill pad="large" align="center">
      <Heading textAlign="center">Welcome</Heading>
      <Paragraph textAlign="center">
        To start with, we need to verify you are you.
      </Paragraph>
      <Form
        data={{ email: '', password: '' }}
        onSubmit={({ value: user }) => {
          setBusy(true);
          const body = JSON.stringify(user);
          fetch(`${apiUrl}/sessions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
            },
            body,
          })
            .then(response => response.json())
            .then((session) => {
              localStorage.setItem('session', JSON.stringify(session));
              onSession(session);
            })
            .catch(() => setBusy(false));
        }}
      >
        <FormField name="email" placeholder="email" required />
        <FormField name="password" placeholder="password" type="password" required />
        <Box align="center" margin={{ top: 'large' }}>
          {busy
            ? <Text>Just a sec ...</Text>
            : <Button type="submit" primary label="Start" />
          }
        </Box>
      </Form>
    </Box>
  );
}

export default Start;
