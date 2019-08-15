import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'grommet';
import { RouterContext } from '../Router';

const RoutedButton = ({ path, ...rest }) => {
  const { push } = React.useContext(RouterContext);
  return (
    <Button
      {...rest}
      href={path}
      onClick={path ? (event) => {
        event.preventDefault();
        push(path);
      } : undefined}
    />
  );
}

RoutedButton.propTypes = {
  path: PropTypes.string.isRequired,
};

export default RoutedButton;
