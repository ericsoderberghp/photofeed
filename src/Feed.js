import React from 'react';
import { Box, Heading, Paragraph } from 'grommet';
import { Blank, Image } from 'grommet-icons';
import Header from './Header';
import RoutedButton from './RoutedButton';
import Photo from './Photo';

const Feed = () => {
  const [photos, setPhotos] = React.useState([]);

  React.useEffect(() => {
    document.title = 'Photo Feed';
  }, []);

  return (
    <Box fill overflow="auto" background="dark-1">
      <Header margin={undefined}>
        <RoutedButton path="/events" icon={<Image />} hoverIndicator />
        <Heading size="small" margin="none">Photo Feed</Heading>
        <Blank />
      </Header>
      <Box flex pad="large" justify="center" background="neutral-1">
        <Paragraph textAlign="center">
          A combined photo feed is still in the works, but not quite ready yet. :(
        </Paragraph>
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
