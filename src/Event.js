import React from 'react';
import { Box, Button } from 'grommet';
import { Image, Share } from 'grommet-icons';
import Loading from './Loading';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import AddPhoto from './AddPhoto';
import Photos from './Photos';
import { apiUrl } from './utils';

const Event = ({ token }) => {
  const session = React.useContext(SessionContext);
  const [event, setEvent] = React.useState();
  const [photos, setPhotos] = React.useState();
  const [adding, setAdding] = React.useState();

  const load = () => {
    fetch(`${apiUrl}/events?token=${token}`, 
      (session
        ? { headers: { 'Authorization': `Bearer ${session.token}` } }
        : undefined),
    )
      .then(response => response.json())
      .then((event) => {
        document.title = `${event.name} - Photo Feed`;
        setEvent(event);
        fetch(`${apiUrl}/photos?eventId=${event.id}`, 
          (session
            ? { headers: { 'Authorization': `Bearer ${session.token}` } }
            : undefined),
        )
          .then(response => response.json())
          .then(setPhotos);
      });
  }

  React.useEffect(load, [token, session]);

  const canAdd = event && (!event.locked
    || (session && (session.admin || session.userId === event.userId)));

  return (
    <Photos
      name={event ? event.name : ''}
      event={event}
      photos={photos}
      onRefresh={load}
      onDelete={(photo) => setPhotos(photos.filter(p => p.id !== photo.id))}
      leftControl={(session && session.admin)
        ? <RoutedButton path="/events" icon={<Image />} hoverIndicator />
        : (navigator.share ? (
          <Button
            icon={<Share />}
            hoverIndicator
            onClick={() => navigator.share({
              title: event.name,
              text: event.name,
              url: `/events/${encodeURIComponent(event.token)}`,
            })}
          />
        ) : undefined)
      }
      rightControl={canAdd
        ? (
          <AddPhoto
            session={session}
            event={event}
            onAdding={setAdding}
            onAdd={(photo) => setPhotos([ photo, ...photos ])}
          />
        ) : undefined
      }
      insert={adding
        ? (
          <Box
            basis="medium"
            background={{ color: 'light-2', opacity: 'medium' }}
            align="center"
            justify="center"
          >
            <Loading Icon={Image} />
          </Box>
        ) : undefined
      }
    />
  );
}

export default Event;
