import React from 'react';
import { Box, Button, CheckBox, Form, FormField } from 'grommet';
import { Previous, Share, Trash, User as UserIcon } from 'grommet-icons';
import Screen from './components/Screen';
import Loading from './components/Loading';
import Controls from './components/Controls';
import ControlLabel from './components/ControlLabel';
import MenuButton from './components/MenuButton';
import SessionContext from './SessionContext';
import { RouterContext } from './Router';
import ControlButton from './components/ControlButton';
import { apiUrl } from './utils';

const busyIcon = { loading: UserIcon, deleting: Trash, saving: UserIcon };

const EditUser = ({ id }) => {
  const session = React.useContext(SessionContext);
  const { push } = React.useContext(RouterContext);
  const [user, setUser] = React.useState();
  const [busy, setBusy] = React.useState('loading');
  const [showMenu, setShowMenu] = React.useState();
  const [confirmDelete, setConfirmDelete] = React.useState();

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
        setBusy(undefined);
      });
  }, [id, session]);

  return (
    <Screen
      controls={(
        <Controls
          left={<ControlButton path="/users" Icon={Previous} />}
          label={(
            <ControlLabel
              label={user ? user.name : ''}
              onClick={() => setShowMenu(!showMenu)}
            />
          )}
          menu={showMenu && (
            <Box>
              {navigator.share && (
                <MenuButton
                  label="Share"
                  Icon={Share}
                  onClick={() => navigator.share({
                    title: `${user.name} - Photo Feed`,
                    text: `${user.name} - Photo Feed`,
                    url: `/users/${encodeURIComponent(user.token)}`,
                  })}
                />
              )}
              {confirmDelete && (
                <MenuButton
                  label="Confirm Delete"
                  Icon={Trash}
                  color="status-critical"
                  onClick={() => {
                    setBusy('deleting');
                    fetch(`${apiUrl}/users/${encodeURIComponent(user.id)}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${session.token}`,
                      },
                    })
                      .then(() => push('/users'))
                      .catch(() => setBusy(undefined));
                  }}
                />
              )}
              <MenuButton
                label="Delete"
                Icon={Trash}
                onClick={() => setConfirmDelete(!confirmDelete)}
              />
            </Box>
          )}
        />
      )}
    >
      {busy ? <Loading Icon={busyIcon[busy]} /> : (
        <Box flex={false} alignSelf="center" width="large" pad="large">
          <Form
            value={{ name: user.name, email: user.email, admin: user.admin, password: '' }}
            onSubmit={({ value: nextUser }) => {
              setBusy('saving');
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
                .catch(() => setBusy(undefined));
            }}
          >
            <FormField name="name" placeholder="name" required />
            <FormField name="email" placeholder="email" required />
            <FormField name="password" placeholder="new password" type="password" />
            <FormField name="admin" pad component={CheckBox} label="administrator?" />
            <Box align="center" margin={{ top: 'large' }}>
              <Button type="submit" primary label="Update" />
            </Box>
          </Form>
        </Box>
      )}
    </Screen>
  );
}

export default EditUser;
