import React from 'react';
import { Box, Paragraph, ResponsiveContext } from 'grommet';
import Photo from './Photo';

const Photos = ({ event, photos, onDelete }) => {
  return (
    <ResponsiveContext.Consumer>
      {(responsive) => (
        <Box flex={false}>
          {responsive === 'small'
            ? photos.map(photo => (
                <Photo
                  key={photo.id || photo.name}
                  photo={photo}
                  event={event}
                  onDelete={onDelete}
                />
            )) : (
              <Box direction="row" wrap>
                {photos.map(photo => (
                  <Photo
                    key={photo.id || photo.name}
                    fill
                    photo={photo}
                    event={event}
                    onDelete={onDelete}
                  />
                ))}
              </Box>
            )
          }
          {!photos.length && (
            <Box basis="medium" align="center" justify="center">
              <Paragraph>We need you to add some photos!</Paragraph>
            </Box>
          )}
        </Box>
      )}
    </ResponsiveContext.Consumer>
  );
}

export default Photos;
