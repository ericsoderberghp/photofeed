import React from 'react';
import {
  Box, Button, DropButton, Grid, Heading, Keyboard, Paragraph,
  ResponsiveContext, Text,
} from 'grommet';
import { Calendar } from 'grommet-icons';
import Loading from './Loading';
import Header from './Header';
import Player from './Player';
import Photo from './Photo';

const MenuButton = ({ label, onClick }) => (
  <Button hoverIndicator onClick={onClick}>
    <Box pad="medium">
      <Text size="large" textAlign="center">{label}</Text>
    </Box>
  </Button>
);

const Photos = ({
  name, leftControl, rightControl, event, photos, onRefresh, onDelete,
}) => {
  const [refreshing, setRefreshing] = React.useState(photos);
  const [play, setPlay] = React.useState();
  const [effects, setEffects] = React.useState({});
  const headerRef = React.useRef();

  React.useEffect(() => {
    let scrollTimer;

    const onScroll = () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        if (window.scrollY < 0) {
          // user is holding the scroll position down, refresh
          setRefreshing(true);
          onRefresh();
        }
      }, 500);
    }

    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  });

  // Clear refreshing if we get new photos
  React.useEffect(() => setRefreshing(false), [photos]);

  let content;
  if (play) {
    content = (
      <Player
        event={event}
        photos={photos}
        effects={effects}
        onDone={() => setPlay(false)}
      />
    );
  } else {
    content = (
      <Box
        background={'dark-1'}
        style={{ minHeight: '100vh' }}
      >
        <Header
          ref={headerRef}
          overflow="hidden"
          margin={undefined}
          background={{ color: 'dark-1', opacity: 'strong' }}
          style={{ position: 'absolute', top: 0, width: '100vw', zIndex: 10 }}
        >
          {leftControl || <Box pad="medium" />}
          <DropButton
            hoverIndicator
            dropTarget={headerRef.current}
            dropAlign={{ top: 'bottom' }}
            dropProps={{ plain: true, stretch: false }}
            dropContent={(
              <Box
                width="medium"
                background={{ color: 'dark-2', opacity: 'strong' }}
              >
                <MenuButton label="Slideshow" onClick={() => setPlay(true)} />
                <MenuButton
                  label={effects.blackAndWhite ? 'Color' : 'Black and White'}
                  onClick={() =>
                    setEffects({ ...effects, blackAndWhite: !effects.blackAndWhite })}
                />
                <MenuButton
                  label={effects.toss ? 'Straighten' : 'Muss'}
                  onClick={() =>
                    setEffects({ ...effects, toss: !effects.toss })}
                />
              </Box>
            )}
          >
            <Heading
              size="small"
              margin={{ horizontal: 'medium', vertical: 'xxsmall' }}
            >
              {name}
            </Heading>
          </DropButton>
          {rightControl || <Box pad="medium" />}
        </Header>
        {refreshing && <Box background="accent-1" pad="large" />}
        {!photos ? <Box margin="xlarge"><Loading Icon={Calendar} /></Box> : (
          <ResponsiveContext.Consumer>
            {(responsive) => (
              <Box flex={false}>
                {responsive === 'small'
                  ? photos.map((photo, index) => (
                      <Photo
                        key={photo.id || photo.name}
                        fill="horizontal"
                        photo={photo}
                        index={index}
                        event={event}
                        effects={effects}
                        onDelete={onDelete}
                      />
                  )) : (
                    <Grid columns="medium" rows="medium">
                      {photos.map((photo, index) => (
                        <Photo
                          key={photo.id || photo.name}
                          photo={photo}
                          index={index}
                          event={event}
                          fill
                          effects={effects}
                          onDelete={onDelete}
                        />
                      ))}
                    </Grid>
                  )
                }
                {!photos.length && (
                  <Box basis="medium" align="center" justify="center">
                    <Paragraph>You should add some photos!</Paragraph>
                  </Box>
                )}
              </Box>
            )}
          </ResponsiveContext.Consumer>
        )}
      </Box>
    )
  }

  const onKeyDown = (event) => {
    if (event.key === 'p') {
      setPlay(true);
    } else if (event.key === 'b') {
      setEffects({ ...effects, blackAndWhite: !effects.blackAndWhite });
    } else if (event.key === 't') {
      setEffects({ ...effects, toss: !effects.toss });
    }
  }

  return (
    <Keyboard target="document" onKeyDown={onKeyDown}>
      {content}
    </Keyboard>
  );
}

export default Photos;
