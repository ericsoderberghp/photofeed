const Firestore = require('@google-cloud/firestore');
const crypto = require('crypto');

const db = new Firestore();

const checkPassword = (password, user) =>
  new Promise((resolve, reject) => {
    const { auth: { salt, iterations, len, digest, hash } } = user;
    return crypto.pbkdf2(password, salt, iterations, len, digest, (err, checkHash) => {
      if (err) {
        reject(err);
      } else if (checkHash.toString('base64') !== hash) {
        reject();
      } else {
        resolve();
      }
    })
  });

const authorize = (req, res) => {
  const auth = req.get('Authorization');
  if (!auth) {
    res.status(403).send('missing Authorization');
    throw new Error('missing Authorization');
  }
  const token = auth.split(' ')[1];
  if (!token) {
    res.status(403).send('missing Authorization token');
    throw new Error('missing Authorization token');
  }
  return db.collection('sessions')
    .where('token', '==', token).get()
    .then((querySnap) => {
      if (querySnap.empty) {
        res.status(403).send('no session');
        throw new Error('no session');
      }
      const session = querySnap.docs[0].data();
      if (!session.admin) {
        res.status(403).send('not admin');
        throw new Error('not admin');
      }
      return session;
    });
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.sessions = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  if (req.method === 'GET') {
    const token = req.get('Authorization').split(' ')[1];
    return db.collection('sessions')
      .where('token', '==', token).get()
      .then((querySnap) => {
        if (querySnap.empty) {
          res.status(404).send();
        } else {
          res.json(querySnap.docs[0].data());
        }
      });
  }

  if (req.method === 'POST') {
    const { email, password, userToken } = req.body;

    const addSession = (userSnap) => {
      const user = userSnap.data();
      return db.collection('sessions').add({
        userId: userSnap.id,
        admin: user.admin || false,
        created: (new Date()).toISOString(),
        token: crypto.randomBytes(64).toString('base64'),
      }).then(sessionRef => sessionRef.get())
        .then(sessionSnap => res.json(sessionSnap.data()));
    }

    if (userToken) {
      return db.collection('users').where('token', '==', userToken).get()
        .then((querySnap) => {
          if (querySnap.empty) {
            res.status(403).send();
            return;
          }
          const userSnap = querySnap.docs[0];
          return addSession(userSnap);
        });
    }
    
    return db.collection('users').where('email', '==', email).get()
      .then((querySnap) => {
        if (querySnap.empty) {
          res.status(403).send('sorry, not recognized');
          return;
        }
        const userSnap = querySnap.docs[0];
        return checkPassword(password, userSnap.data())
          .then(() => addSession(userSnap))
          .catch(() => res.status(403).send('sorry, not recognized'))
        // return hashPassword(password)
        //   .then(auth => db.collection('users').add({ name, email, auth }))
        //   .then(userRef => userRef.get())
        //   .then(userSnap => addSession(userSnap))
      });
  }
  if (req.method === 'DELETE') {
    const id = decodeURIComponent(req.path.split('/')[1]);
    return authorize(req, res)
      .then(session => db.collection('sessions').doc(id).delete())
      .then(() => res.status(204).send());
  }
  res.status(405).send();
};
