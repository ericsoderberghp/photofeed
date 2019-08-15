import React from 'react';
import { Box, Button, CheckBox, Form, FormField } from 'grommet';
import { Calendar, Previous, Trash } from 'grommet-icons';
import Screen from './components/Screen';
import Loading from './components/Loading';
import Controls from './components/Controls';
import ControlLabel from './components/ControlLabel';
import MenuButton from './components/MenuButton';
import SessionContext from './SessionContext';
import { RouterContext } from './Router';
import ControlButton from './components/ControlButton';
import { apiUrl } from './utils';

const busyIcon = { loading: Calendar, deleting: Trash, saving: Calendar };

const EditEvent = ({ id }) => {
  const session = React.useContext(SessionContext);
  const { push } = React.useContext(RouterContext);
  const [event, setEvent] = React.useState();
  const [busy, setBusy] = React.useState('loading');
  const [showMenu, setShowMenu] = React.useState();
  const [confirmDelete, setConfirmDelete] = React.useState();

  React.useEffect(() => {
    fetch(`${apiUrl}/events/${id}`, {
      headers: {
        'Authorization': `Bearer ${session.token}`,
      },
    })
      .then(response => response.json())
      .then((event) => {
        document.title = `${event.name} - Photo Feed`;
        setEvent(event);
        setBusy(undefined);
      });
  }, [id, session]);

  return (
    <Screen
      controls={(
        <Controls
          left={event ? (
            <ControlButton
              path={`/events/${encodeURIComponent(event.token)}`}
              Icon={Previous}
            />
          ) : null}
          label={(
            <ControlLabel
              label={event ? event.name : ''}
              onClick={() => setShowMenu(!showMenu)}
            />
          )}
          menu={showMenu && (
            <Box>
              {confirmDelete && (
                <MenuButton
                  label="Confirm Delete"
                  Icon={Trash}
                  color="status-critical"
                  onClick={() => {
                    setBusy('deleting');
                    fetch(`${apiUrl}/events/${encodeURIComponent(event.id)}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${session.token}`,
                      },
                    })
                      .then(() => push('/events'))
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
            value={{ name: event.name, locked: event.locked }}
            onSubmit={({ value: nextEvent }) => {
              setBusy("saving");
              fetch(`${apiUrl}/events/${event.id}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${session.token}`,
                  'Content-Type': 'application/json; charset=UTF-8',
                },
                body: JSON.stringify(nextEvent),
              })
                .then(response => response.json())
                .then(event => push(`/events/${encodeURIComponent(event.token)}`))
                .catch(() => setBusy(undefined));
            }}
          >
            <FormField name="name" placeholder="name" required />
            <FormField name="locked" pad component={CheckBox} label="locked?" />
            <Box align="center" margin={{ top: 'large' }}>
              <Button type="submit" primary label="Update" />
            </Box>
          </Form>
        </Box>
      )}
    </Screen>
  );
}

export default EditEvent;
