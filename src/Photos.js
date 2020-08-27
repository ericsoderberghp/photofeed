import React from 'react';
import {
  Box, Grid, InfiniteScroll, Keyboard, Paragraph, ResponsiveContext
} from 'grommet';
import { Brush, Gallery, Grid as GridIcon, Play } from 'grommet-icons';
import Screen from './components/Screen';
import Loading from './components/Loading';
import Controls from './components/Controls';
import ControlLabel from './components/ControlLabel';
import MenuButton from './components/MenuButton';
import Player from './Player';
import Photo from './Photo';
import PhotoLayer from './PhotoLayer';

const filters = ['none', 'B/W', 'sepia', 'vivid'];
const layouts = ['grid', 'collage'];

const Photos = ({
  name, leftControl, rightControl, menu, event, photos, onRefresh, onDelete,
}) => {
  const responsive = React.useContext(ResponsiveContext);
  const [refreshing, setRefreshing] = React.useState(photos);
  const [selected, setSelected] = React.useState();
  const [selectedPhoto, setSelectedPhoto] = React.useState();
  const [play, setPlay] = React.useState();
  const [effects, setEffects] = React.useState({
    filter: 'none',
    layout: responsive === 'small' ? 'grid' : 'collage',
  });
  const [showMenu, setShowMenu] = React.useState();

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

  React.useEffect(() => {
    setSelectedPhoto(selected >= 0 ? photos[selected] : undefined)},
    [photos, selected],
  );

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
    const controls = (
      <Controls
        left={leftControl}
        label={(
          <ControlLabel label={name} onClick={() => setShowMenu(!showMenu)} />
        )}
        right={rightControl}
        menu={showMenu ? (
          <Box>
            <MenuButton
              label="Slideshow"
              Icon={Play}
              onClick={() => {
                setShowMenu(false);
                setPlay(true);
              }}
            />
            <MenuButton
              label="Filter"
              Icon={Brush}
              value={effects.filter}
              onClick={() => {
                const index = filters.indexOf(effects.filter) + 1;
                const filter = filters[index < filters.length ? index : 0];
                setEffects({ ...effects, filter });
              }}
            />
            <MenuButton
              label="Layout"
              value={effects.layout}
              Icon={GridIcon}
              onClick={() => {
                const index = layouts.indexOf(effects.layout) + 1;
                const layout = layouts[index < layouts.length ? index : 0];
                setEffects({ ...effects, layout });
              }}
            />
            {menu && menu.filter(i => i)}
          </Box>
        ) : undefined}
      />
    );

    content = (
      <Screen controls={controls} background="black">
        <Box flex={false}>
          {refreshing && <Box background="accent-1" pad="large" />}
          {!photos ? (
            <Box flex align="center" justify="center">
              <Loading Icon={Gallery} />
            </Box>
          ) : (
            <Box flex>
              {responsive === 'small'
                ? (
                  <InfiniteScroll items={photos} step={3}>
                    {(photo, index) => (
                      <Box
                        key={photo.id || photo.name}
                        border={{ size: 'medium', side: 'bottom', color: 'black'}}
                      >
                        <Photo
                          fill="horizontal"
                          photo={photo}
                          index={index}
                          event={event}
                          effects={effects}
                          onDelete={onDelete}
                          onClick={() => setSelected(index)}
                        />
                      </Box>
                    )}
                  </InfiniteScroll>
                ) : (
                  <Grid
                    columns="medium"
                    rows="medium"
                    gap={effects.layout === 'grid' ? 'small' : undefined}
                  >
                    <InfiniteScroll items={photos} step={9}>
                      {(photo, index) => (
                        <Photo
                          key={photo.id || photo.name}
                          photo={photo}
                          index={index}
                          event={event}
                          fill
                          effects={effects}
                          onDelete={onDelete}
                          onClick={() => setSelected(index)}
                        />
                      )}
                    </InfiniteScroll>
                  </Grid>
                )
              }
              {!photos.length && (
                <Box flex align="center" justify="center">
                  <Paragraph>You should add some photos!</Paragraph>
                </Box>
              )}
            </Box>
          )}
          {selectedPhoto && (
            <PhotoLayer
              event={event}
              photo={selectedPhoto}
              index={selected}
              onDelete={onDelete}
              onSelect={(index) =>
                setSelected(index < 0
                  ? photos.length - 1
                  : (index >= photos.length ? 0 : index))}
            />
          )}
        </Box>
      </Screen>
    )
  }

  const onKeyDown = (event) => {
    if (event.ctrlKey) {
      if (event.key === 'p') {
        setPlay(true);
      } else if (event.key === 'b') {
        setEffects({ ...effects, blackAndWhite: !effects.blackAndWhite });
      } else if (event.key === 't') {
        setEffects({ ...effects, toss: !effects.toss });
      }
    }
  }

  return (
    <Keyboard target="document" onKeyDown={onKeyDown}>
      {content}
    </Keyboard>
  );
}

export default Photos;
