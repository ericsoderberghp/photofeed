import React from 'react';
import { Box, Button, Image, Stack } from 'grommet';
import { Trash } from 'grommet-icons';
import SessionContext from './SessionContext';
import { apiUrl } from './utils';

const resolution = 1080;

const orientationTransform = {
  2: 'scaleX(-1)',
  3: 'rotate(180deg)',
  4: 'rotate(180deg) scaleX(-1)',
  5: 'rotate(270deg) scaleX(-1)',
  6: 'rotate(90deg)',
  7: 'rotate(90deg) scaleX(-1)',
  8: 'rotate(270deg)',
};

// map of EXIF orientation value to image rotation angle
const orientationRotation = {
  3: 180,
  4: 180,
  5: 270,
  6: 90,
  7: 90,
  8: 270,
};

const Photo = ({ event, photo: photoArg, fill, onDelete }) => {
  const session = React.useContext(SessionContext);
  const [photo, setPhoto] = React.useState(photoArg);
  const [confirmDelete, setConfirmDelete] = React.useState();
  const [deleting, setDeleting] = React.useState();
  const [deleted, setDeleted] = React.useState();

  const scale = (event) => {
    const image = event.target;
    const canvas = document.createElement('canvas');
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    let aspectRatio = naturalWidth / naturalHeight;

    let scaledWidth;
    let scaledHeight;
    if (aspectRatio < 1) { // portrait
      if (naturalWidth < resolution) {
        scaledWidth = naturalWidth;
        scaledHeight = naturalHeight;
      } else {
        scaledWidth = resolution;
        scaledHeight = naturalHeight * (scaledWidth / naturalWidth);
      }
    } else {
      if (naturalHeight < resolution) {
        scaledWidth = naturalWidth;
        scaledHeight = naturalHeight;
      } else {
        scaledHeight = resolution;
        scaledWidth = naturalWidth * (scaledHeight / naturalHeight);
      }
    }
    // console.log('!!! scale', naturalWidth, naturalHeight, photo.orientation, aspectRatio, scaledWidth, scaledHeight);

    const context = canvas.getContext('2d');
    // when receiving a photo from a camera or the Photos app, it hasn't been
    // "exported" and has it's orientation encoded in EXIF. If we detect
    // this situation, handle the rotation in the way we draw to the canvas.
    if (photo.orientation >= 3) {
      if (photo.orientation >= 5) { // 90deg or 270deg
        canvas.width = scaledHeight;
        canvas.height = scaledWidth;
        aspectRatio = 1 / aspectRatio;
      } else { // 180deg
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
      }
      context.translate(canvas.width/2, canvas.height/2);
      context.rotate(orientationRotation[photo.orientation] * Math.PI / 180);
      context.drawImage(image, -scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
    } else {
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      context.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    }
    // for debugging:
    // canvas.style.cssText = 'position:absolute;bottom:0;transform:scale(0.5);bottom:-300px;right:-240px;';
    // document.body.appendChild(canvas);
    canvas.toBlob((blob) => {
      const formData = new FormData();
      const savePhoto = { ...photo, aspectRatio };
      delete savePhoto.orientation; // don't need now that we've scaled it
      delete savePhoto.src;
      formData.append('photo', JSON.stringify(savePhoto));
      formData.append('file', blob);
      fetch(`${apiUrl}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': session ? `Bearer ${session.token}` : '',
        },
        body: formData,
      })
        .then(response => response.json())
        .then(setPhoto); // src is now a file path
    }, photo.type);

    const scaledPhoto = { ...photo, aspectRatio }; // still has data:uri src
    setPhoto(scaledPhoto);
  }

  if (deleted) return null;

  let orientedAspect;
  if (photo.aspectRatio) {
    if (true || !photo.orientation || photo.orientation <= 4) {
      orientedAspect = photo.aspectRatio;
    } else {
      orientedAspect = 1 / photo.aspectRatio;
    }
  }
  let height;
  let width;
  if (fill === "horizontal") {
    height = orientedAspect ? `${100 * (1 / orientedAspect)}vw` : '80vh';
  } else if (!fill) {
    height = orientedAspect ? `${(resolution / 2) * (1 / orientedAspect)}px` : 'large';
    width = orientedAspect ? `${resolution / 2}px` : 'large';
  } else {
    height = '100%';
    width = '100%';
  }

  // If we haven't scaled it yet, we might have to rotate it
  let style;
  if (photo.orientation) {
    const transform = orientationTransform[photo.orientation];
    if (transform) {
      style = { transform };
    }
  }

  let content = (
    <Box height={height} width={width} overflow="hidden" align="center" justify="center">
      <Image
        fit="contain"
        src={photo.src}
        onLoad={!photo.aspectRatio ? scale : undefined}
        style={style}
      />
    </Box>
  );

  if (onDelete) {
    content = (
      <Box flex={false} animation="fadeIn">
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

export default Photo;
