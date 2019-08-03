// NOTE: our routing needs are so simple, we roll our own
// to avoid dependencies on react-router, to stay leaner.

import React, { Children, Component } from 'react';
import PropTypes from 'prop-types';

const RouterContext = React.createContext({});

export class Router extends Component {

  state = {};

  componentDidMount() {
    window.addEventListener('popstate', this.onPopState);
    this.onPopState();
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.onPopState);
  }

  onPopState = () => {
    const { location } = document;
    this.setState({ path: location.pathname, search: location.search });
  };

  onPush = nextPath => {
    const { path, search } = this.state;
    if (nextPath !== path) {
      if (nextPath.startsWith('http')) {
        window.location = nextPath;
      } else {
        window.history.pushState(
          undefined,
          undefined,
          `${nextPath}${search || ''}`,
        );
        this.setState({ path: nextPath });
        window.scrollTo(0, 0);
      }
    }
  };

  render() {
    const { children } = this.props;
    const { path, search } = this.state;
    return (
      <RouterContext.Provider value={{ path, search, push: this.onPush }}>
        {children}
      </RouterContext.Provider>
    );
  }
}

Router.propTypes = {
  children: PropTypes.node.isRequired,
};

export const Routes = ({ children, notFoundRedirect }) => (
  <RouterContext.Consumer>
    {({ path: currentPath }) => {
      const preHash = currentPath && currentPath.split('#')[0];
      let found;
      Children.forEach(children, child => {
        const { path, exact } = child.props;
        const prefix = path ? path.split(':')[0] : '';
        if (
          !found &&
          currentPath &&
          ((exact && preHash === path) || (!exact && preHash.startsWith(prefix)))
        ) {
          found = child;
        }
      });
      if (currentPath && !found) {
        window.location.replace(notFoundRedirect);
      }
      return found;
    }}
  </RouterContext.Consumer>
);

Routes.propTypes = {
  children: PropTypes.node.isRequired,
  notFoundRedirect: PropTypes.string.isRequired,
};

export const Route = ({ component: Comp, exact, path, redirect }) => (
  <RouterContext.Consumer>
    {({ path: currentPath }) => {
      const preHash = currentPath.split('#')[0];
      const prefix = !exact && path.split(':')[0];
      if (currentPath && (
        (exact && preHash === path)
        || (!exact && preHash.startsWith(prefix))
      )) {
        if (redirect) {
          window.location.replace(redirect);
        } else if (Comp) {
          const props = {};
          if (!exact) {
            const propName = path.split(':')[1];
            props[propName] = preHash.slice(prefix.length);
          }
          return <Comp {...props} />;
        } else {
          console.error('Route missing component or redirect');
        }
      }
      return null;
    }}
  </RouterContext.Consumer>
);

Route.propTypes = {
  component: PropTypes.func,
  path: PropTypes.string.isRequired,
  redirect: PropTypes.string,
};

Route.defaultProps = {
  component: undefined,
  redirect: undefined,
};

export const Clicker = ({ children, path }) => (
  <RouterContext.Consumer>
    {({ push }) =>
      children(event => {
        event.preventDefault();
        push(path);
      })
    }
  </RouterContext.Consumer>
);

Clicker.propTypes = {
  children: PropTypes.func.isRequired,
  path: PropTypes.string.isRequired,
};

export const Watcher = ({ children }) => (
  <RouterContext.Consumer>
    {({ path }) => children(path)}
  </RouterContext.Consumer>
);

Watcher.propTypes = {
  children: PropTypes.func.isRequired,
};

export const Pusher = ({ children }) => (
  <RouterContext.Consumer>
    {({ push }) => children(push)}
  </RouterContext.Consumer>
);

Pusher.propTypes = {
  children: PropTypes.func.isRequired,
};

export default Router;
