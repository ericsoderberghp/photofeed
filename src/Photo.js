import React from 'react';
import { Box, Button, Image, Stack } from 'grommet';
import { Trash } from 'grommet-icons';

const Photo = ({ photo, onDelete }) => {
  const [src, setSrc] = React.useState(photo.src);
  const [aspectRatio, setAspectRatio] = React.useState(photo.aspectRatio);
  const [confirmDelete, setConfirmDelete] = React.useState();

  React.useEffect(() => {
    const stored = localStorage.getItem(photo.srcId);
    if (stored) {
      setSrc(stored);
    }
  }, [photo]);

  const scale = (event) => {
    const image = event.target;
    const canvas = document.createElement('canvas');
    const naturalWidth = image.naturalWidth;
    const naturalHeight = image.naturalHeight;
    const nextAspectRatio = naturalWidth / naturalHeight;
    let scaledWidth;
    let scaledHeight;
    if (nextAspectRatio < 1) { // portrait
      scaledWidth = 1024;
      scaledHeight = naturalHeight * (scaledWidth / naturalWidth);
    } else {
      scaledHeight = 1024;
      scaledWidth = naturalWidth * (scaledHeight / naturalHeight);
    }
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    const scaledDataUrl = canvas.toDataURL(photo.type);
    localStorage.setItem(photo.srcId, scaledDataUrl);
    // remember aspect ratio
    const nextPhoto = { ...photo, aspectRatio: nextAspectRatio };
    delete nextPhoto.src;
    localStorage.setItem(photo.id, JSON.stringify(nextPhoto));
    setAspectRatio(nextAspectRatio);
  }

  return (
    <Box basis={aspectRatio ? `${100 * (1 / aspectRatio)}vw` : '80vh'} flex={false}>
      <Stack fill anchor="bottom-right">
        <Box fill overflow="hidden">
          <Image
            fit="cover"
            src={src}
            onLoad={!aspectRatio ? scale : undefined}
          />
        </Box>
        <Box>
          {confirmDelete && (
            <Button
              icon={<Trash color="status-critical" />}
              hoverIndicator
              onClick={() => {
                localStorage.removeItem(photo.srcId);
                localStorage.removeItem(photo.id);
                onDelete();
              }}
            />
          )}
          <Button
            icon={<Trash />}
            hoverIndicator
            onClick={() => setConfirmDelete(!confirmDelete)}
          />
        </Box>
      </Stack>
    </Box>
  );
}

export default Photo;
