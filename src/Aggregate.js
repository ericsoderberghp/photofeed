import React from 'react';
import { Box, Heading } from 'grommet';
import { Image } from 'grommet-icons';
import Header from './Header';
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
      photos={photos}
      onRefresh={load}
      header={(
        <Header
          margin={undefined}
          background={{ color: 'dark-1', opacity: 'medium' }}
          style={{ position: 'absolute', top: 0, width: '100vw', zIndex: 10 }}
        >
          <RoutedButton path="/events" icon={<Image />} hoverIndicator />
          <Heading size="small" margin="none">Photo Feed</Heading>
          <Box pad="medium" />
        </Header>
      )}
    />
  );
}

export default Aggregate;
