const Firestore = require('@google-cloud/firestore');
const crypto = require('crypto');

const db = new Firestore();

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
exports.users = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }
  if (req.method === 'GET') {
    return authorize(req, res)
      .then(() => db.collection('users').get())
      .then(querySnap =>
        res.json(querySnap.docs.map((snap) => {
          const user = snap.data();
          user.id = snap.id;
          delete user.auth;
          return user;
        })))
  }
  if (req.method === 'POST') {
    const { name, email } = req.body;
    return authorize(req, res)
      .then(() => db.collection('users').where('email', '==', email).get())
      .then((querySnap) => {
        if (!querySnap.empty) {
          res.status(400).send(`${email} already exists`);
          throw new Error('already exists');
        }
        return db.collection('users').add({
          name,
          email,
          token: crypto.randomBytes(16).toString('base64'),
        })
      })
      .then(userRef => userRef.get())
      .then(userSnap => res.json({ id: userSnap.id, ...userSnap.data() }))
  }
  if (req.method === 'DELETE') {
    const id = decodeURIComponent(req.url.split('/')[1]);
    return authorize(req, res)
      .then(session => db.collection('users').doc(id).delete())
      .then(() => res.status(204).send());
  }
  res.status(405).send();
};
