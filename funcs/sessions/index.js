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
    const { name, email, password } = req.body;

    const addSession = (userSnap) => {
      const user = userSnap.data();
      return db.collection('sessions').add({
        userId: userSnap.id,
        admin: user.admin || false,
        date: (new Date()).toISOString(),
        token: crypto.randomBytes(64).toString('base64'),
      }).then(sessionRef => sessionRef.get())
        .then(sessionSnap => res.json(sessionSnap.data()));
    }
    
    return db.collection('users').where('email', '==', email).get()
      .then((querySnap) => {
        if (!querySnap.empty) {
          const userSnap = querySnap.docs[0];
          return checkPassword(password, userSnap.data())
            .then(() => addSession(userSnap))
            .catch(() => res.status(403).send())
        }
        return hashPassword(password)
          .then(auth => db.collection('users').add({ name, email, auth }))
          .then(userRef => userRef.get())
          .then(userSnap =>
            // add a personal event for the new user
            db.collection('events').add({
              name,
              adminIds: [userSnap.id],
              shareIds: [],
            })
            .then(() => userSnap))
          .then(userSnap => addSession(userSnap))
      });
  }
  // if (req.method === 'DELETE') {
  //   // TODO: authorize
  //   const id = decodeURIComponent(req.url.split('/')[1]);
  //   return db.collection('sessions').doc(id).delete()
  //     .then(() => res.status(204).send());
  // }
  res.status(405).send();
};
