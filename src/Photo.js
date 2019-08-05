import React from 'react';
import { Box, Button, Image, Stack } from 'grommet';
import { Trash } from 'grommet-icons';
import SessionContext from './SessionContext';
import { apiUrl } from './utils';

const resolution = 1080;

const Photo = ({ event, photo: photoArg, onDelete }) => {
  const session = React.useContext(SessionContext);
  const [photo, setPhoto] = React.useState(photoArg);
  const [confirmDelete, setConfirmDelete] = React.useState();
  const [deleting, setDeleting] = React.useState();

  const scale = (event) => {
    const image = event.target;
    const canvas = document.createElement('canvas');
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    const aspectRatio = naturalWidth / naturalHeight;

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
        scaledHeight = 1024;
        scaledWidth = naturalWidth * (scaledHeight / naturalHeight);
      }
    }

    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    canvas.toBlob((blob) => {
      const formData = new FormData();
      const noSrcPhoto = { ...photo, aspectRatio };
      delete noSrcPhoto.src;
      formData.append('photo', JSON.stringify(noSrcPhoto));
      formData.append('file', blob);
      fetch(`${apiUrl}/photos`, {
        method: 'POST',
        headers: {
          'Authorization': session ? `Bearer ${session.token}` : '',
          // 'Content-Type': 'multipart/form-data',
        },
        body: formData,
      })
        .then(response => response.json())
        .then(setPhoto); // src is now a file path
    }, photo.type);

    const scaledPhoto = { ...photo, aspectRatio }; // still has src
    setPhoto(scaledPhoto);
  }

  const height = photo.aspectRatio ? `${100 * (1 / photo.aspectRatio)}vw` : '80vh';

  return (
    <Box flex={false} animation="fadeIn">
      <Stack anchor="bottom-right">
        <Box height={height} overflow="hidden">
          <Image
            fit="cover"
            src={photo.src}
            onLoad={!photo.aspectRatio ? scale : undefined}
          />
        </Box>
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
                  fetch(`${apiUrl}/photos/${photo.id}`, {
                    method: 'DELETE',
                    headers: {
                      'Authorization': `Bearer ${session.token}`,
                    },
                  })
                    .then(() => setConfirmDelete(undefined))
                    .then(() => onDelete(photo))
                    .catch(() => setDeleting(false));
                  setDeleting(true);
                }}
              />
            )}
            <Button
              icon={<Trash />}
              hoverIndicator
              onClick={() => setConfirmDelete(!confirmDelete)}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
}

export default Photo;
