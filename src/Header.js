import React from 'react';
import { Box } from 'grommet';

const Header = (props) => (
  <Box
    direction="row"
    justify="between"
    align="center"
    margin={{ bottom: 'large' }}
    {...props}
  />
);

export default Header;
