import React from 'react';
import { Box, Grid, Keyboard, Paragraph, ResponsiveContext } from 'grommet';
import { Calendar } from 'grommet-icons';
import Loading from './Loading';
import Player from './Player';
import Photo from './Photo';

const Photos = ({ header, event, photos, onRefresh, onDelete }) => {
  const [refreshing, setRefreshing] = React.useState();
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
        background={refreshing ? 'accent-1' : 'dark-1'}
        style={{ minHeight: '100vh' }}
      >
        {header}
        {!photos ? <Loading Icon={Calendar} /> : (
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
