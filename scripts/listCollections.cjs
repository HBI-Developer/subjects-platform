const admin = require("firebase-admin");
const svc = require("../data/firebase_keys.json");

admin.initializeApp({ credential: admin.credential.cert(svc) });

admin
  .firestore()
  .listCollections()
  .then((cols) => {
    console.log(
      "collections:",
      cols.map((c) => c.id)
    );
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error listing collections:", err);
    process.exit(1);
  });
