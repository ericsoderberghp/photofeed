import React from 'react';
import { Box, Button, Heading } from 'grommet';

const ControlLabel = ({ label, onClick }) => {

  let content = (
    <Box
      fill="horizontal"
      height="xxsmall"
      align="center"
      justify="center"
      pad={{ horizontal: 'medium' }}
    >
      <Heading size="small" margin="none" truncate>
        {label}
      </Heading>
    </Box>
  );

  if (onClick) {
    content = (
      <Box
        alignSelf="stretch"
        flex
        round="large"
        overflow="hidden"
        responsive={false}
        style={{ zIndex: 1 }}
      >
        <Button fill="horizontal" hoverIndicator onClick={onClick}>
          {content}
        </Button>
      </Box>
    );
  }

  return content;
}

export default ControlLabel;
