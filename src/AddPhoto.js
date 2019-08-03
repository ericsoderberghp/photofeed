import React from 'react';
import { Box, Button, Stack, TextInput } from 'grommet';
import { Add } from 'grommet-icons';

const AddPhoto = ({ onAdd }) => {

  const addPhoto = (file) => {
    const photo = {
      name: file.name,
      type: file.type,
      date: file.lastModified,
    };
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
