const Firestore = require('@google-cloud/firestore');
const { Storage } = require('@google-cloud/storage');
const Busboy = require('busboy');

const db = new Firestore();
const storage = new Storage();
const bucketName = 'photofeed-photos';
const bucket = storage.bucket(bucketName);

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

const getSession = (req) => new Promise((resolve) => {
  const auth = req.get('Authorization');
  if (auth) {
    const token = auth.split(' ')[1];
    if (token) {
      return db.collection('sessions')
        .where('token', '==', token).get()
        .then((querySnap) => {
          if (querySnap.empty) resolve(undefined);
          const session = querySnap.docs[0].data();
          resolve(session);
        });
    }
  }
  resolve(undefined);
})

// can post a photo if site admin, owner of event,
// or holder of event token and the event is unlocked
const authorizedToPost = (req, res, photo) => getSession(req)
  .then((session) => {
    const { eventToken, eventId } = photo;
    if (eventToken) {
      return db.collection('events').where('token', '==', eventToken).get()
        .then(querySnap => {
          if (querySnap.empty) {
            res.status(404).send();
            throw new Error(`no event for ${eventToken}`);
          }
          const event = querySnap.docs[0].data();
          if (event.locked) {
            res.status(403).send('event is locked');
            throw new Error('event is locked');
          }
        });
    }
    return db.collection('events').doc(eventId).get()
      .then(eventSnap => {
        if (!eventSnap.exists) {
          res.status(404).send();
          throw new Error(`no event ${eventId}`);
        }
        const event = eventSnap.data();
        if (!session.admin && session.userId !== event.userId) {
          res.status(403).send();
          throw new Error('not event owner or admin');
        }
      })
  });

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

  if (req.method === 'GET') {
    const id = decodeURIComponent(req.path.split('/')[1] || '');
    if (id) {
      return db.collection('photos').doc(id).get()
        .then(photoSnap => {
          if (!photoSnap.exists) {
            res.status(404).send();
          } else {
            res.json(photoSnap.data());
          }
        });
    }
    if (!req.query.eventId) {
      res.status(400).send();
    } else {
      return db.collection('photos')
        .where('eventId', '==', req.query.eventId)
        .orderBy('date', 'desc').get()
        .then(querySnap =>
          res.json(querySnap.docs.map(photoSnap =>
            ({ id: photoSnap.id, ...photoSnap.data() }))));
    }

  }

  if (req.method === 'POST') {

    return new Promise((resolve, reject) => {
      const busboy = new Busboy({ headers: req.headers });
      let photo;
      let srcFile;
      const pending = [];

      busboy.on('field', (fieldname, val) => {
        if (fieldname === 'photo') {
          photo = JSON.parse(val);
          const {
            name, type, date, aspectRatio, userId, eventId, userName,
          } = photo;
          const savePhoto = {
            name, type, date, aspectRatio, eventId,
            created: (new Date()).toISOString(),
          };
          if (userId) savePhoto.userId = userId;
          if (userName) savePhoto.userName = userName;

          pending.push(authorizedToPost(req, res, photo)
            // add photo            
            .then(() => db.collection('photos').add(savePhoto))
            .then(photoRef => photoRef.get())
            .then(photoSnap => {
              // now that we have an id, we can update the file src
              const id = photoSnap.id;
              const bucketFileName = `${id}.${name.split('.')[1]}`;
              const src = `https://${bucketName}.storage.googleapis.com/${bucketFileName}`;
              photo = { ...photoSnap.data(), id, src }; // so we can respond
              return photoSnap.ref.update({ src })
                .then(() => {
                  const file = bucket.file(bucketFileName);
                  const bucketFileStream = file.createWriteStream({ resumable: false });
                  srcFile.pipe(bucketFileStream);
                  return new Promise((res, rej) => {
                    srcFile.on('end', () => {
                      bucketFileStream.end();
                    });
                    bucketFileStream.on('finish', res);
                    bucketFileStream.on('error', rej);
                  });
                });
              }));
        }
      });
      busboy.on('file', (fieldname, file, filename) => {
        if (fieldname === 'file') {
          srcFile = file;
        }
      });
      busboy.on('finish', () => {
        Promise.all(pending)
          .then(() => {
            // now we should have a path to the file, save that as the src
          })
          .then(() => res.json(photo))
          .then(resolve);
      });
      busboy.end(req.rawBody);
    });
  }

  if (req.method === 'DELETE') {
    const id = decodeURIComponent(req.path.split('/')[1]);
    // get session, TODO: don't require admin to be able to delete
    return authorize(req, res)
      .then(session =>
        // get photo
        db.collection('photos').doc(id).get()
          .then((photoSnap) => {
            const photo = photoSnap.data();
            // get event
            return db.collection('events').doc(photo.eventId).get()
              .then((eventSnap) => {
                const event = eventSnap.data();
                // authorize
                if (!session.admin && event.userId !== session.userId
                  && photo.userId !== session.userId) {
                  res.status(403).send();
                  throw new Error(`user ${session.userId} cannot delete this photo`);
                }
                const parts = photo.src.split('/');
                const bucketFileName = parts[parts.length - 1];
                // delete src file
                return bucket.file(bucketFileName).delete()
                  // delete photo object
                  .then(() => photoSnap.ref.delete());
              });
            })
      )
      .then(() => res.status(204).send());
  }

  res.status(405).send();
};
