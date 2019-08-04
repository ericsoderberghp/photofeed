import React from 'react';
import {
  Box, Button, Form, FormField, Layer, Paragraph, Stack, TextInput,
} from 'grommet';
import { Add } from 'grommet-icons';
import SessionContext from './SessionContext';

const AddPhoto = ({ event, onAdd }) => {
  const session = React.useContext(SessionContext);
  const [naming, setNaming] = React.useState();
  const [userName, setUserName] = React.useState();
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (!session) {
      const stored = localStorage.getItem('userName');
      if (stored) {
        setUserName(stored);
      }
    }
  }, [session]);

  const addPhoto = (file) => {
    const photo = {
      name: file.name,
      type: file.type,
      date: file.lastModified,
      eventId: event.id,
    };
    if (session) {
      photo.userId = session.userId;
    } else if (userName) {
      photo.userName = userName;
      photo.eventToken = event.token;
    }
    const reader = new FileReader();
    reader.onload = (event2) => {
      photo.src = event2.target.result;
      onAdd(photo);
    }
    reader.readAsDataURL(file);
  }

  return (
    <Stack
      guidingChild="last"
      interactiveChild={(userName || session) ? 'first' : 'last'}
    >
      <TextInput
        ref={inputRef}
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
        style={{ opacity: 0 }}
      />
      <Box>
        <Button
          title="Add a photo"
          icon={<Add />}
          hoverIndicator
          onClick={() => setNaming(!naming)}
        />
        {naming && (
          <Layer
            plain
            position="top"
            onEsc={() => setNaming(false)}
            onClickOutside={() => setNaming(false)}
          >
            <Box background="neutral-3" pad="xlarge" align="center">
              <Paragraph textAlign="center">
                Can we get your real name so we know who's added which photo?
                It's friendlier that way :)
              </Paragraph>
              <Form
                value={{ name: '' }}
                onSubmit={({ value: { name }}) => {
                  localStorage.setItem('userName', name);
                  setUserName(name);
                  setNaming(false);
                  inputRef.current.click();
                }}
              >
                <FormField name="name" placeholder="Your Name" required />
                <Box
                  direction="row"
                  justify="center"
                  align="center"
                  margin={{ top: 'large' }}
                  gap="large"
                >
                  <Button type="submit" primary label="Sure" />
                  <Button label="Nope" onClick={() => setNaming(false)} />
                </Box>
              </Form>
            </Box>
          </Layer>
        )}
      </Box>
    </Stack>
  );
}

export default AddPhoto;
