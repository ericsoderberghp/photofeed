import React from 'react';
import { Box, Button, CheckBox, Form, FormField, Heading, Text } from 'grommet';
import { Close, User as UserIcon } from 'grommet-icons';
import Loading from './Loading';
import Header from './Header';
import SessionContext from './SessionContext';
import { Pusher } from './Router';
import RoutedButton from './RoutedButton';
import { apiUrl } from './utils';

const EditUser = ({ id, push }) => {
  const session = React.useContext(SessionContext);
  const [user, setUser] = React.useState();
  const [busy, setBusy] = React.useState();

  React.useEffect(() => {
    fetch(`${apiUrl}/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
      },
    })
      .then(response => response.json())
      .then((user) => {
        document.title = `${user.name} - Photo Feed';`
        setUser(user);
      });
  }, [id, session]);

  return (
    <Box>
      <Header margin={undefined}>
        <Box pad="large" />
        <Heading size="small" margin="none">{user ? user.name : ''}</Heading>
        <RoutedButton path="/users" icon={<Close />} hoverIndicator />
      </Header>
      {!user ? <Loading Icon={UserIcon} /> : (
        <Box
          flex={false}
          pad={{ horizontal: 'large', vertical: 'xlarge' }}
          background="neutral-3"
        >
          <Form
            value={{ name: user.name, email: user.email, admin: user.admin, password: '' }}
            onSubmit={({ value: nextUser }) => {
              setBusy(true);
              fetch(`${apiUrl}/users/${id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${session.token}`,
                  'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify(nextUser),
              })
                .then(response => response.json())
                .then(() => push('/users'))
                .catch(() => setBusy(false));
            }}
          >
            <FormField name="name" placeholder="name" required />
            <FormField name="email" placeholder="email" required />
            <FormField name="password" placeholder="new password" type="password" />
            <FormField name="admin" pad component={CheckBox} label="administrator?" />
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
    {(push) => <EditUser id={id} push={push} />}
  </Pusher>
);
