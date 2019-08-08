import React from 'react';
import { Box, Button, Image, Stack, Text } from 'grommet';
import { Calendar, Trash } from 'grommet-icons';
import SessionContext from './SessionContext';
import RoutedButton from './RoutedButton';
import { Pusher } from './Router';
import { apiUrl } from './utils';

const resolution = 1080;

const Photo = ({
  event, photo, index, push, fill, effects, onDelete,
 }) => {
  const session = React.useContext(SessionContext);
  const [detail, setDetail] = React.useState();
  const [eventUser, setEventUser] = React.useState();
  const [confirmDelete, setConfirmDelete] = React.useState();
  const [deleting, setDeleting] = React.useState();
  const [deleted, setDeleted] = React.useState();
  const [ignoreDrag, setIgnoreDrag] = React.useState();
  let touchStartX;
  let touchStartY;

  React.useEffect(() => {
    const stored = localStorage.getItem('eventUser');
    if (stored) {
      setEventUser(JSON.parse(stored));
    }
  }, [])

  React.useEffect(() => {
    const onScroll = (event) => {
      if (!ignoreDrag && detail) {
        setDetail(false);
      }
    }
    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  }, [detail, ignoreDrag])

  if (deleted) return null;

  const doDelete = () => {
    setDeleting(true);
    fetch(`${apiUrl}/photos/${photo.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session ? session.token : eventUser.token}`,
      },
    })
      .then(() => setConfirmDelete(undefined))
      .then(() => setDeleted(true))
      .then(() => onDelete(photo))
      .catch(() => setDeleting(false));
  }

  let deleteControls;
  if ((session && (session.admin || session.userId === event.userId))
    || (eventUser && eventUser.token === photo.eventUserToken)) {
    deleteControls = (
      <Box direction="row" margin={{ top: 'medium' }}>
        {confirmDelete && !deleting && (
          <Button
            icon={ <Trash color="status-critical" />}
            hoverIndicator
            disabled={deleting}
            onClick={doDelete}
          />
        )}
        {onDelete && (
          <Button
            icon={<Trash color="light-4" />}
            hoverIndicator
            onClick={() => setConfirmDelete(!confirmDelete)}
          />
        )}
      </Box>
    )
  }

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
    if (effects.blackAndWhite) {
      style.filter = 'grayscale(100%) contrast(1.1)';
    }
    if (effects.toss) {
      style.transform =
        `scale(1.2${(index % 4) + 1}) rotate(${((index % 3) - 1) * 5}deg)`;
    }
    if (detail) {
      style.transform = `translateX(-50%)`;
    }
  }

  return (
    <Box
      id={photo.id}
      height={height}
      width={width}
      align="center"
      justify="center"
      animation={{ type: 'fadeIn', delay: index * 100 }}
      onTouchStart={(event) => {
        if (event.touches.length === 1) {
          touchStartX = event.touches[0].clientX;
          touchStartY = event.touches[0].clientY;
        }
      }}
      onTouchMove={(event) => {
        if (event.touches.length === 1) {
          event.preventDefault();
          if (!ignoreDrag) {
            const deltaX = event.touches[0].clientX - touchStartX;
            const deltaY = Math.abs(event.touches[0].clientY - touchStartY);
            if (!detail && deltaX < -100 && deltaY < 40) {
              setIgnoreDrag(true);
              setDetail(true);
            } else if (detail && deltaX > 100 && deltaY < 40) {
              setIgnoreDrag(true);
              setDetail(false);
            }
          }
        }
      }}
      onTouchEnd={(event) => {
        setIgnoreDrag(false);
        touchStartX = undefined;
        touchStartY = undefined;
      }}
      onTouchCancel={() => {
        setIgnoreDrag(false);
        touchStartX = undefined;
        touchStartY = undefined;
      }}
      onWheel={(event) => {
        if (event.deltaX) {
          event.preventDefault();
        }
        if (!ignoreDrag) {
          if (!detail && event.deltaX > 0) {
            setIgnoreDrag(true);
            setDetail(true);
            setTimeout(() => setIgnoreDrag(false), 100);
          } else if (detail && (event.deltaX < 0)) {
            setIgnoreDrag(true);
            setDetail(false);
            setTimeout(() => setIgnoreDrag(false), 100);
          }
        }
      }}
    >
      <Stack
        fill
        guidingChild={1}
        anchor="right"
        interactiveChild={detail ? 0 : 1}
      >
        <Box
          align="end"
          justify="end"
          pad="medium"
          gap="small"
          animation={detail ? 'fadeIn' : undefined}
          style={!detail ? { opacity: 0 } : undefined}
        >
          {!event && (
            <RoutedButton
              icon={<Calendar />}
              hoverIndicator
              path={`/events/${photo.eventToken}#${photo.id}`}
            />
          )}
          <Text size="large" weight="bold">
            {((session && session.userId === photo.userId)
              || (eventUser && eventUser.token === photo.eventUserToken))
              ? 'me' : (photo.eventUserName || photo.userName)}
          </Text>
          <Text color="dark-4">
            {(new Date(photo.date))
              .toLocaleTimeString('default', {
                weekday: 'short',
                hour: 'numeric',
                minute: '2-digit',
              })}
          </Text>
          {onDelete && deleteControls}
        </Box>
        <Box
          fill={fill}
          animation={detail
            ? { type: 'slideLeft', size: 'large' }
            : (detail === false
              ? { type: 'slideRight', size: 'large' }
              : undefined)
          }
        >
          <Image
            fit="contain"
            src={photo.src}
            width={fill ? "100%" : undefined}
            style={style}
          />
        </Box>
        {deleting && (
          <Box
            height={height}
            width={width || `${resolution / 2}px`}
            background={{ color: 'dark-2', opacity: 'strong' }}
          />
        )}
      </Stack>
    </Box>
  );
}

export default (props) => (
  <Pusher>
    {(push) => <Photo {...props} push={push} />}
  </Pusher>
);
