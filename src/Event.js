import React from 'react';
import { Box, Button } from 'grommet';
import { Edit, Calendar, Share, Unlink } from 'grommet-icons';
import SessionContext from './SessionContext';
import ControlButton from './components/ControlButton';
import MenuButton from './components/MenuButton';
import AddPhoto from './AddPhoto';
import Photos from './Photos';
import { apiUrl } from './utils';

const Event = ({ token }) => {
  const session = React.useContext(SessionContext);
  const [event, setEvent] = React.useState();
  const [photos, setPhotos] = React.useState();
  const [error, setError] = React.useState();

  const updateManifest = (event) => {
    // replace manifest in page head
    const manifest = document.getElementById('manifest');
    const nextManifest = document.createElement('link');
    nextManifest.id = 'manifest';
    nextManifest.rel = 'manifest';
    nextManifest.href =
      `https://us-central1-photofeed-248603.cloudfunctions.net/manifest?startUrl=${
        encodeURIComponent(`/events/${token}`)
      }&name=${encodeURIComponent(event.name)}`;
    manifest.parentNode.replaceChild(nextManifest, manifest);
  };

  const load = () => {
    fetch(`${apiUrl}/events?token=${token}`, 
      (session
        ? { headers: { 'Authorization': `Bearer ${session.token}` } }
        : undefined),
    )
      .then(response => {
        if (!response.ok) throw new Error(response.status);
        return response;
      })
      .then(response => response.json())
      .then((event) => {
        document.title = `${event.name} - Photo Feed`;
        setEvent(event);
        updateManifest(event);
        fetch(`${apiUrl}/photos?eventId=${event.id}`, 
          (session
            ? { headers: { 'Authorization': `Bearer ${session.token}` } }
            : undefined),
        )
          .then(response => response.json())
          .then(setPhotos);
      })
      .catch(e => setError(e.message));
  }

  React.useEffect(load, [token, session]);

  if (error) {
    return(
      <Box justify="center" align="center" height="100vh">
        <Unlink size="xlarge" color="brand" />
      </Box>
    )
  }

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
        ? <ControlButton path="/events" Icon={Calendar} />
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
            onAdd={(photo) => setPhotos((prevPhotos) => {
              const nextPhotos = [photo, ...prevPhotos];
              nextPhotos.sort((p1, p2) =>
                (new Date(p2.date)) - (new Date(p1.date)))
              return nextPhotos;
            })}
          />
        ) : undefined
      }
      menu={[
        navigator.share && event && (
          <MenuButton
            key="Share"
            label="Share"
            Icon={Share}
            onClick={() => navigator.share({
              title: `${event.name} - Photo Feed`,
              text: `${event.name} - Photo Feed`,
              url: `/events/${encodeURIComponent(event.token)}`,
            }).catch(() => {})}
          />
        ),
        event && session && session.admin && (
          <MenuButton
            key="Edit"
            label="Edit"
            Icon={Edit}
            path={`/events/edit/${event.id}`}
          />
        ),
      ]}
    />
  );
}

export default Event;
