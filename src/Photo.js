import React from 'react';
import { Box, Button, Image, Stack } from 'grommet';
import { Trash } from 'grommet-icons';
import SessionContext from './SessionContext';
import { Pusher } from './Router';
import { apiUrl } from './utils';

const resolution = 1080;

const Photo = ({
  event, photo, index, push, fill, effects, random, onDelete,
 }) => {
  const session = React.useContext(SessionContext);
  const [confirmDelete, setConfirmDelete] = React.useState();
  const [deleting, setDeleting] = React.useState();
  const [deleted, setDeleted] = React.useState();

  if (deleted) return null;

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
    // height = '100%';
    width = '100%';
  }

  let style;
  if (effects) {
    style = {};
    if (effects.blackAndWhite) {
      style.filter = 'grayscale(100%) contrast(1.1)';
    }
    if (effects.toss) {
      style.transform =
        `scale(1.2${(index % 4) + 1}) rotate(${((index % 3) - 1) * 5}deg)`;
    }
  }

  let content = (
    <Box
      id={photo.id}
      height={height}
      width={width}
      align="center"
      justify="center"
      animation={{ type: 'fadeIn', delay: index * 100 }}
      onClick={!event ? () => push(`/events/${photo.eventToken}#${photo.id}`) : undefined}
    >
      <Image
        fit="contain"
        src={photo.src}
        width={fill ? "100%" : undefined}
        style={style}
      />
    </Box>
  );

  if (onDelete) {
    content = (
      <Box flex={false} animation={{ type: 'fadeIn', delay: index * 100 }}>
        <Stack anchor="bottom-right">
          {content}
          {deleting && (
            <Box
              height={height}
              width={width || `${resolution / 2}px`}
              background={{ color: 'dark-2', opacity: 'strong' }}
            />
          )}
          {!photo.id && (
            <Box
              height={height}
              width={width || `${resolution / 2}px`}
              background={{ color: 'light-2', opacity: 'strong' }}
            />
          )}
          {session && (session.admin || session.userId === event.userId) && (
            <Box>
              {confirmDelete && !deleting && (
                <Button
                  icon={(
                    <Trash color={deleting ? 'status-unknown' : 'status-critical'} />
                  )}
                  hoverIndicator
                  disabled={deleting}
                  onClick={() => {
                    setDeleting(true);
                    fetch(`${apiUrl}/photos/${photo.id}`, {
                      method: 'DELETE',
                      headers: {
                        'Authorization': `Bearer ${session.token}`,
                      },
                    })
                      .then(() => setConfirmDelete(undefined))
                      .then(() => setDeleted(true))
                      .then(() => onDelete(photo))
                      .catch(() => setDeleting(false));
                  }}
                />
              )}
              {onDelete && (
                <Button
                  icon={<Trash />}
                  hoverIndicator
                  onClick={() => setConfirmDelete(!confirmDelete)}
                />
              )}
            </Box>
          )}
        </Stack>
      </Box>
    );
  }

  return content;
}

export default (props) => (
  <Pusher>
    {(push) => <Photo {...props} push={push} />}
  </Pusher>
);
