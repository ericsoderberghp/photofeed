import React from 'react';
import { Box, Button, CheckBox, Form, FormField, Heading, Text } from 'grommet';
import { Group, Previous, Share, Trash } from 'grommet-icons';
import Loading from './Loading';
import Header from './Header';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import { apiUrl } from './utils';

const Users = () => {
  const session = React.useContext(SessionContext);
  const [users, setUsers] = React.useState();
  const [add, setAdd] = React.useState();
  const [adding, setAdding] = React.useState();
  const [confirmDelete, setConfirmDelete] = React.useState();
  const [deleting, setDeleting] = React.useState();

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
    <Box>
      <Header>
        <RoutedButton path="/events" icon={<Previous />} hoverIndicator />
        <Heading size="small" margin="none">Users</Heading>
        <Box pad="medium" />
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
              background={deleting === user.id
                ? { color: 'dark-2', opacity: 'medium' } : undefined}
            >
              <Box flex>
                <RoutedButton
                  path={`/users/edit/${encodeURIComponent(user.id)}`}
                  fill
                  hoverIndicator
                >
                  <Box pad={{ horizontal: 'large', vertical: 'medium' }}>
                    <Text weight="bold">{user.name}</Text>
                  </Box>
                </RoutedButton>
              </Box>
              <Box flex={false} direction="row" align="center">
                {navigator.share && (user.id !== confirmDelete) && (
                  <Button
                    icon={<Share />}
                    hoverIndicator
                    onClick={() => navigator.share({
                      title: `${user.name} - Photo Feed`,
                      text: `${user.name} - Photo Feed`,
                      url: `/users/${encodeURIComponent(user.token)}`,
                    })}
                  />
                )}
                {(user.id === confirmDelete) && (
                  <Button
                    icon={<Trash color="status-critical" />}
                    hoverIndicator
                    onClick={() => {
                      setDeleting(user.id);
                      setConfirmDelete(undefined);
                      fetch(`${apiUrl}/users/${encodeURIComponent(user.id)}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${session.token}`,
                        },
                      })
                        .then(() => setDeleting(undefined))
                        .then(() => setUsers(users.filter(u => u.id !== user.id)));
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
            <Button label="New User" onClick={() => setAdd(!add)} />
          </Box>
          {add && (
            <Box
              pad={{ horizontal: 'large', vertical: 'xlarge' }}
              background="neutral-3"
            >
              <Form
                value={{ name: '', email: '', password: '', admin: false }}
                onSubmit={({ value }) => {
                  setAdding(true);
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
                    .then(() => setAdd(false))
                    .then(() => setAdding(false))
                    .catch(() => setAdding(false));
                }}
              >
                <FormField name="name" placeholder="name" required />
                <FormField name="email" placeholder="email" required />
                <FormField name="password" placeholder="password" />
                <FormField name="admin" pad component={CheckBox} label="administrator?" />
                <Box align="center" margin={{ top: 'large' }}>
                  {adding
                    ? <Text>Just a sec ...</Text>
                    : <Button type="submit" primary label="Add User" />}
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
