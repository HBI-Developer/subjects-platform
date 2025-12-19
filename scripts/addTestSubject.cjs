const admin = require("firebase-admin");
const svc = require("../data/firebase_keys.json");

admin.initializeApp({ credential: admin.credential.cert(svc) });

admin
  .firestore()
  .collection("subjects")
  .add({ name: "test-subject-" + Date.now() })
  .then((docRef) => {
    console.log("added subject:", docRef.id);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error adding test subject:", err);
    process.exit(1);
  });
