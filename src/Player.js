import React from 'react';
import { Box, Carousel, Keyboard, Stack } from 'grommet';
import { Close, Play, Pause } from 'grommet-icons';
import ControlButton from './components/ControlButton';
import Photo from './Photo';

const Player = ({ event, photos, effects, onDone }) => {
  const [play, setPlay] = React.useState();
  const [showControls, setShowControls] = React.useState(true);

  React.useEffect(() => {
    let timer;

    const show = () => {
      setShowControls(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShowControls(false), 3000);
    }

    document.addEventListener('touchstart', show);
    document.addEventListener('mousemove', show);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('touchstart', show);
      document.removeEventListener('mousemove', show);
    };
  }, []);

  return (
    <Keyboard
      target="document"
      onEsc={onDone}
      onSpace={() => {
        setPlay(!play);
        setShowControls(false);
      }}
    >
      <Stack anchor="center">
        <Box
          background="black"
          overflow="hidden"
          style={{ height: '100vh', width: '100vw' }}
        >
          <Carousel fill play={play ? 4000 : undefined}>
            {photos.map(photo => (
              <Photo
                key={photo.id || photo.name}
                fill
                effects={effects}
                photo={photo}
                event={event}
              />
            ))}
          </Carousel>
        </Box>
        {showControls && (
          <Box
            gap="medium"
            margin={{ top: 'xlarge' }}
            pad="medium"
            background={{ color: 'black', opacity: 'strong' }}
            round="large"
            responsive={false}
          >
            <ControlButton
              icon={play ? <Pause size="large" /> : <Play size="large" />}
              onClick={() => {
                setPlay(!play);
                setShowControls(false);
              }}
            />
            <ControlButton icon={<Close size="large" />} onClick={onDone} />
          </Box>
        )}
      </Stack>
    </Keyboard>
  );
}

export default Player;
