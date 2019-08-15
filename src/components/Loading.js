import React from 'react';
import { Box } from 'grommet';

const Loading = ({ Icon }) => (
  <Box flex justify="center" align="center" margin="xlarge">
    <Box animation="pulse">
      <Icon size="large" color="neutral-1" />
    </Box>
  </Box>
);

export default Loading;
