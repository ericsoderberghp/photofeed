import React from 'react';
import { Box, Button, Image, Stack, Video } from 'grommet';
import { Blank, Play, Video as VideoIcon } from 'grommet-icons';
import Loading from './components/Loading';

const resolution = 1080;

const Photo = ({
  event, photo, index, fill, effects, onDelete, ...rest
 }) => {
  const [videoState, setVideoState] = React.useState('paused');
  const videoRef = React.useRef();

  let height;
  let width;
  if (fill === "horizontal") {
    height = `${100 * (1 / photo.aspectRatio)}vw`;
  } else if (!fill) {
    if (photo.aspectRatio >= 1) {
      width = `${(resolution / 2)}px`;
      height = `${(resolution / 2) * (1 / photo.aspectRatio)}px`;
    } else {
      height = `${(resolution / 2)}px`;
      width = `${(resolution / 2) * (photo.aspectRatio)}px`;
    }
  } else { // fill
    height = '100%';
    width = '100%';
  }

  let style;
  if (effects) {
    style = {};
    if (effects.filter === 'B/W') {
      style.filter = 'grayscale(100%) contrast(1.1)';
    } else if (effects.filter === 'sepia') {
      style.filter = 'sepia(100%)';
    } else if (effects.filter === 'vivid') {
      style.filter = 'saturate(200%)';
    }
    if (effects.layout === 'collage') {
      style.transform =
        `scale(1.2${(index % 4) + 1}) rotate(${((index % 3) - 1) * 5}deg)`;
    }
  }

  return (
    <Box
      id={photo.id}
      flex={false}
      height={height}
      width={width}
      align="center"
      justify="center"
      animation={{ type: 'fadeIn', delay: index * 100 }}
      {...rest}
    >
      <Box fill={fill}>
        {photo.type.startsWith('image/') && (
          <Image
            fit="contain"
            src={photo.src}
            width={fill ? "100%" : undefined}
            style={style}
          />
        )}
        {photo.type.startsWith('video/') && (
          <Stack anchor="center" style={style}>
            <Video
              ref={videoRef}
              fit="contain"
              controls={false}
              width={fill ? "100%" : undefined}
              style={style}
              onPlaying={() => setVideoState('playing')}
              onPause={() => setVideoState('paused')}
              onEnded={() => setVideoState('paused')}
            >
              <source src={`${photo.src}#t=0.1`} type={photo.type} />
            </Video>
            <Button
              icon={videoState === 'paused' ? <Play /> : <Blank />}
              hoverIndicator
              onClick={() => {
                if (videoState !== 'paused') {
                  videoRef.current.pause();
                  setVideoState('paused');
                } else {
                  videoRef.current.play();
                  setVideoState('loading');
                }
              }}
            />
            {videoState === 'loading' && <Loading Icon={VideoIcon} />}
          </Stack>
        )}
      </Box>
    </Box>
  );
}

export default Photo;
