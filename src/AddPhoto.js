import React from 'react';
import {
  Box, Button, Form, FormField, Layer, Meter, Paragraph, Stack, Text, TextInput,
} from 'grommet';
import { Add } from 'grommet-icons';
import styled, { keyframes } from 'styled-components';
import EXIF from 'exif-js';
import SessionContext from './SessionContext';
import ControlButton from './components/ControlButton';
import { apiUrl } from './utils';

const resolution = 1080;

// map of EXIF orientation value to image rotation angle
const orientationRotation = {
  3: 180,
  4: 180,
  5: 270,
  6: 90,
  7: 90,
  8: 270,
};

const SpinningMeter = styled(Meter)`
  animation: ${keyframes`from { 
    transform: rotate(0deg); 
} to { 
    transform: rotate(360deg); 
}`} 3s infinite;
`;

const AddPhoto = ({ event, onAdd }) => {
  const session = React.useContext(SessionContext);
  const [naming, setNaming] = React.useState();
  const [eventUser, setEventUser] = React.useState();
  const [adding, setAdding] = React.useState(0);
  const [total, setTotal] = React.useState(0);
  const inputRef = React.useRef();

  React.useEffect(() => {
    if (!session) {
      const stored = localStorage.getItem('eventUser');
      if (stored) {
        setEventUser(JSON.parse(stored));
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
    } else if (eventUser) {
      photo.eventUserName = eventUser.name;
      photo.eventUserToken = eventUser.token;
      photo.eventToken = event.token;
    }
    let orientation;

    // read EXIF data
    EXIF.getData(file, function () {
      orientation = EXIF.getTag(file, "Orientation");
    });

    // read file, load into an img, scale and rotate in a canvas
    const reader = new FileReader();
    reader.onload = (event2) => {
      const img = document.createElement('img');

      img.onload = () => {
        setAdding(prevAdding => prevAdding - 1);
        const canvas = document.createElement('canvas');
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
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

        const context = canvas.getContext('2d');
        // when receiving a photo from a camera or the Photos app, it hasn't been
        // "exported" and has it's orientation encoded in EXIF. If we detect
        // this situation, handle the rotation in the way we draw to the canvas.
        if (orientation >= 3) {
          if (orientation >= 5) { // 90deg or 270deg
            canvas.width = scaledHeight;
            canvas.height = scaledWidth;
            aspectRatio = 1 / aspectRatio;
          } else { // 180deg
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;
          }
          context.translate(canvas.width/2, canvas.height/2);
          context.rotate(orientationRotation[orientation] * Math.PI / 180);
          context.drawImage(img, -scaledWidth/2, -scaledHeight/2, scaledWidth, scaledHeight);
        } else {
          canvas.width = scaledWidth;
          canvas.height = scaledHeight;
          context.drawImage(img, 0, 0, scaledWidth, scaledHeight);
        }

        canvas.toBlob((blob) => {
          const formData = new FormData();
          const savePhoto = { ...photo, aspectRatio };
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
            .then((photo) => {
              setAdding(prevAdding => prevAdding - 1);
              onAdd(photo);
            });
        }, photo.type);
      }

      img.src = event2.target.result;
    }

    reader.readAsDataURL(file);
  }

  return (
    <Stack
      guidingChild={1}
      interactiveChild={(eventUser || session) ? 0 : 1}
    >
      <TextInput
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(event) => {
          const files = event.target.files;
          if (files) {
            setAdding(files.length * 2);
            setTotal(files.length * 2);
            for (let i=0; i<files.length; i++) {
              addPhoto(files[i]);
            }
          }
        }}
        style={{ opacity: 0, width: 48 }}
      />
      <Box style={adding ? { opacity: 0 } : undefined}>
        <ControlButton
          title="Add a photo"
          primary
          Icon={Add}
          onClick={() => setNaming(!naming)}
        />
        {naming && (
          <Layer
            plain
            modal
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
                  const array = crypto.getRandomValues(new Uint16Array(16));
                  const token = Array.from(array, (byte) =>
                    ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
                  const eventUser = { name, token };
                  localStorage.setItem('eventUser', JSON.stringify(eventUser));
                  setEventUser(eventUser);
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
      {adding ? (
        <Box pad="small">
          <Stack anchor="center">
            <SpinningMeter
              type="circle"
              size="full"
              thickness={total > 2 ? 'large' : 'xlarge'}
              max={total}
              values={[{ value: total - adding }]}
            />
            {total > 2 && (
              <Text
                weight="bold"
                style={{ display: 'block', marginTop: '-8px' }}
              >
                {Math.ceil(adding / 2)}
              </Text>
            )}
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
}

export default AddPhoto;
