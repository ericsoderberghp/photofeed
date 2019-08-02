import React from 'react';
import { Box } from 'grommet';
import { Image } from 'grommet-icons';

const Splash = () => (
  <Box fill justify="center" align="center">
    <Box animation="pulse">
      <Image size="large" color="accent-2" />
    </Box>
  </Box>
);

export default Splash;
