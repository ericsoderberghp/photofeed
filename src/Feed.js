import React from 'react';
import { Box } from 'grommet';
import { Apps } from 'grommet-icons';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import Photo from './Photo';
import AddPhoto from './AddPhoto';

const Feed = () => {
  const session = React.useContext(SessionContext);
  const [photos, setPhotos] = React.useState([]);

  // React.useEffect(() => {
  //   const stored = localStorage.getItem('photoIds');
  //   if (stored) {
  //     const photoIds = JSON.parse(stored);
  //     const nextPhotos = photoIds.map((id) => {
  //       const stored = localStorage.getItem(id);
  //       return (stored ? JSON.parse(stored) : { id });
  //     });
  //     setPhotos(nextPhotos);
  //   }
  // }, []);

  return (
    <Box fill overflow="auto" background="dark-1">
      <Box flex={false} direction="row" justify="between" align="center">
        <RoutedButton path="/events" icon={<Apps />} hoverIndicator />
        <AddPhoto
          session={session}
          onAdd={(photo) => {
            const nextPhotos = [photo, ...photos];
            localStorage.setItem('photoIds',
              JSON.stringify(nextPhotos.map(p => p.id)));
            setPhotos(nextPhotos);
          }}
        />
      </Box>
      {photos.map((photo, index) => (
        <Photo
          key={photo.name}
          photo={photo}
          onDelete={() => {
            const nextPhotos = [...photos];
            nextPhotos.splice(index, 1);
            localStorage.setItem('photoIds',
              JSON.stringify(nextPhotos.map(p => p.id)));
            setPhotos(nextPhotos);
          }}
        />
      ))}
    </Box>
  );
}

export default Feed;
