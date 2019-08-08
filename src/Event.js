import React from 'react';
import { Button } from 'grommet';
import { Image, Share } from 'grommet-icons';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import AddPhoto from './AddPhoto';
import Photos from './Photos';
import { apiUrl } from './utils';

const Event = ({ token }) => {
  const session = React.useContext(SessionContext);
  const [event, setEvent] = React.useState();
  const [photos, setPhotos] = React.useState();

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
            onAdd={(photo) => setPhotos(prevPhotos => [ photo, ...prevPhotos ])}
          />
        ) : undefined
      }
    />
  );
}

export default Event;
