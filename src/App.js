import React from 'react';
import { Grommet } from 'grommet';
import theme from './theme';
import { Router, Route, Routes } from './Router';
import SessionContext from './SessionContext';
import Splash from './Splash';
import Start from './Start';
import Feed from './Feed';
import Events from './Events';
import Users from './Users';
import Event from './Event';
import { apiUrl } from './utils';

function App() {
  const [session, setSession] = React.useState(false);

  React.useEffect(() => {
    const stored = localStorage.getItem('session');
    if (stored) {
      const savedSession = JSON.parse(stored);
      // validate that it's still good
      fetch(`${apiUrl}/sessions`, {
        headers: {
          'Authorization': `Bearer ${savedSession.token}`,
        },
      })
        .then(response => response.json())
        .then(setSession)
        .catch(() => setSession(undefined));
    } else {
      setSession(undefined);
    }
  }, []);

  return (
    <Router>
      <Grommet full theme={theme}>
        {session === false ? (
          <Splash />
        ) : (
          <SessionContext.Provider value={session}>
            <Routes notFoundRedirect="/">
              <Route path="/events/:token" component={Event} />
              {session ? [
                <Route key="/" exact path="/" component={Feed} />,
                <Route key="/events" exact path="/events" component={Events} />,
                <Route key="/users" exact path="/users" component={Users} />,
              ] : (
                <Start onSession={setSession} />
              )}
            </Routes>
          </SessionContext.Provider>
        )}
      </Grommet>
    </Router>
  )
}

export default App;
