import React from 'react';
import { Box, Button } from 'grommet';
import RoutedButton from './RoutedButton';

const ControlButton = ({ Icon, ...rest }) => {
  const B = rest.path ? RoutedButton : Button;
  return (
    <Box flex={false} round="full" overflow="hidden">
      <B hoverIndicator {...rest}>
        <Box pad="small" responsive={false}><Icon /></Box>
      </B>
    </Box>
  );
}

export default ControlButton;
