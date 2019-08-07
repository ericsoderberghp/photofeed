import React from 'react';
import {
  Box, Button, Form, FormField, Layer, Paragraph, Stack, TextInput,
} from 'grommet';
import { Add } from 'grommet-icons';
import EXIF from 'exif-js';
import SessionContext from './SessionContext';
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

const AddPhoto = ({ event, onAdding, onAdd }) => {
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
    onAdding(true);
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
              onAdding(false);
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
      guidingChild="last"
      interactiveChild={(userName || session) ? 'first' : 'last'}
    >
      <TextInput
        ref={inputRef}
        type="file"
        accept="image/*"
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
