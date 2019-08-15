import React from 'react';
import { Box, Button, Text } from 'grommet';
import RoutedButton from './RoutedButton';

const MenuButton = ({ label, Icon, color, path, value, onClick }) => {
  const B = path ? RoutedButton : Button;
  return (
    <B path={path} hoverIndicator onClick={onClick}>
      <Box
        pad="small"
        direction="row"
        align="center"
        justify="between"
        gap="small"
        responsive={false}
      >
        <Text size="large" color={color}>{label}</Text>
        <Box direction="row" align="center" gap="small">
          <Text color="dark-4">{value}</Text>
          <Icon color={color} />
        </Box>
      </Box>
    </B>
  );
}

export default MenuButton;
