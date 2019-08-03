import React from 'react';
import { Box, Heading } from 'grommet';
import { Apps } from 'grommet-icons';
import RoutedButton from './RoutedButton';
import Photo from './Photo';

const Feed = () => {
  const [photos, setPhotos] = React.useState([]);

  return (
    <Box fill overflow="auto" background="dark-1">
      <Box flex={false} direction="row" justify="between" align="center">
        <RoutedButton path="/events" icon={<Apps />} hoverIndicator />
        <Heading size="small" margin="none">Photo Feed</Heading>
        <Box pad="medium" />
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
