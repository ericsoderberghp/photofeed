import React from 'react';
import { Box, Button, Form, FormField, Heading, Paragraph, Text } from 'grommet';
import { apiUrl } from './utils';

const Start = ({ onSession }) => {
  const [busy, setBusy] = React.useState();
  return (
    <Box fill pad="large" align="center">
      <Heading textAlign="center">Welcome</Heading>
      <Paragraph textAlign="center">
        To start with, we need to know how to identify you. If we've met,
        we'll make sure you are you. If we haven't met, we'll consider this
        an introduction.
      </Paragraph>
      <Form
        data={{ name: '', email: '', password: '' }}
        onSubmit={({ value: user }) => {
          setBusy(true);
          const body = JSON.stringify(user);
          fetch(`${apiUrl}/sessions`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
              'Content-Length': body.length,
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
        <FormField name="name" placeholder="name" required />
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
