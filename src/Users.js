import React from 'react';
import { Box, Button, CheckBox, Form, FormField, Heading, Text } from 'grommet';
import { Blank, Close, Group, Share, Trash } from 'grommet-icons';
import Loading from './Loading';
import Header from './Header';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import { apiUrl } from './utils';

const Users = () => {
  const session = React.useContext(SessionContext);
  const [users, setUsers] = React.useState();
  const [adding, setAdding] = React.useState();
  const [confirmDelete, setConfirmDelete] = React.useState();

  React.useEffect(() => {
    document.title = 'Users - Photo Feed';
    fetch(`${apiUrl}/users`, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
      },
    })
      .then(response => response.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [session]);

  return (
    <Box fill>
      <Header>
        <Blank />
        <Heading size="small" margin="none">Users</Heading>
        <RoutedButton path="/events" icon={<Close />} hoverIndicator />
      </Header>
      {!users ? <Loading Icon={Group} /> : (
        <Box>
          {users.map(user => (
            <Box
              key={user.id}
              direction="row"
              justify="between"
              align="center"
              margin={{ bottom: 'medium' }}
            >
              <Box flex>
                <RoutedButton
                  path={`/users/edit/${user.id}`}
                  fill
                  hoverIndicator
                >
                  <Box pad="medium">
                    <Text>{user.name}</Text>
                  </Box>
                </RoutedButton>
              </Box>
              <Box flex={false} direction="row" align="center">
                <Button
                  icon={<Share />}
                  hoverIndicator
                  onClick={() => navigator.share({
                    title: user.name,
                    url: `/join/${user.token}`,
                  })}
                />
                {(user.id === confirmDelete) && (
                  <Button
                    icon={<Trash color="status-critical" />}
                    hoverIndicator
                    onClick={() => {
                      fetch(`${apiUrl}/users/${user.id}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${session.token}`,
                        },
                      })
                        .then(() => setUsers(users.filter(u => u.id !== user.id)))
                        .then(() => setConfirmDelete(undefined));
                    }}
                  />
                )}
                <Button
                  icon={<Trash />}
                  hoverIndicator
                  onClick={() =>
                    setConfirmDelete(confirmDelete === user.id ? undefined : user.id)}
                />
              </Box>
            </Box>
          ))}
          <Box align="center" margin="large">
            <Button label="New User" onClick={() => setAdding(!adding)} />
          </Box>
          {adding && (
            <Box
              pad={{ horizontal: 'medium', vertical: 'large' }}
              background="neutral-3"
            >
              <Form
                value={{ name: '', email: '', password: '', admin: false }}
                onSubmit={({ value }) => {
                  fetch(`${apiUrl}/users`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${session.token}`,
                      'Content-Type': 'application/json; charset=UTF-8',
                    },
                    body: JSON.stringify(value),
                  })
                    .then(response => response.json())
                    .then((user) => setUsers([user, ...users]))
                    .then(() => setAdding(false));
                }}
              >
                <FormField name="name" placeholder="name" required />
                <FormField name="email" placeholder="email" required />
                <FormField name="password" placeholder="password" />
                <FormField name="admin" pad component={CheckBox} label="administrator?" />
                <Box align="center" margin={{ top: 'large' }}>
                  <Button type="submit" label="Add User" />
                </Box>
              </Form>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

export default Users;
