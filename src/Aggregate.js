import React from 'react';
import { Image } from 'grommet-icons';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import Photos from './Photos';
import { apiUrl } from './utils';

const Aggregate = () => {
  const session = React.useContext(SessionContext);
  const [photos, setPhotos] = React.useState();

  React.useEffect(() => {
    document.title = 'Photo Feed';
  }, []);

  const load = () => {
    fetch(`${apiUrl}/photos`,
      (session
        ? { headers: { 'Authorization': `Bearer ${session.token}` } }
        : undefined),
    )
      .then(response => response.json())
      .then(setPhotos);
  }

  React.useEffect(load, [session]);

  return (
    <Photos
      name="Photo Feed"
      photos={photos}
      onRefresh={load}
      leftControl={(
        <RoutedButton path="/events" icon={<Image />} hoverIndicator />
      )}
    />
  );
}

export default Aggregate;
