import React from 'react';
import { Box, Paragraph, ResponsiveContext } from 'grommet';
import Photo from './Photo';

const Photos = ({ event, photos, blackAndWhite, onDelete }) => {
  return (
    <ResponsiveContext.Consumer>
      {(responsive) => (
        <Box flex={false}>
          {responsive === 'small'
            ? photos.map(photo => (
                <Photo
                  key={photo.id || photo.name}
                  fill="horizontal"
                  photo={photo}
                  event={event}
                  blackAndWhite={blackAndWhite}
                  onDelete={onDelete}
                />
            )) : (
              <Box direction="row" align="center" justify="center" wrap>
                {photos.map(photo => (
                  <Photo
                    key={photo.id || photo.name}
                    photo={photo}
                    event={event}
                    blackAndWhite={blackAndWhite}
                    onDelete={onDelete}
                  />
                ))}
              </Box>
            )
          }
          {!photos.length && (
            <Box basis="medium" align="center" justify="center">
              <Paragraph>You should add some photos!</Paragraph>
            </Box>
          )}
        </Box>
      )}
    </ResponsiveContext.Consumer>
  );
}

export default Photos;
