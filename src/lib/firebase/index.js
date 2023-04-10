const admin = require("firebase-admin");
const firebase = require("firebase");
const config = require("./database");

const serviceAccount = require("./serviceAccount");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
firebase.initializeApp(config);

const db = admin.firestore();
const defaultAuth = admin.auth();

module.exports = { admin, db, defaultAuth, firebase };