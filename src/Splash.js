import React from 'react';
import { Box, Heading } from 'grommet';
import { Image } from 'grommet-icons';
import Header from './Header';
import Loading from './Loading';

const Splash = () => (
  <Box animation="fadeIn">
    <Header justify="center">
      <Heading size="small" margin="small">PhotoFeed</Heading>
    </Header>
    <Loading Icon={Image} />
  </Box>
);

export default Splash;
