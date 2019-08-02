import React from 'react';
import { Box, Button } from 'grommet';
import { Apps } from 'grommet-icons';
import Photo from './Photo';
import AddPhoto from './AddPhoto';

const Feed = ({ event, user, onManage }) => {
  const [photos, setPhotos] = React.useState([]);

  React.useEffect(() => {
    const stored = localStorage.getItem('photoIds');
    if (stored) {
      const photoIds = JSON.parse(stored);
      const nextPhotos = photoIds.map((id) => {
        const stored = localStorage.getItem(id);
        return (stored ? JSON.parse(stored) : { id });
      });
      setPhotos(nextPhotos);
    }
  }, []);

  return (
    <Box fill overflow="auto" background="dark-1">
      <Box flex={false} direction="row" justify="between" align="center">
        <Button icon={<Apps />} hoverIndicator onClick={onManage} />
        <AddPhoto
          user={user}
          event={event}
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
