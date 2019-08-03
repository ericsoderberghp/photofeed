import React from 'react';
import { Box, Button, Form, FormField, Heading, Text } from 'grommet';
import { Add, Close, Share, Trash } from 'grommet-icons';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import { apiUrl } from './utils';

const Users = () => {
  const session = React.useContext(SessionContext);
  const [users, setUsers] = React.useState();
  const [adding, setAdding] = React.useState();
  const [confirmDelete, setConfirmDelete] = React.useState();

  React.useEffect(() => {
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
      <Box
        direction="row"
        justify="between"
        align="center"
        pad={{ left: 'medium' }}
        margin={{ bottom: 'large' }}
      >
        <Heading size="small" margin="none">Users</Heading>
        <RoutedButton path="/" icon={<Close />} hoverIndicator />
      </Box>
      {users ? (
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
                <Box pad="medium">
                  <Text>{user.name}</Text>
                </Box>
              </Box>
              <Box flex={false} direction="row" align="center">
                <Button
                  icon={<Share />}
                  hoverIndicator
                  onClick={() => navigator.share({
                    title: user.name,
                    url: `/users/${user.token}`,
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
          <Button icon={<Add />} hoverIndicator onClick={() => setAdding(!adding)} />
          {adding && (
            <Form
              value={{ name: '', email: '' }}
              onSubmit={({ value }) => {
                const body = JSON.stringify(value);
                fetch(`${apiUrl}/users`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${session.token}`,
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Content-Length': body.length,
                  },
                  body,
                })
                  .then(response => response.json())
                  .then((user) => setUsers([user, ...users]))
                  .then(() => setAdding(false));
              }}
            >
              <FormField name="name" placeholder="name" required />
              <FormField name="email" placeholder="email" required />
              <Box align="center" margin={{ top: 'large' }}>
                <Button type="submit" label="Add" />
              </Box>
            </Form>
          )}
        </Box>
      ) : (
        <Box pad="large" animation="fadeIn">
          <Text>Loading ...</Text>
        </Box>
      )}
    </Box>
  );
}

export default Users;
