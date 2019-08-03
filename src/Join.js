import React from 'react';
import { Box, Heading, Paragraph } from 'grommet';
import { Pusher } from './Router';
import { apiUrl } from './utils';

const Join = ({ token, push }) => {

  React.useEffect(() => {
    const body = JSON.stringify({ userToken: token });
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
        push('/events');
      });
  }, [token, push]);

  return (
    <Box fill overflow="auto">
      <Box
        flex
        justify="center"
        align="center"
        animation="fadeIn"
      >
        <Heading textAlign="center">Welcome!</Heading>
        <Paragraph>Give us a sec to get you started ...</Paragraph>
      </Box>
    </Box>
  );
}

export default ({ token }) => (
  <Pusher>
    {(push) => <Join token={token} push={push} />}
  </Pusher>
);
