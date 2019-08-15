import React from 'react';
import { Box, ResponsiveContext } from 'grommet';
import ControlLabel from './ControlLabel';

const Controls = ({ left, label, right, menu }) => {
  const responsive = React.useContext(ResponsiveContext);
  const menuContent = menu && (
    <Box
      background={{ color: 'black', opacity: 'strong' }}
      round={{ size: 'medium', corner: responsive === 'small' ? 'top' : 'bottom' }}
      overflow="hidden"
      responsive={false}
    >
      {menu}
    </Box>
  );

  return (
    <Box
      margin="medium"
      responsive={false}
      style={{
        position: 'fixed',
        zIndex: 100,
        bottom: responsive === 'small' ? 0 : undefined,
        top: responsive !== 'small' ? 0 : undefined,
        left: responsive !== 'small' ? '50%' : undefined,
        transform: responsive !== 'small' ? 'translateX(-50%)' : undefined,
        // width: responsive === 'small' ? '100vw' : 'auto',
      }}
    >
      {responsive === 'small' && menuContent}
      <Box
        flex={false}
        responsive={false}
        direction="row"
        justify="between"
        align="center"
        round={menu
          ? {
            size: responsive === 'small' ? 'large' : 'medium',
            corner: responsive === 'small' ? 'bottom' : 'top',
          } : (responsive === 'small' ? 'large' : 'medium')
        }
        background={{ color: 'black', opacity: 'strong' }}
      >
        {left}
        {right}
        {typeof label === 'string' ? <ControlLabel label={label} /> : label}
      </Box>
      {responsive !== 'small' && menuContent}
    </Box>
  );
}

export default Controls;
