import React from 'react';
import { Box, Button, Form, FormField, Heading, Paragraph } from 'grommet';
import { uuidv4 } from './utils';

const Start = ({ onActiveEvent, onUser }) => {
  return (
    <Box fill pad="large" align="center">
      <Heading textAlign="center">Welcome</Heading>
      <Paragraph textAlign="center">We need an id so we can share.</Paragraph>
      <Form
        data={{ id: '', password: '' }}
        onSubmit={({ value: user }) => {
          // TODO: authenticate or create for real
          localStorage.setItem('user', JSON.stringify(user));
          // when creating, create personal event
          const myEvent = {
            id: uuidv4(),
            name: user.id,
            visible: true,
            admins: [user.id],
          };
          localStorage.setItem(myEvent.id, JSON.stringify(myEvent));
          const stored = localStorage.getItem('events');
          const events = stored ? JSON.parse(stored) : [];
          localStorage.setItem('events', JSON.stringify([...events, myEvent.id]));
          localStorage.setItem('activeEvent', myEvent.id);
          onActiveEvent(myEvent);
          onUser(user)
        }}
      >
        <FormField name="id" placeholder="id" required />
        <FormField name="password" placeholder="password" type="password" required />
        <Box align="center" margin={{ top: 'large' }}>
          <Button type="submit" label="Start" />
        </Box>
      </Form>
    </Box>
  );
}

export default Start;
