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
exports.events = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  if (req.method === 'GET') {
    const token = decodeURIComponent(req.url.split('/')[1] || '');
    if (token) { // don't need authorization if we have a token
      return db.collection('events').where('token', '==', token).get()
        .then(querySnap => {
          if (querySnap.empty) {
            res.status(404).send();
          } else {
            const eventSnap = querySnap.docs[0];
            return db.collection('photos')
              .where('eventId', '==', eventSnap.id).get()
              .then(querySnap2 => {
                res.json({
                  id: eventSnap.id,
                  ...eventSnap.data(),
                  photos: querySnap2.docs.map(snap =>
                    ({ id: snap.id, ...snap.data() })),
                });
              })
          }
        });
    }
    
    return authorize(req, res)
      .then((session) =>
        db.collection('events').where('userId', '==', session.userId).get())
      .then(querySnap =>
        res.json(querySnap.docs.map(snap =>
          ({ id: snap.id, ...snap.data() }))))
  }

  if (req.method === 'POST') {
    const { name, userId } = req.body;
    return authorize(req, res)
      .then((session) => {
        if (userId !== session.userId) {
          res.status(403).send('Invalid userId');
          throw new Error('invalid userId');
        }
      })
      .then(() => db.collection('events').add({
        name,
        userId,
        token: crypto.randomBytes(16).toString('base64'),
      }))
      .then(eventRef => eventRef.get())
      .then(eventSnap => res.json({ id: eventSnap.id, ...eventSnap.data() }))
  }

  if (req.method === 'DELETE') {
    const id = decodeURIComponent(req.url.split('/')[1]);
    return authorize(req, res)
      .then(session =>
        db.collection('events').doc(id).get()
          .then((eventSnap) => {
            if (eventSnap.data().userId !== session.userId) {
              res.status(403).send('Invalid userId');
              throw new Error('invalid userId');
            }
            return eventSnap.ref.delete();
          })
      )
      .then(() => res.status(204).send());
  }

  res.status(405).send();
};
