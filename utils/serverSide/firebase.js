const admin = require("firebase-admin");

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyDnqdKNJhMXzdH_9xzpOx1LIITcVKTy8js",
//   authDomain: "manga-b8fb3.firebaseapp.com",
//   databaseURL: "https://manga-b8fb3.firebaseio.com",
//   projectId: "manga-b8fb3",
//   storageBucket: "manga-b8fb3.appspot.com",
//   messagingSenderId: "266094841766",
//   appId: "1:266094841766:web:67abf73e5a959ec0b14967",
//   measurementId: "G-1X3975D4XF",
// };

// if (!admin.apps.length) {
//   admin.initializeApp(firebaseConfig);
// } else {
//   admin.app();
// }

// export default admin;

// export default !admin.apps.length
//   ? admin.initializeApp(firebaseConfig)
//   : admin.app();

// To avoid to include the serviceAccountKey.json file in a public repository,
// use a local environment variable GOOGLE_CONFIG_BASE64 to store the project
// configuration. Set variable have to be defined on the host platform.
// Documentation link:
// https://stackoverflow.com/questions/41287108/deploying-firebase-app-with-service-account-to-heroku-environment-variables-wit
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(
          Buffer.from(process.env.GOOGLE_CONFIG_BASE64, "base64").toString(
            "ascii"
          )
        )
      ),
      projectId: "manga-b8fb3",
      storageBucket: "manga-b8fb3.appspot.com",
      messagingSenderId: "266094841766",
      appId: "1:266094841766:web:67abf73e5a959ec0b14967",
      measurementId: "G-1X3975D4XF",
    });
  } catch (error) {
    console.error("Firebase admin initialization error", error.stack);
  }
} else {
  admin.app();
}
// export default admin.firestore();
export default admin;

const db = admin.firestore();
const storage = admin.storage();

module.exports = { db, storage };
