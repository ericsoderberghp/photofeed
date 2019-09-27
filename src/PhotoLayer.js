import React from 'react';
import { Box, Button, Keyboard, Layer, Text } from 'grommet';
import { Calendar, Next, Previous, Trash } from 'grommet-icons';
import SessionContext from './SessionContext';
import RoutedButton from './components/RoutedButton';
import Photo from './Photo';
import { apiUrl } from './utils';

const PhotoLayer = ({
  event, index, photo, onDelete, onSelect,
}) => {
  const session = React.useContext(SessionContext);
  const [eventUser, setEventUser] = React.useState();
  const [confirmDelete, setConfirmDelete] = React.useState();
  const [deleting, setDeleting] = React.useState();

  React.useEffect(() => {
    const stored = localStorage.getItem('eventUser');
    if (stored) setEventUser(JSON.parse(stored));
  }, [])

  const doDelete = () => {
    setDeleting(true);
    fetch(`${apiUrl}/photos/${photo.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session ? session.token : eventUser.token}`,
      },
    })
      .then(() => setConfirmDelete(undefined))
      .then(() => onSelect(index + 1))
      .then(() => onDelete(photo))
      .catch(() => setDeleting(false));
  }

  let deleteControls;
  if ((session && (session.admin || session.userId === event.userId))
    || (eventUser && eventUser.token === photo.eventUserToken)) {
    deleteControls = (
      <Box direction="row" align="center">
        {confirmDelete && !deleting && (
          <Button
            icon={ <Trash color="status-critical" />}
            hoverIndicator
            disabled={deleting}
            onClick={doDelete}
          />
        )}
        {onDelete && (
          <Button
            icon={<Trash color="light-4" />}
            hoverIndicator
            onClick={() => setConfirmDelete(!confirmDelete)}
          />
        )}
      </Box>
    )
  }

  const date = new Date(photo.date);
  const now = new Date();
  const days = Math.floor((now - date) / (1000*60*60*24));
  const dateString = date.toLocaleString('default',
    days > 7 ? { month: 'short', day: 'numeric' }
    : { weekday: 'short', hour: 'numeric' });

  return (
    <Layer onEsc={() => onSelect(undefined)} full modal>
      <Keyboard
        target="document"
        onLeft={() => onSelect(index - 1)}
        onRight={() => onSelect(index + 1)}
      >
        <Box fill background="black">
          <Box flex>
            {deleting ? (
              <Box background={{ color: 'dark-2', opacity: 'strong' }} />
            ) : (
              <Photo
                photo={photo}
                index={index}
                event={event}
                fill
                onDelete={onDelete}
              />
            )}
          </Box>
          <Box flex={false} direction="row" align="center" justify="between">
            <Button
              icon={<Previous />}
              hoverIndicator
              onClick={() =>  onSelect(index - 1)}
            />
            <Box direction="row" align="center" gap="small">
              {event ? (
                <Button
                  icon={<Calendar />}
                  hoverIndicator
                  onClick={() => onSelect(undefined)}
                />
              ) : (
                <RoutedButton
                  icon={<Calendar />}
                  hoverIndicator
                  path={`/events/${photo.eventToken}#${photo.id}`}
                />
              )}
              <Text size="large" weight="bold">
                {((session && session.userId === photo.userId)
                  || (eventUser && eventUser.token === photo.eventUserToken))
                  ? 'me' : (photo.eventUserName || photo.userName)}
              </Text>
              <Text color="dark-4">
                {dateString}
              </Text>
              {onDelete && deleteControls}
            </Box>
            <Button
              icon={<Next />}
              hoverIndicator
              onClick={() => onSelect(index + 1)}
            />
          </Box>
        </Box>
      </Keyboard>
    </Layer>
  );
}

export default PhotoLayer;
