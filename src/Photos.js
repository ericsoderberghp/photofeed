import React from 'react';
import { Box, Grid, Paragraph, ResponsiveContext } from 'grommet';
import Photo from './Photo';

const Photos = ({ event, photos }) => {
  return (
    <ResponsiveContext.Consumer>
      {(responsive) => (
        <Box flex={false}>
          {responsive === 'small'
            ? photos.map(photo => (
                <Photo key={photo.name} photo={photo} event={event} />))
            : (
              <Grid columns="medium" rows="medium">
                {photos.map(photo => (
                  <Photo key={photo.name} photo={photo} event={event} />
                ))}
              </Grid>
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
