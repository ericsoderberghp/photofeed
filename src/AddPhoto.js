import React from 'react';
import { Box, Button, Stack, TextInput } from 'grommet';
import { Add } from 'grommet-icons';
import { uuidv4 } from './utils';

const AddPhoto = ({ event, user, onAdd }) => {

  const addPhoto = (file) => {
    const id = uuidv4();
    const photo = {
      eventId: event.id,
      userId: user.id,
      id,
      name: file.name,
      type: file.type,
      date: file.lastModified,
      srcId: `${id}-${file.name}`,
    };
    localStorage.setItem(id, JSON.stringify(photo));

    const reader = new FileReader();
    reader.onload = (event2) => {
      photo.src = event2.target.result;
      onAdd(photo);
    }
    reader.readAsDataURL(file);
  }

  return (
    <Stack guidingChild="last" interactiveChild="first">
      <TextInput
        type="file"
        accept="image/*"
        capture
        onChange={(event) => {
          const files = event.target.files;
          if (files) {
            for (let i=0; i<files.length; i++) {
              addPhoto(files[i]);
            }
          }
        }}
      />
      <Box background="dark-1">
        <Button title="Add a photo" icon={<Add />} hoverIndicator />
      </Box>
    </Stack>
  );
}

export default AddPhoto;
