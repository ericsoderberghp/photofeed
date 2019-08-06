import React from 'react';
import { Box, Button, Carousel, Stack } from 'grommet';
import { Play, Pause } from 'grommet-icons';
import Photo from './Photo';

const Player = ({ event, photos }) => {
  const [play, setPlay] = React.useState();
  const [showControls, setShowControls] = React.useState(true);

  React.useEffect(() => {
    let timer;

    const onTouchStart = () => {
      setShowControls(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowControls(false), 3000);
    }

    document.addEventListener('touchstart', onTouchStart);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('touchstart', onTouchStart);
    };
  }, []);

  return (
    <Stack anchor="center">
      <Box background="black" style={{ height: '100vh', width: '100vw' }}>
        <Carousel fill play={play ? 3000 : undefined}>
          {photos.map(photo => (
            <Box key={photo.id || photo.name} fill align="center" justify="center">
              <Photo
                fill
                photo={photo}
                event={event}
              />
            </Box>
          ))}
        </Carousel>
      </Box>
      {showControls && (
        <Button
          icon={play ? <Pause size="large" /> : <Play size="large" />}
          onClick={() => {
            setPlay(!play);
            setShowControls(false);
          }}
        />
      )}
    </Stack>
  );
}

export default Player;
