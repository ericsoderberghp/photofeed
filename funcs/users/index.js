const Firestore = require('@google-cloud/firestore');
const crypto = require('crypto');

const db = new Firestore();

const hashPassword = (password) => {
  const salt = crypto.randomBytes(128).toString('base64');
  const iterations = 10000;
  const len = 64;
  const digest = 'sha512';
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, salt, iterations, len, digest, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve({ salt, iterations, len, digest, hash: hash.toString('base64') });
      }
    });
  });
}

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

const sanitize = (userSnap) => {
  const user = userSnap.data();
  user.id = userSnap.id;
  delete user.auth;
  return user;
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.users = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  const sanitizeAndReturn = (userSnap) =>
    res.json(sanitize(userSnap));

  if (req.method === 'GET') {
    return authorize(req, res)
      .then(() => {
        const id = decodeURIComponent(req.url.split('/')[1] || '');
        if (id) {
          return db.collection('users').doc(id).get()
            .then(userSnap => {
              if (!userSnap.exists) {
                res.status(404).send();
              } else {
                sanitizeAndReturn(userSnap);
              }
            });
        }
        return db.collection('users').get()
          .then(querySnap =>
            res.json(querySnap.docs.map((userSnap) => sanitize(userSnap))));
      });
  }

  if (req.method === 'POST') {
    const { name, email, password, admin } = req.body;
    return authorize(req, res)
      .then(() => db.collection('users').where('email', '==', email).get())
      .then((querySnap) => {
        if (!querySnap.empty) {
          res.status(400).send(`${email} already exists`);
          throw new Error('already exists');
        }
        return hashPassword(password)
          .then((auth) => db.collection('users').add({
            name,
            email,
            admin,
            auth,
            created: (new Date()).toISOString(),
            token: crypto.randomBytes(16).toString('base64'),
          }));
      })
      .then(userRef => userRef.get())
      .then(sanitizeAndReturn);
  }

  if (req.method === 'PUT') {
    const id = decodeURIComponent(req.url.split('/')[1] || '');
    const { name, email, password, admin } = req.body;
    const userRef = db.collection('users').doc(id);
    return authorize(req, res)
      .then(() => userRef.get())
      .then((userSnap) => {
        if (!userSnap.exists) {
          res.status(404).send();
        } else if (password) {
          return hashPassword(password)
            .then((auth) => userRef.update({
              name,
              email,
              admin,
              auth,
            }))
            .then(() => userRef.get())
            .then(sanitizeAndReturn);
        } else {
          return userRef.update({
            name,
            email,
            admin,
          })
          .then(() => userRef.get())
          .then(sanitizeAndReturn);
        }
      });
  }

  if (req.method === 'DELETE') {
    const id = decodeURIComponent(req.url.split('/')[1]);
    return authorize(req, res)
      .then(session => db.collection('users').doc(id).delete())
      .then(() => res.status(204).send());
  }

  res.status(405).send();
};
