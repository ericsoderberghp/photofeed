const Firestore = require('@google-cloud/firestore');

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
exports.photos = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST, DELETE');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }

  if (req.method === 'POST') {
    const { name, type, date, src, aspectRatio, userId, eventId } = req.body;
    return authorize(req, res)
      .then((session) => {
        if (session.userId !== userId) {
          res.status(403).send();
          throw new Error('not authorized');
        }
      })
      .then(() => db.collection('photos').add({
        name, type, date, src, aspectRatio, userId, eventId,
        created: (new Date()).toISOString(),
      }))
      .then(photoRef => photoRef.get())
      .then(photoSnap => res.json({ id: photoSnap.id, ...photoSnap.data() }))
  }

  if (req.method === 'DELETE') {
    const id = decodeURIComponent(req.url.split('/')[1]);
    return authorize(req, res)
      .then(session =>
        db.collection('photos').doc(id).get()
          .then((photoSnap) => {
            if (photoSnap.data().userId !== session.userId || !session.admin) {
              res.status(403).send('Invalid userId');
              throw new Error('invalid userId');
            }
            return photoSnap.ref.delete();
          })
      )
      .then(() => res.status(204).send());
  }

  res.status(405).send();
};
