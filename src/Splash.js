import React from 'react';
import { Box, Heading } from 'grommet';
import { Image } from 'grommet-icons';
import Controls from './components/Controls';
import Loading from './components/Loading';

const Splash = () => (
  <Box fill animation="fadeIn">
    <Controls justify="center">
      <Heading size="small" margin="small">PhotoFeed</Heading>
    </Controls>
    <Box flex justify="center" align="center">
      <Loading Icon={Image} />
    </Box>
  </Box>
);

export default Splash;
