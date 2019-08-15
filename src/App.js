import React from 'react';
import { Grommet } from 'grommet';
import theme from './theme';
import { Router, Route, Routes } from './Router';
import SessionContext from './SessionContext';
import Splash from './Splash';
import Start from './Start';
import Aggregate from './Aggregate';
import Events from './Events';
import Users from './Users';
import Join from './Join';
import AddUser from './AddUser';
import EditUser from './EditUser';
import Event from './Event';
import AddEvent from './AddEvent';
import EditEvent from './EditEvent';
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
      <Grommet theme={theme} style={{ minHeight: '100vh' }}>
        {session === false ? (
          <Splash />
        ) : (
          <SessionContext.Provider value={session}>
            <Routes notFoundRedirect="/">
              {session && [
                <Route key="/" exact path="/" component={Aggregate} />,
                <Route key="/events" exact path="/events" component={Events} />,
                <Route key="/events/add" path="/events/add" component={AddEvent} />,
                <Route key="/events/edit" path="/events/edit/:id" component={EditEvent} />,
                <Route key="/users" exact path="/users" component={Users} />,
                <Route key="/users/add" path="/users/add" component={AddUser} />,
                <Route key="/users/edit" path="/users/edit/:id" component={EditUser} />
              ]}
              <Route path="/events/:token" component={Event} />
              <Route path="/users/:token" component={Join} />
              {!session && <Start onSession={setSession} />}
            </Routes>
          </SessionContext.Provider>
        )}
      </Grommet>
    </Router>
  )
}

export default App;
