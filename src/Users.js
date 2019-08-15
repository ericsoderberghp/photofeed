import React from 'react';
import { Box, Text } from 'grommet';
import { Add, Calendar, Group } from 'grommet-icons';
import Screen from './components/Screen';
import Loading from './components/Loading';
import Controls from './components/Controls';
import SessionContext from './SessionContext';
import ControlButton from './components/ControlButton';
import RoutedButton from './components/RoutedButton';
import { apiUrl } from './utils';

const Users = () => {
  const session = React.useContext(SessionContext);
  const [users, setUsers] = React.useState();

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
    <Screen
      controls={(
        <Controls
          left={<ControlButton path="/events" Icon={Calendar} />}
          label="Users"
          right={<ControlButton path="/users/add" Icon={Add} />}
        />
      )}
    >
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
                  path={`/users/edit/${encodeURIComponent(user.id)}`}
                  fill
                  hoverIndicator
                >
                  <Box pad={{ horizontal: 'large', vertical: 'medium' }}>
                    <Text weight="bold">{user.name}</Text>
                  </Box>
                </RoutedButton>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Screen>
  );
}

export default Users;
