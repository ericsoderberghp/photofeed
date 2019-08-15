import React from 'react';
import { Box, ResponsiveContext } from 'grommet';

const Screen = ({ background, children, controls }) => {
  const responsive = React.useContext(ResponsiveContext);
  return (
    <Box
      background={background}
      pad={responsive === 'small' ? { bottom: 'xlarge' } : { top: 'large' }}
      style={{ minHeight: '100vh' }}
    >
      {controls}
      {children}
    </Box>
  );
}

export default Screen;
