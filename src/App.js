import React from 'react';
import { Grommet } from 'grommet';
import theme from './theme';
import Splash from './Splash';
import Start from './Start';
import Feed from './Feed';
import Manage from './Manage';

function App() {
  const [user, setUser] = React.useState();
  const [event, setEvent] = React.useState();
  const [manage, setManage] = React.useState();

  React.useEffect(() => {
    const activeEventId = localStorage.getItem('activeEventId');
    if (activeEventId) {
      setEvent(JSON.parse(localStorage.getItem(activeEventId)));
    }
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      setUser(false);
    }
  }, []);

  return (
    <Grommet full theme={theme}>
      {user && (manage
        ? (
          <Manage
            user={user}
            onActiveEvent={setEvent}
            onClose={() => setManage(false)}
          />
        ) : <Feed user={user} event={event} onManage={() => setManage(true)} />
      )}
      {user === false && <Start onActiveEvent={setEvent} onUser={setUser} />}
      {user === undefined && <Splash />}
    </Grommet>
  )
}

export default App;
