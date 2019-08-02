import React from 'react';
import { Box, Button, Form, FormField, Heading, RadioButton, TextInput } from 'grommet';
import { Add, Close, Share, Trash, View } from 'grommet-icons';
import { uuidv4 } from './utils';

const Manage = ({ user, onActiveEvent, onClose }) => {
  const [events, setEvents] = React.useState([]);
  const [activeEventId, setActiveEventId] = React.useState();
  const [adding, setAdding] = React.useState();
  const [confirmDelete, setConfirmDelete] = React.useState();

  React.useEffect(() => {
    const stored = localStorage.getItem('eventIds');
    if (stored) {
      const eventIds = JSON.parse(stored);
      const nextEvents = eventIds.map((id) => {
        const stored = localStorage.getItem(id);
        return (stored ? JSON.parse(stored) : { id });
      });
      setEvents(nextEvents);
    }
    setActiveEventId(localStorage.getItem('activeEventId'));
  }, []);

  return (
    <Box fill>
      <Box
        direction="row"
        justify="between"
        align="center"
        pad={{ left: 'medium' }}
        margin={{ bottom: 'large' }}
      >
        <Heading size="small" margin="none">Events</Heading>
        <Button icon={<Close />} hoverIndicator onClick={onClose} />
      </Box>
      {events.map(event => (
        <Box
          key={event.id}
          direction="row"
          justify="between"
          align="center"
          gap="small"
          margin={{ bottom: 'medium' }}
        >
          <Box flex direction="row" align="center">
            <Box flex={false} pad={{ left: 'medium' }}>
              <RadioButton
                name="active"
                checked={event.id === activeEventId}
                onChange={() => {
                  localStorage.setItem('activeEventId', event.id);
                  setActiveEventId(event.id);
                  onActiveEvent(event);
                }}
              />
            </Box>
            <TextInput
              plain
              value={event.name}
              onChange={(event) => {
                const name = event.target.value;
                const nextEvents = JSON.parse(JSON.stringify(events));
                nextEvents.forEach((nextEvent) => {
                  if (nextEvent.id === event.id) {
                    nextEvent.name = name;
                    localStorage.setItem(event.id, JSON.stringify(nextEvent));
                  }
                });
                setEvents(nextEvents);
              }}
              style={{ flex: '1 1' }}
            />
          </Box>
          <Box flex={false} direction="row" align="center">
            <Button
              icon={<View color={event.visible ? 'brand' : 'status-unknown' } />}
              hoverIndicator
              onClick={() => {
                const nextEvents = JSON.parse(JSON.stringify(events));
                nextEvents.forEach((nextEvent) => {
                  if (nextEvent.id === event.id) {
                    nextEvent.visible = !event.visible;
                    localStorage.setItem(event.id, JSON.stringify(nextEvent));
                  }
                });
                setEvents(nextEvents);
              }}
            />
            <Button
              icon={<Share />}
              hoverIndicator
            />
            {(event.id === confirmDelete) && (
              <Button
                icon={<Trash color="status-critical" />}
                hoverIndicator
                onClick={() => {
                  const nextEvents = JSON.parse(JSON.stringify(events))
                    .filter(e => e.id !== event.id);
                  localStorage.setItem('eventIds',
                    JSON.stringify(nextEvents.map(e => e.id)));
                  setEvents(nextEvents);
                  localStorage.removeItem(event.id);
                  setConfirmDelete(undefined);
                }}
              />
            )}
            <Button
              icon={<Trash />}
              hoverIndicator
              onClick={() =>
                setConfirmDelete(confirmDelete === event.id ? undefined : event.id)}
            />
          </Box>
        </Box>
      ))}
      <Button icon={<Add />} hoverIndicator onClick={() => setAdding(!adding)} />
      {adding && (
        <Form
          value={{ name: '' }}
          onSubmit={({ value }) => {
            const event = {
              ...value,
              id: uuidv4(),
              visible: true,
              admins: [user.id]
            };
            localStorage.setItem(event.id, JSON.stringify(event));

            const nextEvents = JSON.parse(JSON.stringify(events));
            nextEvents.push(event);
            localStorage.setItem('eventIds',
              JSON.stringify(nextEvents.map(e => e.id)));
            localStorage.setItem('activeEventId', event.id);
            setActiveEventId(event.id);
            onActiveEvent(event);
            setEvents(nextEvents);
            setAdding(false);
          }}
        >
          <FormField name="name" placeholder="name" required />
          <Box align="center" margin={{ top: 'large' }}>
            <Button type="submit" label="Add" />
          </Box>
        </Form>
      )}
    </Box>
  );
}

export default Manage;
