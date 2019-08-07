import React from 'react';
import { Box, Grid, Heading, Keyboard, Paragraph, ResponsiveContext } from 'grommet';
import { Calendar } from 'grommet-icons';
import Loading from './Loading';
import Header from './Header';
import Player from './Player';
import Photo from './Photo';

const Photos = ({
  name, leftControl, rightControl, insert, event, photos, onRefresh, onDelete,
}) => {
  const [refreshing, setRefreshing] = React.useState(photos);
  const [play, setPlay] = React.useState();
  const [effects, setEffects] = React.useState({});

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

  // TODO: change this mechanism
  React.useEffect(() => {
    const onTouchStart = (event) => {
      if (event.touches.length === 3) {
        setPlay(true);
      }
    }

    document.addEventListener('touchstart', onTouchStart);
    return () => document.removeEventListener('touchstart', onTouchStart);
  }, [play]);

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
          overflow="hidden"
          margin={undefined}
          background={{ color: 'dark-1', opacity: 'medium' }}
          style={{ position: 'absolute', top: 0, width: '100vw', zIndex: 10 }}
        >
          {leftControl || <Box pad="medium" />}
          <Heading size="small" margin="none">{name}</Heading>
          {rightControl || <Box pad="medium" />}
        </Header>
        {refreshing && <Box background="accent-1" pad="large" />}
        {insert}
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
                          random={true}
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
