import React from 'react';
import { Box } from 'grommet';

const Header = React.forwardRef((props, ref) => (
  <Box
    ref={ref}
    direction="row"
    justify="between"
    align="center"
    margin={{ bottom: 'large' }}
    {...props}
  />
));

export default Header;
