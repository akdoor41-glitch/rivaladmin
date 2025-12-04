// api/sendAdminPush.js  (for Vercel serverless)
// Save this as api/sendAdminPush.js in your project (Vercel). It reads adminFcmTokens from Realtime DB
// and sends push notifications using firebase-admin. Set SERVICE_ACCOUNT_JSON env var in Vercel.
const admin = require('firebase-admin');

let serviceAccount = {};
try {
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON || '{}');
} catch (e) {
  console.error('SERVICE_ACCOUNT_JSON parse error', e);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://aj-esports-ae4bd-default-rtdb.firebaseio.com",
  });
}

const db = admin.database();
const messaging = admin.messaging();

module.exports = async (req, res) => {
  try {
    // Accept both POST JSON body and query params for quick tests
    const payloadTitle = (req.method === 'POST' && req.body && req.body.title) ? req.body.title : (req.query.title || 'Notification');
    const payloadBody = (req.method === 'POST' && req.body && req.body.body) ? req.body.body : (req.query.body || '');
    const data = (req.method === 'POST' && req.body && req.body.data) ? req.body.data : (req.query.data ? JSON.parse(req.query.data) : {});

    const snap = await db.ref('adminFcmTokens').once('value');
    const tokens = [];
    snap.forEach(adminNode => {
      adminNode.forEach(tokenNode => {
        tokens.push(tokenNode.key);
      });
    });

    if (!tokens.length) {
      return res.status(200).json({ message: 'No admin tokens found' });
    }

    const message = {
      notification: { title: payloadTitle, body: payloadBody },
      data: Object.keys(data || {}).reduce((acc, k) => { acc[k] = String(data[k]); return acc; }, {}),
      webpush: {
        fcmOptions: { link: 'https://rivaladmin.vercel.app/' }
      }
    };

    const chunkSize = 500;
    for (let i = 0; i < tokens.length; i += chunkSize) {
      const chunk = tokens.slice(i, i + chunkSize);
      await messaging.sendToDevice(chunk, message);
    }

    return res.status(200).json({ success: true, sent: tokens.length });
  } catch (err) {
    console.error('Error sending admin push:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
};
